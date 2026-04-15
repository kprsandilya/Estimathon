import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from './hooks/useGame'
import { useParticipantActions } from './hooks/useParticipantActions'
import ParticipantAnswerForm from './ParticipantAnswerForm'
import { SESSION_JOIN_KEY, getSavedTeamId, setSavedTeamId } from './participantTeam'

export default function JoinTeam() {
  const { game, gameLoading, isRemote } = useGame()
  const { teams } = game
  const { createTeam, joinTeam, leaveTeam } = useParticipantActions()

  const [membershipId, setMembershipId] = useState(() => getSavedTeamId() || '')
  const [selectedTeamId, setSelectedTeamId] = useState(() => getSavedTeamId() || '')
  const [newTeamName, setNewTeamName] = useState('')
  const [createMsg, setCreateMsg] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)

  const onTeam = teams.find((t) => t.id === membershipId)
  /** Server list can be briefly empty while polling; avoid hiding “your team” during that window. */
  const remoteRecovering =
    isRemote &&
    Boolean(membershipId) &&
    !onTeam &&
    !gameLoading &&
    teams.length === 0
  const hasMembership = Boolean((membershipId && onTeam) || remoteRecovering)

  useEffect(() => {
    const saved = getSavedTeamId()
    if (!saved) return
    if (teams.length === 0) return
    if (teams.some((t) => t.id === saved)) return
    const id = setTimeout(() => {
      setSavedTeamId('')
      setMembershipId('')
      setSelectedTeamId('')
      try {
        sessionStorage.removeItem(SESSION_JOIN_KEY)
      } catch {
        /* ignore */
      }
    }, 0)
    return () => clearTimeout(id)
  }, [teams])

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    if (hasMembership) return
    setCreateMsg('')
    const nm = newTeamName.trim()
    setCreating(true)
    const result = await createTeam(nm)
    setCreating(false)
    if (result.error) {
      setCreateMsg(result.error)
      return
    }
    setNewTeamName('')
    if (result.teamId) {
      setMembershipId(result.teamId)
      setSelectedTeamId(result.teamId)
      setSavedTeamId(result.teamId)
      try {
        sessionStorage.setItem(SESSION_JOIN_KEY, result.teamId)
      } catch {
        /* ignore */
      }
      setCreateMsg(`Created "${nm}". You're the first member.`)
    }
  }

  const handleSaveSelection = async (e) => {
    e.preventDefault()
    setSaveMsg('')
    const prev = membershipId
    const next = selectedTeamId || ''

    if (prev === next) {
      setSavedTeamId(next)
      setSaveMsg('No change.')
      return
    }

    setBusy(true)
    if (prev) {
      const left = await leaveTeam(prev)
      if (left.error) {
        setSaveMsg(left.error)
        setBusy(false)
        return
      }
    }
    if (next) {
      const joined = await joinTeam(next)
      if (joined.error) {
        setSaveMsg(joined.error)
        setBusy(false)
        return
      }
    }

    setMembershipId(next)
    setSelectedTeamId(next)
    setSavedTeamId(next)
    try {
      if (next) sessionStorage.setItem(SESSION_JOIN_KEY, next)
      else sessionStorage.removeItem(SESSION_JOIN_KEY)
    } catch {
      /* ignore */
    }
    setBusy(false)
    setSaveMsg(next ? `You're on your new team.` : 'Left team.')
  }

  const handleLeave = async () => {
    if (!membershipId) return
    setSaveMsg('')
    setBusy(true)
    const r = await leaveTeam(membershipId)
    setBusy(false)
    if (r.error) {
      setSaveMsg(r.error)
      return
    }
    setMembershipId('')
    setSelectedTeamId('')
    setSavedTeamId('')
    try {
      sessionStorage.removeItem(SESSION_JOIN_KEY)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="control join-team" data-game-mode={isRemote ? 'remote' : 'local'}>
      {isRemote ? (
        <div className="join-mode-banner join-mode-banner--remote" role="status">
          <strong>Live game</strong> — teams and scores come from the server (in-memory API, not
          your browser). Everyone sees the same leaderboard after each refresh.
        </div>
      ) : (
        <div className="join-mode-banner join-mode-banner--local" role="status">
          <strong>This browser only</strong> — set <code>VITE_USE_REMOTE_GAME=true</code> at build
          time and redeploy so all devices share one game on the server.
        </div>
      )}
      <h1>Player</h1>
      <p className="join-team-lead">
        Join one team at a time. Your team id is saved in this browser; the live roster and scores
        come from the server when live mode is on. Submissions left are shared by everyone on your
        team.
      </p>
      {gameLoading && <p className="form-msg">Loading…</p>}
      {remoteRecovering && (
        <p className="form-msg">Syncing team list from the server…</p>
      )}

      {!hasMembership && (
        <section className="panel join-section">
          <h2>Create a team</h2>
          <p className="join-team-hint">
            Start a new team (you’ll be its first member). To create another team later, leave your
            current team first.
          </p>
          <form className="inline-row wrap" onSubmit={handleCreateTeam}>
            <input
              placeholder="New team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              disabled={creating || Boolean(game.gameEnded)}
              maxLength={120}
            />
            <button type="submit" disabled={creating || Boolean(game.gameEnded)}>
              {creating ? 'Creating…' : 'Create team'}
            </button>
          </form>
          {createMsg && <p className="form-msg">{createMsg}</p>}
        </section>
      )}

      {hasMembership && (
        <section className="panel join-section join-your-team-card">
          <h2>Your team</h2>
          <div className="join-team-highlight">
            <p className="join-team-you-are">
              You are on{' '}
              <strong>{onTeam?.name ?? '…'}</strong>
            </p>
            <p className="join-team-stats">
              <span className="join-team-stat">
                Submissions remaining:{' '}
                <strong>{onTeam?.remainingSubmissions ?? '—'}</strong>
              </span>
              {onTeam != null && (onTeam.memberCount ?? 0) > 0 && (
                <span className="join-team-stat">
                  Members registered: <strong>{onTeam.memberCount}</strong>
                </span>
              )}
            </p>
            <button
              type="button"
              className="btn-danger join-leave-btn"
              onClick={handleLeave}
              disabled={busy || Boolean(game.gameEnded)}
            >
              Leave this team
            </button>
            <p className="join-team-hint join-leave-hint">
              Leaving removes you as a member. If no one is left on the team, it is deleted.
            </p>
          </div>
        </section>
      )}

      {!hasMembership && (
        <section className="panel join-section">
          <h2>Join an existing team</h2>
          <form className="join-team-form" onSubmit={handleSaveSelection}>
            <label>
              Team
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                disabled={busy}
              >
                <option value="">— Select —</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.remainingSubmissions} submissions left
                    {(t.memberCount ?? 0) > 0 ? ` · ${t.memberCount} member(s)` : ''})
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={busy || Boolean(game.gameEnded)}>
              {busy ? 'Saving…' : 'Save selection'}
            </button>
          </form>
          {saveMsg && <p className="form-msg">{saveMsg}</p>}
        </section>
      )}

      {hasMembership && (
        <section className="panel join-section join-switch-section">
          <h2>Switch team</h2>
          <p className="join-team-hint">
            Pick another team and save — you’ll leave <strong>{onTeam?.name}</strong> first.
          </p>
          <form className="join-team-form" onSubmit={handleSaveSelection}>
            <label>
              Team
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                disabled={busy}
              >
                <option value="">— Select —</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.remainingSubmissions} submissions left)
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={busy || Boolean(game.gameEnded)}>
              {busy ? 'Saving…' : 'Switch to this team'}
            </button>
          </form>
          {saveMsg && <p className="form-msg">{saveMsg}</p>}
        </section>
      )}

      <ParticipantAnswerForm teamId={membershipId} team={onTeam} />

      <p className="join-team-links">
        <Link to="/display">Open scoreboard</Link>
        {' · '}
        <Link to="/control">Admin</Link>
      </p>
    </div>
  )
}
