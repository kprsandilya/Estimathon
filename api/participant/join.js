import { getJsonBody } from '../lib/body.js'
import { readGame, writeGame } from '../lib/game-store.js'
import { applyTeamJoin } from '../../src/utils/teamMembers.js'

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

  const teamId = typeof body.teamId === 'string' ? body.teamId : ''
  const game = await readGame()
  const result = applyTeamJoin(game, teamId)
  if (result.error) {
    return res.status(400).json({ error: result.error })
  }
  await writeGame(result.game)
  return res.status(200).json({ ok: true })
}
