import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { toPublicProfile } from '@/lib/auth'
import { createSession } from '@/lib/session'

export async function POST(request: Request) {
  const { identifier, password } = (await request.json()) ?? {}

  if (!identifier || !password) {
    return NextResponse.json({ ok: false, error: 'Enter your username or email and password.' }, { status: 400 })
  }

  const trimmed = String(identifier).trim()
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: trimmed.toLowerCase() }, { username: { equals: trimmed, mode: 'insensitive' } }] },
  })

  if (!user) {
    return NextResponse.json({ ok: false, error: 'We could not find an account with those details.' }, { status: 401 })
  }

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) {
    return NextResponse.json({ ok: false, error: 'Incorrect password. Please try again.' }, { status: 401 })
  }

  if (user.status === 'CLOSED') {
    return NextResponse.json({ ok: false, error: 'This account has been closed.' }, { status: 403 })
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { ok: false, error: 'Please verify your email before logging in.' },
      { status: 403 },
    )
  }

  await createSession(user.id, user.sessionVersion)
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  return NextResponse.json({ ok: true, parent: toPublicProfile(user) })
}
