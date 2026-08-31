import { SignJWT, jwtVerify } from 'jose'

const TOKEN_DURATION_SECONDS = 60 * 60 * 24 * 3 // 3 days

function secretKey() {
  return new TextEncoder().encode(process.env.AUTH_SECRET)
}

export type LoginConfirmAction = 'confirm' | 'block'

export async function signLoginConfirmToken(loginEventId: string, action: LoginConfirmAction): Promise<string> {
  return new SignJWT({ purpose: 'login-confirm', action })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(loginEventId)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_DURATION_SECONDS}s`)
    .sign(secretKey())
}

export async function verifyLoginConfirmToken(
  token: string,
): Promise<{ loginEventId: string; action: LoginConfirmAction } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    if (payload.purpose !== 'login-confirm' || typeof payload.sub !== 'string') return null
    if (payload.action !== 'confirm' && payload.action !== 'block') return null
    return { loginEventId: payload.sub, action: payload.action }
  } catch {
    return null
  }
}
