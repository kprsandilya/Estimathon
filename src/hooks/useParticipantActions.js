import { useCallback } from 'react'
import { computeSubmissionUpdate } from '../utils/submissionApply'
import { applyTeamJoin, applyTeamLeave } from '../utils/teamMembers'
import { useGame } from './useGame'

async function postJson(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, data }
}

export function useParticipantActions() {
  const { game, setGame, isRemote, refresh } = useGame()

  const joinTeam = useCallback(
    async (teamId) => {
      if (!teamId) return { error: 'No team.' }
      if (isRemote) {
        const { ok, data } = await postJson('/api/participant/join', { teamId })
        if (!ok) return { error: data.error || 'Could not join team.' }
        await refresh()
        return {}
      }
      const result = applyTeamJoin(game, teamId)
      if (result.error) return { error: result.error }
      setGame(result.game)
      return {}
    },
    [game, isRemote, refresh, setGame],
  )

  const leaveTeam = useCallback(
    async (teamId) => {
      if (!teamId) return {}
      if (isRemote) {
        const { ok } = await postJson('/api/participant/leave', { teamId })
        if (!ok) return { error: 'Could not leave team.' }
        await refresh()
        return {}
      }
      setGame((g) => applyTeamLeave(g, teamId).game)
      return {}
    },
    [isRemote, refresh, setGame],
  )

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
        teams: [
          ...g.teams,
          { id, name, remainingSubmissions: 18, memberCount: 1 },
        ],
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

  return { createTeam, joinTeam, leaveTeam, submitAnswer }
}
