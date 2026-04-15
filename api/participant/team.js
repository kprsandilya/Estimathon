import { getJsonBody } from '../lib/body.js'
import { readGame, writeGame } from '../lib/game-store.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let body
  try {
    body = await getJsonBody(req)
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (name.length < 1 || name.length > 120) {
    return res.status(400).json({ error: 'Team name must be 1–120 characters.' })
  }

  const game = readGame()
  if (game.gameEnded) {
    return res.status(403).json({ error: 'The game has ended.' })
  }

  const id = crypto.randomUUID()
  const next = {
    ...game,
    teams: [
      ...game.teams,
      { id, name, remainingSubmissions: 18, memberCount: 1 },
    ],
  }
  writeGame(next)
  return res.status(200).json({ ok: true, teamId: id })
}
