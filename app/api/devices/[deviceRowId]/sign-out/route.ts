import { NextResponse } from 'next/server'
import { getAuthenticatedUser, logAccountEvent, revokeSessionsForDevice } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(_request: Request, { params }: { params: Promise<{ deviceRowId: string }> }) {
  const auth = await getAuthenticatedUser()
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Please log in to continue.' }, { status: 401 })
  }

  const { deviceRowId } = await params
  const device = await prisma.device.findUnique({ where: { id: deviceRowId } })
  if (!device || device.userId !== auth.user.id) {
    return NextResponse.json({ ok: false, error: 'Device not found.' }, { status: 404 })
  }

  await revokeSessionsForDevice(device.id)
  await logAccountEvent(auth.user.id, 'device_signed_out', { deviceLabel: device.label })

  return NextResponse.json({ ok: true, signedOutCurrentDevice: device.id === auth.sessionRow.deviceRowId })
}
