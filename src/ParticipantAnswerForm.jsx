import { useState } from 'react'
import { useGame } from './hooks/useGame'
import { useParticipantActions } from './hooks/useParticipantActions'
import { SCALE_UNITS } from './utils/units'

export default function ParticipantAnswerForm({ teamId, team: teamProp }) {
  const { game } = useGame()
  const { submitAnswer } = useParticipantActions()
  const { questions, locked, teams } = game
  const gameEnded = Boolean(game.gameEnded)
  const team = teamProp ?? teams.find((t) => t.id === teamId)

  const [questionId, setQuestionId] = useState('')
  const [aStr, setAStr] = useState('')
  const [bStr, setBStr] = useState('')
  const [aUnit, setAUnit] = useState('1')
  const [bUnit, setBUnit] = useState('1')
  const [bOffset, setBOffset] = useState(false)
  const [msg, setMsg] = useState('')
  const [pending, setPending] = useState(false)

  const disabled = !teamId || locked || gameEnded

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    if (!teamId) {
      setMsg('Select or create a team first.')
      return
    }
    setPending(true)
    const result = await submitAnswer({
      teamId,
      questionId,
      aBox: Number(aStr),
      bBox: Number(bStr),
      aUnit,
      bUnit,
      bOffset,
    })
    setPending(false)
    if (result.error) {
      setMsg(result.error)
      return
    }
    setMsg('Submitted.')
  }

  return (
    <form className="panel submission-form participant-answer-form" onSubmit={submit}>
      <h2>Your answer</h2>
      {team && teamId && (
        <p className="participant-team-pill" aria-live="polite">
          Team <strong>{team.name}</strong> — <strong>{team.remainingSubmissions}</strong> submissions
          remaining
        </p>
      )}
      <p className="submission-hint">
        Interval <strong>a</strong> (lower) and <strong>b</strong> (upper), with units. Offset on{' '}
        <strong>b</strong> uses <code>(b − 1) × scale</code> as the upper bound.
      </p>
      {gameEnded && (
        <p className="form-msg participant-warning">The game has ended — no more submissions.</p>
      )}
      {locked && !gameEnded && (
        <p className="form-msg participant-warning">Submissions are locked by the host.</p>
      )}
      <label>
        Question
        <select
          value={questionId}
          onChange={(e) => setQuestionId(e.target.value)}
          disabled={disabled}
        >
          <option value="">—</option>
          {questions.map((q, i) => (
            <option key={q.id} value={q.id}>
              Q{i + 1}
              {q.text ? `: ${q.text}` : ''}
            </option>
          ))}
        </select>
      </label>

      <div className="submission-interval submission-interval-scaled">
        <div className="submission-value-unit">
          <label>
            a (lower)
            <input
              type="number"
              step="any"
              value={aStr}
              onChange={(e) => setAStr(e.target.value)}
              disabled={disabled}
            />
          </label>
          <label className="submission-unit-label">
            Units
            <select
              className="select-unit"
              value={aUnit}
              onChange={(e) => setAUnit(e.target.value)}
              disabled={disabled}
              aria-label="Units for a"
            >
              {SCALE_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="submission-value-unit submission-b-row">
          <label>
            b (upper)
            <input
              type="number"
              step="any"
              value={bStr}
              onChange={(e) => setBStr(e.target.value)}
              disabled={disabled}
            />
          </label>
          <label className="submission-unit-label">
            Units
            <select
              className="select-unit"
              value={bUnit}
              onChange={(e) => setBUnit(e.target.value)}
              disabled={disabled}
              aria-label="Units for b"
            >
              {SCALE_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
          <label className="submission-offset">
            <input
              type="checkbox"
              checked={bOffset}
              onChange={(e) => setBOffset(e.target.checked)}
              disabled={disabled}
            />
            <span>Offset</span>
          </label>
        </div>
      </div>
      <button type="submit" disabled={disabled || pending}>
        {pending ? 'Submitting…' : 'Submit'}
      </button>
      {msg && <p className="form-msg">{msg}</p>}
    </form>
  )
}
