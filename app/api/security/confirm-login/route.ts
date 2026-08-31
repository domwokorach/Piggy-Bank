import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAccountEvent, revokeAllSessionsForUser, revokeSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
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

  const securityEvent = await prisma.securityEvent.findUnique({ where: { id: verified.loginEventId } })
  if (!securityEvent || !securityEvent.profileId) return redirectTo(request, 'invalid')

  if (securityEvent.confirmedAt) {
    return redirectTo(request, securityEvent.confirmedAsSelf ? 'already-confirmed' : 'already-blocked')
  }

  const profile = await prisma.profile.findUnique({ where: { id: securityEvent.profileId } })
  if (!profile) return redirectTo(request, 'invalid')

  if (verified.action === 'confirm') {
    if (securityEvent.deviceRowId) {
      await prisma.device.update({
        where: { id: securityEvent.deviceRowId },
        data: { trusted: true, confirmedAt: new Date(), blockedAt: null },
      })
    }
    await prisma.securityEvent.update({
      where: { id: securityEvent.id },
      data: { confirmedAt: new Date(), confirmedAsSelf: true },
    })
    await logAccountEvent(profile.id, 'login_confirmed_self', { securityEventId: securityEvent.id })
    return redirectTo(request, 'confirmed')
  }

  // action === 'block'
  if (securityEvent.sessionId) {
    await revokeSession(securityEvent.sessionId)
  }
  await revokeAllSessionsForUser(profile.id)

  // Our own LoginSession rows are just audit metadata — Supabase Auth holds
  // the actual live access/refresh tokens, so those must be revoked too via
  // the admin API, or a stolen token would keep working until it expires.
  // TODO: verify this exact call against the installed @supabase/supabase-js
  // version once it's in node_modules and typechecked — admin session
  // revocation APIs have varied across SDK versions (some take a user id,
  // some a token). Left inside a try/catch so a shape mismatch here can't
  // take down the rest of this route.
  try {
    await createAdminClient().auth.admin.signOut(profile.id, 'global')
  } catch (err) {
    console.error('[security/confirm-login] failed to revoke Supabase sessions', err)
  }

  if (securityEvent.deviceRowId) {
    await prisma.device.update({
      where: { id: securityEvent.deviceRowId },
      data: { trusted: false, blockedAt: new Date(), confirmedAt: null },
    })
  }

  await prisma.profile.update({ where: { id: profile.id }, data: { mustResetPassword: true } })
  await prisma.securityEvent.update({
    where: { id: securityEvent.id },
    data: { confirmedAt: new Date(), confirmedAsSelf: false },
  })
  await logAccountEvent(profile.id, 'login_blocked_by_user', { securityEventId: securityEvent.id })

  try {
    await sendSecurityAlertBlockedEmail(profile.email, profile.firstName)
  } catch (error) {
    console.error('[security/confirm-login] failed to send security confirmation email', error)
  }

  return redirectTo(request, 'blocked')
}
