import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSessionForUser, toPublicProfile } from '@/lib/auth'
import { getOrCreateDeviceCookie } from '@/lib/device-cookie'
import { getApproximateLocation } from '@/lib/geolocation'
import { isRateLimited, recentlyAlertedForDevice, recordFailedLogin, resolveDevice } from '@/lib/login-security'
import { getClientIp, maskIp } from '@/lib/request-ip'
import { sendNewLoginAlertEmail } from '@/lib/email'
import { signLoginConfirmToken } from '@/lib/security-tokens'
import { formatDate, formatTime } from '@/lib/utils'
import type { NativeDeviceInfo } from '@/lib/device'

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent')

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many login attempts. Please wait a few minutes and try again.' },
      { status: 429 },
    )
  }

  const { identifier, password, nativeDevice } = (await request.json()) ?? {}

  if (!identifier || !password) {
    return NextResponse.json({ ok: false, error: 'Enter your username or email and password.' }, { status: 400 })
  }

  const trimmed = String(identifier).trim()
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: trimmed.toLowerCase() }, { username: { equals: trimmed, mode: 'insensitive' } }] },
  })

  if (!user) {
    await recordFailedLogin(ip, null, userAgent)
    return NextResponse.json({ ok: false, error: 'We could not find an account with those details.' }, { status: 401 })
  }

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) {
    await recordFailedLogin(ip, user.id, userAgent)
    return NextResponse.json({ ok: false, error: 'Incorrect password. Please try again.' }, { status: 401 })
  }

  if (user.status === 'CLOSED') {
    return NextResponse.json({ ok: false, error: 'This account has been closed.' }, { status: 403 })
  }

  if (!user.emailVerified) {
    return NextResponse.json({ ok: false, error: 'Please verify your email before logging in.' }, { status: 403 })
  }

  if (user.mustResetPassword) {
    return NextResponse.json(
      { ok: false, error: 'For your security, please reset your password before logging in.', code: 'RESET_REQUIRED' },
      { status: 403 },
    )
  }

  const deviceCookieId = await getOrCreateDeviceCookie()
  const native: NativeDeviceInfo | undefined =
    nativeDevice && typeof nativeDevice === 'object' ? (nativeDevice as NativeDeviceInfo) : undefined
  const { device, isNewDevice } = await resolveDevice(user.id, deviceCookieId, userAgent, native)
  const location = await getApproximateLocation(ip)

  await prisma.device.update({
    where: { id: device.id },
    data: { lastIp: ip, lastCity: location.city, lastCountry: location.country, lastActiveAt: new Date() },
  })

  const sessionId = await createSessionForUser(user.id, { deviceRowId: device.id, ip, userAgent: userAgent ?? undefined })
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  const loginEvent = await prisma.loginEvent.create({
    data: {
      userId: user.id,
      deviceRowId: device.id,
      sessionId,
      status: 'SUCCESS',
      isNewDevice,
      ip,
      city: location.city,
      country: location.country,
      userAgent,
      os: device.os,
      browser: device.browser,
      deviceType: device.deviceType,
    },
  })

  if (isNewDevice && !(await recentlyAlertedForDevice(device.id))) {
    try {
      const now = new Date()
      const confirmToken = await signLoginConfirmToken(loginEvent.id, 'confirm')
      const blockToken = await signLoginConfirmToken(loginEvent.id, 'block')
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin

      await sendNewLoginAlertEmail(
        user.email,
        user.firstName,
        {
          date: formatDate(now.toISOString()),
          time: formatTime(now.toISOString()),
          location: location.city && location.country ? `${location.city}, ${location.country}` : 'Unknown location',
          deviceLabel: device.label,
          os: device.os ?? 'Unknown',
          browser: device.browser ?? 'Unknown',
          maskedIp: maskIp(ip),
        },
        `${baseUrl}/api/security/confirm-login?token=${confirmToken}`,
        `${baseUrl}/api/security/confirm-login?token=${blockToken}`,
      )
    } catch (error) {
      console.error('[login] failed to send new login alert email', error)
    }
  }

  return NextResponse.json({ ok: true, parent: toPublicProfile(user) })
}
