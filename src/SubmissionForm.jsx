import { useState } from 'react'
import { useGame } from './hooks/useGame'
import { correctIntervalPoints, submissionCorrect } from './utils/scoring'
import { wrongMarkCount } from './utils/submissionsDisplay'
import {
  SCALE_UNITS,
  effectiveUpperBound,
  canonicalQuestionAnswer,
  toCanonical,
} from './utils/units'

export default function SubmissionForm() {
  const { game, setGame } = useGame()
  const { teams, questions, submissions, locked } = game
  const [teamId, setTeamId] = useState('')
  const [questionId, setQuestionId] = useState('')
  const [aStr, setAStr] = useState('')
  const [bStr, setBStr] = useState('')
  const [aUnit, setAUnit] = useState('1')
  const [bUnit, setBUnit] = useState('1')
  const [bOffset, setBOffset] = useState(false)
  const [msg, setMsg] = useState('')

  const submit = (e) => {
    e.preventDefault()
    setMsg('')
    if (locked) {
      setMsg('Submissions are locked.')
      return
    }
    if (!teamId || !questionId) {
      setMsg('Pick a team and a question.')
      return
    }
    const aBox = Number(aStr)
    const bBox = Number(bStr)
    if (!Number.isFinite(aBox) || !Number.isFinite(bBox)) {
      setMsg('Enter valid numbers for a and b.')
      return
    }

    const team = teams.find((t) => t.id === teamId)
    const question = questions.find((q) => q.id === questionId)
    if (!team || !question) return
    if (team.remainingSubmissions <= 0) {
      setMsg('No submissions left for this team.')
      return
    }

    const canonicalA = toCanonical(aBox, aUnit)
    const canonicalB = effectiveUpperBound(bBox, bUnit, bOffset)

    if (!(canonicalA > 0)) {
      setMsg('Lower bound must be positive after scaling.')
      return
    }
    if (!(canonicalB > 0)) {
      setMsg('Upper bound must be positive (check b and offset).')
      return
    }
    if (canonicalA > canonicalB) {
      setMsg('Need lower bound ≤ upper bound (in absolute value).')
      return
    }

    const answer = canonicalQuestionAnswer(question)
    if (typeof answer !== 'number' || Number.isNaN(answer)) {
      setMsg('Set the question answer in Question Management first.')
      return
    }

    const correct = submissionCorrect(answer, canonicalA, canonicalB)
    const score = correct ? correctIntervalPoints(canonicalA, canonicalB) : null
    const prev = submissions[teamId]?.[questionId]
    const history = [...(prev?.history || [])]
    if (prev) history.push({ a: prev.a, b: prev.b })

    const wrongAttempts = correct
      ? 0
      : (prev && !prev.correct ? wrongMarkCount(prev) : 0) + 1

    setGame((g) => {
      const nextSubs = { ...g.submissions }
      const teamSubs = { ...(nextSubs[teamId] || {}) }
      teamSubs[questionId] = {
        a: canonicalA,
        b: canonicalB,
        aValue: aBox,
        aUnit,
        bValue: bBox,
        bUnit,
        bOffset,
        correct,
        score,
        history,
        wrongAttempts,
      }
      nextSubs[teamId] = teamSubs
      return {
        ...g,
        submissions: nextSubs,
        teams: g.teams.map((t) =>
          t.id === teamId
            ? { ...t, remainingSubmissions: t.remainingSubmissions - 1 }
            : t,
        ),
      }
    })
    setMsg('Saved.')
  }

  return (
    <form className="panel submission-form" onSubmit={submit}>
      <h2>Submission</h2>
      <p className="submission-hint">
        Enter interval values, then choose scale. Offset on <strong>b</strong> uses{' '}
        <code>(b − 1) × scale</code> as the upper bound for checking and scoring.
      </p>
      <label>
        Team
        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          disabled={locked}
        >
          <option value="">—</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.remainingSubmissions} left)
            </option>
          ))}
        </select>
      </label>
      <label>
        Question
        <select
          value={questionId}
          onChange={(e) => setQuestionId(e.target.value)}
          disabled={locked}
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
              disabled={locked}
            />
          </label>
          <label className="submission-unit-label">
            Units
            <select
              className="select-unit"
              value={aUnit}
              onChange={(e) => setAUnit(e.target.value)}
              disabled={locked}
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
              disabled={locked}
            />
          </label>
          <label className="submission-unit-label">
            Units
            <select
              className="select-unit"
              value={bUnit}
              onChange={(e) => setBUnit(e.target.value)}
              disabled={locked}
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
              disabled={locked}
            />
            <span>Offset</span>
          </label>
        </div>
      </div>
      <button type="submit" disabled={locked}>
        Submit
      </button>
      {msg && <p className="form-msg">{msg}</p>}
    </form>
  )
}
