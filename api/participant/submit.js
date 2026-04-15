import { getJsonBody } from '../lib/body.js'
import { readGame, writeGame } from '../lib/game-store.js'
import { computeSubmissionUpdate } from '../../src/utils/submissionApply.js'

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

  const {
    teamId,
    questionId,
    aBox,
    bBox,
    aUnit,
    bUnit,
    bOffset,
  } = body

  const game = readGame()
  const result = computeSubmissionUpdate(game, {
    teamId,
    questionId,
    aBox: Number(aBox),
    bBox: Number(bBox),
    aUnit,
    bUnit,
    bOffset: Boolean(bOffset),
  })

  if (result.error) {
    return res.status(400).json({ error: result.error })
  }

  writeGame(result.game)
  return res.status(200).json({ ok: true })
}
