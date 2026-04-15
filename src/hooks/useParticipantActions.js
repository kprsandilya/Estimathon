import { useCallback } from 'react'
import { computeSubmissionUpdate } from '../utils/submissionApply'
import { useGame } from './useGame'

export function useParticipantActions() {
  const { game, setGame, isRemote, refresh } = useGame()

  const createTeam = useCallback(
    async (nameRaw) => {
      const name = String(nameRaw || '').trim()
      if (!name) return { error: 'Enter a team name.' }
      if (game.gameEnded) return { error: 'The game has ended.' }

      if (isRemote) {
        const r = await fetch('/api/participant/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        const data = await r.json().catch(() => ({}))
        if (!r.ok) return { error: data.error || 'Could not create team.' }
        await refresh()
        return { teamId: data.teamId }
      }

      const id = crypto.randomUUID()
      setGame((g) => ({
        ...g,
        teams: [...g.teams, { id, name, remainingSubmissions: 18 }],
      }))
      return { teamId: id }
    },
    [game.gameEnded, isRemote, refresh, setGame],
  )

  const submitAnswer = useCallback(
    async (input) => {
      if (isRemote) {
        const r = await fetch('/api/participant/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
        const data = await r.json().catch(() => ({}))
        if (!r.ok) return { error: data.error || 'Submit failed.' }
        await refresh()
        return {}
      }

      const result = computeSubmissionUpdate(game, input)
      if (result.error) return { error: result.error }
      setGame(result.game)
      return {}
    },
    [game, isRemote, refresh, setGame],
  )

  return { createTeam, submitAnswer }
}
