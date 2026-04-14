import { useState } from 'react'
import { useGame } from './hooks/useGame'
import { correctIntervalPoints, submissionCorrect } from './utils/scoring'
import { wrongMarkCount } from './utils/submissionsDisplay'

export default function SubmissionForm() {
  const { game, setGame } = useGame()
  const { teams, questions, submissions, locked } = game
  const [teamId, setTeamId] = useState('')
  const [questionId, setQuestionId] = useState('')
  const [aStr, setAStr] = useState('')
  const [bStr, setBStr] = useState('')
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
    const a = Number(aStr)
    const b = Number(bStr)
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      setMsg('Enter valid numbers for a and b.')
      return
    }
    if (a <= 0) {
      setMsg('a must be positive.')
      return
    }
    if (a > b) {
      setMsg('Need a ≤ b for the interval.')
      return
    }

    const team = teams.find((t) => t.id === teamId)
    const question = questions.find((q) => q.id === questionId)
    if (!team || !question) return
    if (team.remainingSubmissions <= 0) {
      setMsg('No submissions left for this team.')
      return
    }
    const answer = question.answer
    if (typeof answer !== 'number' || Number.isNaN(answer)) {
      setMsg('Set the question answer in Question Management first.')
      return
    }

    const correct = submissionCorrect(answer, a, b)
    const score = correct ? correctIntervalPoints(a, b) : null
    const prev = submissions[teamId]?.[questionId]
    const history = [...(prev?.history || [])]
    if (prev) history.push({ a: prev.a, b: prev.b })

    const wrongAttempts = correct
      ? 0
      : (prev && !prev.correct ? wrongMarkCount(prev) : 0) + 1

    setGame((g) => {
      const nextSubs = { ...g.submissions }
      const teamSubs = { ...(nextSubs[teamId] || {}) }
      teamSubs[questionId] = { a, b, correct, score, history, wrongAttempts }
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
      <div className="submission-interval">
        <label>
          a
          <input
            type="number"
            step="any"
            value={aStr}
            onChange={(e) => setAStr(e.target.value)}
            disabled={locked}
          />
        </label>
        <label>
          b
          <input
            type="number"
            step="any"
            value={bStr}
            onChange={(e) => setBStr(e.target.value)}
            disabled={locked}
          />
        </label>
      </div>
      <button type="submit" disabled={locked}>
        Submit
      </button>
      {msg && <p className="form-msg">{msg}</p>}
    </form>
  )
}
