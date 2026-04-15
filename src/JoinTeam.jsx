import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from './hooks/useGame'
import { getSavedTeamId, setSavedTeamId } from './participantTeam'

export default function JoinTeam() {
  const { game, gameLoading } = useGame()
  const { teams } = game
  const [teamId, setTeamId] = useState(() => getSavedTeamId() || '')

  const save = (e) => {
    e.preventDefault()
    setSavedTeamId(teamId || '')
  }

  const picked = teams.find((t) => t.id === teamId)

  return (
    <div className="control join-team">
      <h1>Join your team</h1>
      <p className="join-team-lead">
        Choose the team you are playing for. This is saved in your browser until you change it.
      </p>
      {gameLoading && <p className="form-msg">Loading teams…</p>}
      <form className="join-team-form" onSubmit={save}>
        <label>
          Team
          <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            <option value="">— Select —</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Save</button>
      </form>
      {picked && (
        <p className="join-team-status">
          You are signed in as <strong>{picked.name}</strong>.
        </p>
      )}
      <p className="join-team-links">
        <Link to="/display">Open scoreboard</Link>
        {' · '}
        <Link to="/control">Admin</Link>
      </p>
    </div>
  )
}
