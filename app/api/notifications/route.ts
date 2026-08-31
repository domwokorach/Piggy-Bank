import { NextResponse } from 'next/server'
import { readJson, unauthorized } from '@/lib/api'
import { getAuthenticatedUser } from '@/lib/auth'
import { toPublicNotification } from '@/lib/banking'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()
  const notifications = await prisma.notification.findMany({
    where: { profileId: auth.user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json({ ok: true, notifications: notifications.map(toPublicNotification) })
}

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()
  const body = await readJson(request)
  if (body?.all === true) {
    await prisma.notification.updateMany({ where: { profileId: auth.user.id, read: false }, data: { read: true } })
    return NextResponse.json({ ok: true })
  }
  const id = typeof body?.id === 'string' ? body.id : ''
  if (!id) return NextResponse.json({ ok: false, error: 'Notification id is required.' }, { status: 400 })
  const updated = await prisma.notification.updateMany({ where: { id, profileId: auth.user.id }, data: { read: true } })
  if (!updated.count) return NextResponse.json({ ok: false, error: 'Notification not found.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
