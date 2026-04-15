export const PARTICIPANT_TEAM_KEY = 'estimathon-participant-team-id'

/** Dedupes client-side "join" sync with server per tab session. */
export const SESSION_JOIN_KEY = 'estimathon-session-joined-team'

export function getSavedTeamId() {
  try {
    return localStorage.getItem(PARTICIPANT_TEAM_KEY)
  } catch {
    return null
  }
}

export function setSavedTeamId(id) {
  try {
    if (id) localStorage.setItem(PARTICIPANT_TEAM_KEY, id)
    else localStorage.removeItem(PARTICIPANT_TEAM_KEY)
  } catch {
    /* ignore */
  }
}
