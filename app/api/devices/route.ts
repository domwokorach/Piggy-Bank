import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await getAuthenticatedUser()
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Please log in to continue.' }, { status: 401 })
  }

  const devices = await prisma.device.findMany({
    where: { profileId: auth.user.id },
    orderBy: { lastActiveAt: 'desc' },
  })

  return NextResponse.json({
    ok: true,
    devices: devices.map((device) => ({
      id: device.id,
      label: device.label,
      deviceType: device.deviceType,
      os: device.os,
      browser: device.browser,
      model: device.model,
      trusted: device.trusted,
      location:
        device.lastCity && device.lastCountry
          ? `${device.lastCity}, ${device.lastCountry}`
          : (device.lastCountry ?? 'Unknown location'),
      lastActiveAt: device.lastActiveAt.toISOString(),
      isCurrent: device.id === auth.sessionRow.deviceRowId,
    })),
  })
}
