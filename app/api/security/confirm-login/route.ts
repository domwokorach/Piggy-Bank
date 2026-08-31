import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAccountEvent, revokeAllSessionsForUser, revokeSession } from '@/lib/auth'
import { verifyLoginConfirmToken } from '@/lib/security-tokens'
import { sendSecurityAlertBlockedEmail } from '@/lib/email'

function redirectTo(request: Request, result: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin
  return NextResponse.redirect(`${baseUrl}/security/confirmed?result=${result}`)
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return redirectTo(request, 'invalid')

  const verified = await verifyLoginConfirmToken(token)
  if (!verified) return redirectTo(request, 'invalid')

  const loginEvent = await prisma.loginEvent.findUnique({ where: { id: verified.loginEventId } })
  if (!loginEvent || !loginEvent.userId) return redirectTo(request, 'invalid')

  if (loginEvent.confirmedAt) {
    return redirectTo(request, loginEvent.confirmedAsSelf ? 'already-confirmed' : 'already-blocked')
  }

  const user = await prisma.user.findUnique({ where: { id: loginEvent.userId } })
  if (!user) return redirectTo(request, 'invalid')

  if (verified.action === 'confirm') {
    if (loginEvent.deviceRowId) {
      await prisma.device.update({
        where: { id: loginEvent.deviceRowId },
        data: { trusted: true, confirmedAt: new Date(), blockedAt: null },
      })
    }
    await prisma.loginEvent.update({
      where: { id: loginEvent.id },
      data: { confirmedAt: new Date(), confirmedAsSelf: true },
    })
    await logAccountEvent(user.id, 'login_confirmed_self', { loginEventId: loginEvent.id })
    return redirectTo(request, 'confirmed')
  }

  // action === 'block'
  if (loginEvent.sessionId) {
    await revokeSession(loginEvent.sessionId)
  }
  await revokeAllSessionsForUser(user.id)

  if (loginEvent.deviceRowId) {
    await prisma.device.update({
      where: { id: loginEvent.deviceRowId },
      data: { trusted: false, blockedAt: new Date(), confirmedAt: null },
    })
  }

  await prisma.user.update({ where: { id: user.id }, data: { mustResetPassword: true } })
  await prisma.loginEvent.update({
    where: { id: loginEvent.id },
    data: { confirmedAt: new Date(), confirmedAsSelf: false },
  })
  await logAccountEvent(user.id, 'login_blocked_by_user', { loginEventId: loginEvent.id })

  try {
    await sendSecurityAlertBlockedEmail(user.email, user.firstName)
  } catch (error) {
    console.error('[security/confirm-login] failed to send security confirmation email', error)
  }

  return redirectTo(request, 'blocked')
}
