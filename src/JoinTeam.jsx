import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from './hooks/useGame'
import { useParticipantActions } from './hooks/useParticipantActions'
import ParticipantAnswerForm from './ParticipantAnswerForm'
import { getSavedTeamId, setSavedTeamId } from './participantTeam'

export default function JoinTeam() {
  const { game, gameLoading } = useGame()
  const { teams } = game
  const { createTeam } = useParticipantActions()

  const [teamId, setTeamId] = useState(() => getSavedTeamId() || '')
  const [newTeamName, setNewTeamName] = useState('')
  const [createMsg, setCreateMsg] = useState('')
  const [creating, setCreating] = useState(false)

  const saveTeamChoice = (e) => {
    e.preventDefault()
    setSavedTeamId(teamId || '')
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
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
      setTeamId(result.teamId)
      setSavedTeamId(result.teamId)
      setCreateMsg(`Team created. You are now on "${nm}".`)
    }
  }

  const picked = teams.find((t) => t.id === teamId)

  return (
    <div className="control join-team">
      <h1>Player</h1>
      <p className="join-team-lead">
        Create or join a team, then submit your interval answers. Your team choice is saved in this
        browser.
      </p>
      {gameLoading && <p className="form-msg">Loading…</p>}

      <section className="panel join-section">
        <h2>Create a team</h2>
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

      <section className="panel join-section">
        <h2>Your team</h2>
        <form className="join-team-form" onSubmit={saveTeamChoice}>
          <label>
            Team
            <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">— Select —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.remainingSubmissions} submissions left)
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Save selection</button>
        </form>
        {picked && (
          <p className="join-team-status">
            Playing as <strong>{picked.name}</strong> — {picked.remainingSubmissions} submissions
            remaining.
          </p>
        )}
      </section>

      <ParticipantAnswerForm teamId={teamId} />

      <p className="join-team-links">
        <Link to="/display">Open scoreboard</Link>
        {' · '}
        <Link to="/control">Admin</Link>
      </p>
    </div>
  )
}
