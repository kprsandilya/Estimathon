import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from './hooks/useGame'
import { createInitialGame } from './gameDefaults'
import { correctSubmissionPoints, teamTotalScore } from './utils/scoring'
import { wrongMarkCount } from './utils/submissionsDisplay'
import {
  configuredTimerDurationSec,
  formatCountdown,
  getTimerSecondsRemaining,
} from './utils/timer'
import { SCALE_UNITS, formatQuestionAnswerDisplay } from './utils/units'
import SubmissionForm from './SubmissionForm'

export default function ControlPanel() {
  const { game, setGame } = useGame()
  const [, tick] = useState(0)
  const fileRef = useRef(null)
  const [teamName, setTeamName] = useState('')
  const [qText, setQText] = useState('')
  const [qAnswer, setQAnswer] = useState('')
  const [qAnswerUnit, setQAnswerUnit] = useState('1')
  const timerMinutesRef = useRef(null)

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
        {
          id,
          text: qText.trim() || undefined,
          answer: ans,
          answerUnit: qAnswerUnit || '1',
        },
      ],
    }))
    setQText('')
    setQAnswer('')
    setQAnswerUnit('1')
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

  const updateQuestionAnswerUnit = (id, answerUnit) => {
    setGame((g) => ({
      ...g,
      questions: g.questions.map((q) =>
        q.id === id ? { ...q, answerUnit: answerUnit || '1' } : q,
      ),
    }))
  }

  const resetGame = () => {
    if (!window.confirm('Reset game? Clears submissions and restores 18 submissions per team.')) return
    setGame((g) => ({
      ...g,
      submissions: {},
      teams: g.teams.map((t) => ({ ...t, remainingSubmissions: 18 })),
      timerPausedSec: configuredTimerDurationSec(g),
      timerEndAt: null,
      gameEnded: false,
    }))
  }

  const endGame = () => {
    if (!window.confirm('End the game for everyone? The scoreboard will show the final podium.')) return
    setGame((g) => ({
      ...g,
      gameEnded: true,
      timerEndAt: null,
    }))
  }

  const resumeGame = () => {
    setGame((g) => ({ ...g, gameEnded: false }))
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
      timerPausedSec: configuredTimerDurationSec(g),
      timerEndAt: null,
    }))
  }

  const applyTimerLength = () => {
    const m = Number(timerMinutesRef.current?.value)
    if (!Number.isFinite(m) || m < 1) {
      window.alert('Enter a round length of at least 1 minute.')
      return
    }
    const sec = Math.min(Math.round(m * 60), 7 * 24 * 3600)
    setGame((g) => ({ ...g, timerDurationSec: sec }))
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
            gameEnded: Boolean(data.gameEnded),
            timerDurationSec:
              typeof data.timerDurationSec === 'number' && data.timerDurationSec >= 60
                ? data.timerDurationSec
                : base.timerDurationSec,
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
          <Link to="/join">Join a team</Link>
          <Link to="/display" target="_blank" rel="noreferrer">
            Open display
          </Link>
        </nav>
      </header>

      <section className="panel">
        <h2>Timer</h2>
        <p className="timer-readout">{formatCountdown(timerSec)}</p>
        <div className="timer-duration-block">
          <label className="timer-duration-label">
            Round length (minutes)
            <div className="inline-row timer-duration-inputs">
              <input
                ref={timerMinutesRef}
                key={String(game.timerDurationSec ?? 'x')}
                type="number"
                min={1}
                max={10080}
                step={1}
                defaultValue={Math.round(configuredTimerDurationSec(game) / 60)}
              />
              <button type="button" onClick={applyTimerLength}>
                Set length
              </button>
            </div>
          </label>
          <p className="timer-duration-hint">
            &quot;Reset&quot; and full game reset restore the countdown to this length. A running
            timer keeps going until you pause or reset.
          </p>
        </div>
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
          <select
            className="select-unit"
            value={qAnswerUnit}
            onChange={(e) => setQAnswerUnit(e.target.value)}
            aria-label="Answer units"
          >
            {SCALE_UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={addQuestion}>
            Add question
          </button>
        </div>
        <ul className="list-compact">
          {game.questions.map((q, i) => (
            <li key={q.id}>
              <span className="question-edit">
                Q{i + 1}
                {q.text ? `: ${q.text}` : ''} — answer{' '}
                <input
                  className="input-inline"
                  type="number"
                  step="any"
                  value={q.answer}
                  onChange={(e) => updateQuestionAnswer(q.id, e.target.value)}
                />
                <select
                  className="select-unit input-inline-unit"
                  value={q.answerUnit || '1'}
                  onChange={(e) => updateQuestionAnswerUnit(q.id, e.target.value)}
                  aria-label={`Q${i + 1} answer units`}
                >
                  {SCALE_UNITS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
                <span className="question-answer-preview">
                  ({formatQuestionAnswerDisplay(q)})
                </span>
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
          {game.gameEnded ? (
            <button type="button" onClick={resumeGame}>
              Resume game (show leaderboard)
            </button>
          ) : (
            <button type="button" className="btn-danger" onClick={endGame}>
              End game (show podium)
            </button>
          )}
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
