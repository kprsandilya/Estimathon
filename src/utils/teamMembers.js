/**
 * Player membership (approximate: one browser session = one member when they join).
 * @param {object} game
 * @param {string} teamId
 * @returns {{ game: object } | { error: string }}
 */
export function applyTeamJoin(game, teamId) {
  if (!teamId) return { error: 'No team selected.' }
  if (game.gameEnded) return { error: 'The game has ended.' }
  const team = game.teams.find((t) => t.id === teamId)
  if (!team) return { error: 'Team not found.' }

  const count = (team.memberCount ?? 0) + 1
  return {
    game: {
      ...game,
      teams: game.teams.map((t) =>
        t.id === teamId ? { ...t, memberCount: count } : t,
      ),
    },
  }
}

/**
 * Decrement members; remove team and its submissions when count hits 0.
 * @param {object} game
 * @param {string} teamId
 */
export function applyTeamLeave(game, teamId) {
  if (!teamId) return { game }
  const team = game.teams.find((t) => t.id === teamId)
  if (!team) return { game }

  const prev = team.memberCount ?? 0
  if (prev <= 0) {
    return { game }
  }
  const count = prev - 1
  if (count <= 0) {
    const { [teamId]: _removed, ...restSubs } = game.submissions
    return {
      game: {
        ...game,
        teams: game.teams.filter((t) => t.id !== teamId),
        submissions: restSubs,
      },
    }
  }
  return {
    game: {
      ...game,
      teams: game.teams.map((t) =>
        t.id === teamId ? { ...t, memberCount: count } : t,
      ),
    },
  }
}
