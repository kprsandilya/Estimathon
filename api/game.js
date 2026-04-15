import { createInitialGame } from './initial-game.js'
import { getJsonBody } from './lib/body.js'
import { readGame, writeGame } from './lib/game-store.js'
import { isAdminRequest } from './lib/session.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'GET') {
    try {
      const game = readGame()
      return res.status(200).json({ game })
    } catch (e) {
      console.error('readGame', e)
      return res.status(500).json({
        error: 'Failed to read game',
        game: createInitialGame(),
      })
    }
  }

  if (req.method === 'POST') {
    if (!isAdminRequest(req)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    try {
      const body = await getJsonBody(req)
      if (!body || typeof body.game !== 'object' || body.game === null) {
        return res.status(400).json({ error: 'Invalid body' })
      }
      writeGame(body.game)
      return res.status(200).json({ ok: true })
    } catch (e) {
      console.error('writeGame', e)
      return res.status(500).json({ error: 'Save failed' })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
