import crypto from 'node:crypto'

export const ADMIN_COOKIE = 'estimathon_admin'

export function parseCookies(cookieHeader) {
  const out = {}
  if (!cookieHeader || typeof cookieHeader !== 'string') return out
  for (const part of cookieHeader.split(';')) {
    const i = part.indexOf('=')
    if (i === -1) continue
    const k = part.slice(0, i).trim()
    const v = part.slice(i + 1).trim()
    try {
      out[k] = decodeURIComponent(v)
    } catch {
      out[k] = v
    }
  }
  return out
}

export function createAdminToken() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 16) return null
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url')
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyAdminToken(token) {
  const secret = process.env.SESSION_SECRET
  if (!secret || !token || typeof token !== 'string') return false
  const dot = token.indexOf('.')
  if (dot === -1) return false
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  if (!crypto.timingSafeEqual(a, b)) return false
  try {
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof json.exp === 'number' && Date.now() < json.exp
  } catch {
    return false
  }
}

export function adminCookieHeader(token) {
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
  const parts = [
    `${ADMIN_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'Max-Age=604800',
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

export function clearAdminCookieHeader() {
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
  const parts = [`${ADMIN_COOKIE}=`, 'Path=/', 'Max-Age=0', 'HttpOnly', 'SameSite=Lax']
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

export function isAdminRequest(req) {
  const cookies = parseCookies(req.headers.cookie)
  return verifyAdminToken(cookies[ADMIN_COOKIE])
}
