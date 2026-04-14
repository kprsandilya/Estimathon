import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from './hooks/useGame'
import { FORTY_MIN_SEC, createInitialGame } from './gameDefaults'
import { correctSubmissionPoints, teamTotalScore } from './utils/scoring'
import { wrongMarkCount } from './utils/submissionsDisplay'
import { formatCountdown, getTimerSecondsRemaining } from './utils/timer'
import SubmissionForm from './SubmissionForm'

export default function ControlPanel() {
  const { game, setGame } = useGame()
  const [, tick] = useState(0)
  const fileRef = useRef(null)
  const [teamName, setTeamName] = useState('')
  const [qText, setQText] = useState('')
  const [qAnswer, setQAnswer] = useState('')

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const addTeam = () => {
    const name = teamName.trim()
    if (!name) return
    const id = crypto.randomUUID()
    setGame((g) => ({
      ...g,
      teams: [...g.teams, { id, name, remainingSubmissions: 18 }],
    }))
    setTeamName('')
  }

  const removeTeam = (id) => {
    setGame((g) => {
      const rest = { ...g.submissions }
      delete rest[id]
      return { ...g, teams: g.teams.filter((t) => t.id !== id), submissions: rest }
    })
  }

  const addQuestion = () => {
    const ans = Number(qAnswer)
    if (!Number.isFinite(ans)) {
      window.alert('Enter a numeric answer for the new question.')
      return
    }
    const id = crypto.randomUUID()
    setGame((g) => ({
      ...g,
      questions: [
        ...g.questions,
        { id, text: qText.trim() || undefined, answer: ans },
      ],
    }))
    setQText('')
    setQAnswer('')
  }

  const removeQuestion = (id) => {
    setGame((g) => {
      const submissions = { ...g.submissions }
      for (const tid of Object.keys(submissions)) {
        const row = { ...submissions[tid] }
        delete row[id]
        submissions[tid] = row
      }
      return {
        ...g,
        questions: g.questions.filter((q) => q.id !== id),
        submissions,
      }
    })
  }

  const updateQuestionAnswer = (id, answerStr) => {
    const v = Number(answerStr)
    const answer = Number.isFinite(v) ? v : 0
    setGame((g) => ({
      ...g,
      questions: g.questions.map((q) => (q.id === id ? { ...q, answer } : q)),
    }))
  }

  const resetGame = () => {
    if (!window.confirm('Reset game? Clears submissions and restores 18 submissions per team.')) return
    setGame((g) => ({
      ...g,
      submissions: {},
      teams: g.teams.map((t) => ({ ...t, remainingSubmissions: 18 })),
      timerPausedSec: FORTY_MIN_SEC,
      timerEndAt: null,
    }))
  }

  const toggleLock = () => setGame((g) => ({ ...g, locked: !g.locked }))
  const toggleReveal = () => setGame((g) => ({ ...g, revealAnswers: !g.revealAnswers }))

  const timerStart = () => {
    const sec = getTimerSecondsRemaining(game)
    if (sec <= 0) return
    setGame((g) => ({
      ...g,
      timerEndAt: Date.now() + sec * 1000,
    }))
  }

  const timerPause = () => {
    const sec = getTimerSecondsRemaining(game)
    setGame((g) => ({
      ...g,
      timerPausedSec: sec,
      timerEndAt: null,
    }))
  }

  const timerReset = () => {
    setGame((g) => ({
      ...g,
      timerPausedSec: FORTY_MIN_SEC,
      timerEndAt: null,
    }))
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(game, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'estimathon-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        if (data && typeof data === 'object') {
          const base = createInitialGame()
          setGame({
            ...base,
            ...data,
            teams: Array.isArray(data.teams) ? data.teams : base.teams,
            questions: Array.isArray(data.questions) ? data.questions : base.questions,
            submissions:
              data.submissions && typeof data.submissions === 'object'
                ? data.submissions
                : {},
            locked: Boolean(data.locked),
            revealAnswers: Boolean(data.revealAnswers),
            timerPausedSec:
              typeof data.timerPausedSec === 'number'
                ? data.timerPausedSec
                : base.timerPausedSec,
            timerEndAt:
              data.timerEndAt != null && typeof data.timerEndAt === 'number'
                ? data.timerEndAt
                : null,
          })
        }
      } catch {
        window.alert('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  const timerSec = getTimerSecondsRemaining(game)
  const running = game.timerEndAt != null

  return (
    <div className="control">
      <header className="control-header">
        <h1>Estimathon — Control</h1>
        <nav className="control-nav">
          <Link to="/display" target="_blank" rel="noreferrer">
            Open display
          </Link>
        </nav>
      </header>

      <section className="panel">
        <h2>Timer (40 min)</h2>
        <p className="timer-readout">{formatCountdown(timerSec)}</p>
        <div className="btn-row">
          <button type="button" onClick={timerStart} disabled={running || timerSec <= 0}>
            Start
          </button>
          <button type="button" onClick={timerPause} disabled={!running}>
            Pause
          </button>
          <button type="button" onClick={timerReset}>
            Reset
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Teams</h2>
        <div className="inline-row">
          <input
            placeholder="Team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <button type="button" onClick={addTeam}>
            Add
          </button>
        </div>
        <ul className="list-compact">
          {game.teams.map((t) => (
            <li key={t.id}>
              <span>
                {t.name} — {t.remainingSubmissions} left
              </span>
              <button type="button" className="btn-danger" onClick={() => removeTeam(t.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Questions</h2>
        <div className="inline-row wrap">
          <input
            placeholder="Label (optional)"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
          />
          <input
            placeholder="Answer"
            type="number"
            step="any"
            value={qAnswer}
            onChange={(e) => setQAnswer(e.target.value)}
          />
          <button type="button" onClick={addQuestion}>
            Add question
          </button>
        </div>
        <ul className="list-compact">
          {game.questions.map((q, i) => (
            <li key={q.id}>
              <span>
                Q{i + 1}
                {q.text ? `: ${q.text}` : ''} — answer{' '}
                <input
                  className="input-inline"
                  type="number"
                  step="any"
                  value={q.answer}
                  onChange={(e) => updateQuestionAnswer(q.id, e.target.value)}
                />
              </span>
              <button type="button" className="btn-danger" onClick={() => removeQuestion(q.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <SubmissionForm />

      <section className="panel">
        <h2>Controls</h2>
        <div className="btn-row wrap">
          <button type="button" onClick={resetGame}>
            Reset game
          </button>
          <button type="button" onClick={toggleLock}>
            {game.locked ? 'Unlock submissions' : 'Lock submissions'}
          </button>
          <button type="button" onClick={toggleReveal}>
            {game.revealAnswers ? 'Hide answers on display' : 'Reveal answers on display'}
          </button>
          <button type="button" onClick={exportJson}>
            Export JSON
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}>
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importJson(f)
            }}
          />
        </div>
      </section>

      <section className="panel preview">
        <h2>Scoreboard preview</h2>
        <table className="preview-table">
          <thead>
            <tr>
              <th>Team</th>
              <th>Total</th>
              <th>Left</th>
              {game.questions.map((q, i) => (
                <th key={q.id}>Q{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {game.teams.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{teamTotalScore(t.id, game.questions, game.submissions)}</td>
                <td>{t.remainingSubmissions}</td>
                {game.questions.map((q) => {
                  const sub = game.submissions[t.id]?.[q.id]
                  if (!sub) return <td key={q.id} className="cell-miss">*</td>
                  if (sub.correct)
                    return (
                      <td key={q.id} className="cell-ok">
                        {correctSubmissionPoints(sub)}
                      </td>
                    )
                  const n = wrongMarkCount(sub)
                  return (
                    <td key={q.id} className="cell-bad">
                      {'X'.repeat(n)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
