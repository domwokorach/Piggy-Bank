import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { createLoginSessionForUser, toPublicProfile } from '@/lib/auth'
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

  // Supabase Auth signs in by email only — resolve a username to its email first.
  const candidate = await prisma.profile.findFirst({
    where: { OR: [{ email: trimmed.toLowerCase() }, { username: { equals: trimmed, mode: 'insensitive' } }] },
  })

  if (!candidate) {
    await recordFailedLogin(ip, null, userAgent)
    return NextResponse.json({ ok: false, error: 'We could not find an account with those details.' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email: candidate.email, password })

  if (error || !data.user) {
    await recordFailedLogin(ip, candidate.id, userAgent)
    return NextResponse.json({ ok: false, error: 'Incorrect password. Please try again.' }, { status: 401 })
  }

  const profile = candidate

  if (profile.status === 'CLOSED') {
    await supabase.auth.signOut()
    return NextResponse.json({ ok: false, error: 'This account has been closed.' }, { status: 403 })
  }

  if (profile.status === 'PENDING') {
    await supabase.auth.signOut()
    return NextResponse.json({ ok: false, error: 'Please verify your email before logging in.' }, { status: 403 })
  }

  if (profile.mustResetPassword) {
    await supabase.auth.signOut()
    return NextResponse.json(
      { ok: false, error: 'For your security, please reset your password before logging in.', code: 'RESET_REQUIRED' },
      { status: 403 },
    )
  }

  const deviceCookieId = await getOrCreateDeviceCookie()
  const native: NativeDeviceInfo | undefined =
    nativeDevice && typeof nativeDevice === 'object' ? (nativeDevice as NativeDeviceInfo) : undefined
  const { device, isNewDevice, isSuspicious } = await resolveDevice(profile.id, deviceCookieId, userAgent, native)
  const location = await getApproximateLocation(ip)

  await prisma.device.update({
    where: { id: device.id },
    data: { lastIp: ip, lastCity: location.city, lastCountry: location.country, lastActiveAt: new Date() },
  })

  const sessionId = await createLoginSessionForUser(profile.id, {
    deviceRowId: device.id,
    ip,
    userAgent: userAgent ?? undefined,
  })
  await prisma.profile.update({ where: { id: profile.id }, data: { lastLoginAt: new Date() } })

  const securityEvent = await prisma.securityEvent.create({
    data: {
      profileId: profile.id,
      deviceRowId: device.id,
      sessionId,
      type: 'login_success',
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

  let security:
    | {
        isSuspicious: boolean
        deviceLabel: string
        location: string
        dateTime: string
        confirmUrl: string
        blockUrl: string
      }
    | undefined

  if (isNewDevice) {
    const now = new Date()
    const confirmToken = await signLoginConfirmToken(securityEvent.id, 'confirm')
    const blockToken = await signLoginConfirmToken(securityEvent.id, 'block')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin
    const confirmUrl = `${baseUrl}/api/security/confirm-login?token=${confirmToken}`
    const blockUrl = `${baseUrl}/api/security/confirm-login?token=${blockToken}`
    const resolvedLocation =
      location.city && location.country ? `${location.city}, ${location.country}` : 'Unknown location'

    security = {
      isSuspicious,
      deviceLabel: device.label,
      location: resolvedLocation,
      dateTime: `${formatDate(now.toISOString())} · ${formatTime(now.toISOString())}`,
      confirmUrl,
      blockUrl,
    }

    if (!(await recentlyAlertedForDevice(device.id))) {
      try {
        await sendNewLoginAlertEmail(
          profile.email,
          profile.firstName,
          {
            date: formatDate(now.toISOString()),
            time: formatTime(now.toISOString()),
            location: resolvedLocation,
            deviceLabel: device.label,
            os: device.os ?? 'Unknown',
            browser: device.browser ?? 'Unknown',
            maskedIp: maskIp(ip),
          },
          confirmUrl,
          blockUrl,
        )
      } catch (err) {
        console.error('[login] failed to send new login alert email', err)
      }
    }
  }

  return NextResponse.json({ ok: true, parent: toPublicProfile(profile), security })
}
