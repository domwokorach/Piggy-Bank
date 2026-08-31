import { NextResponse } from 'next/server'

export function unauthorized() {
  return NextResponse.json({ ok: false, error: 'Please log in to continue.' }, { status: 401 })
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json()
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}
