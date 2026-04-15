import { getJsonBody } from '../lib/body.js'
import { adminCookieHeader, createAdminToken } from '../lib/session.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const admin = process.env.ADMIN_PASSWORD
  if (!admin || admin.length < 4) {
    return res.status(503).json({ error: 'Server not configured' })
  }

  let body
  try {
    body = await getJsonBody(req)
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const pw = body?.password
  if (typeof pw !== 'string' || pw !== admin) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  const token = createAdminToken()
  if (!token) {
    return res.status(503).json({ error: 'SESSION_SECRET missing or too short' })
  }

  res.setHeader('Set-Cookie', adminCookieHeader(token))
  return res.status(200).json({ ok: true })
}
