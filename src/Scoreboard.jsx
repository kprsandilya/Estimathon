import { useEffect, useMemo, useState } from 'react'
import { useGame } from './hooks/useGame'
import { correctSubmissionPoints, teamTotalScore } from './utils/scoring'
import { wrongMarkCount } from './utils/submissionsDisplay'
import { formatCountdown, getTimerSecondsRemaining } from './utils/timer'
import { formatQuestionAnswerDisplay } from './utils/units'
import EndGamePodium from './EndGamePodium'

export default function Scoreboard() {
  const { game } = useGame()
  const [, tick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining = getTimerSecondsRemaining(game)
  const { teams, questions, submissions, revealAnswers } = game
  const gameEnded = Boolean(game.gameEnded)

  const podiumClassByTeamId = useMemo(() => {
    const map = new Map()
    if (teams.length === 0) return map
    const medals = [
      'scoreboard-podium-gold',
      'scoreboard-podium-silver',
      'scoreboard-podium-bronze',
    ]
    const ranked = teams
      .map((t) => ({
        id: t.id,
        total: teamTotalScore(t.id, questions, submissions),
        name: t.name,
      }))
      .sort((a, b) => {
        if (a.total !== b.total) return a.total - b.total
        return a.name.localeCompare(b.name)
      })
    ranked.slice(0, 3).forEach((r, i) => map.set(r.id, medals[i]))
    return map
  }, [teams, questions, submissions])

  if (gameEnded) {
    return (
      <div className="scoreboard scoreboard-ended">
        <header className="scoreboard-header">
          <h1>Estimathon</h1>
        </header>
        <EndGamePodium teams={teams} questions={questions} submissions={submissions} />
      </div>
    )
  }

  return (
    <div className="scoreboard">
      <header className="scoreboard-header">
        <h1>Estimathon</h1>
        <div className="scoreboard-timer">{formatCountdown(remaining)}</div>
      </header>
      <div className="scoreboard-table-shell">
        <div className="scoreboard-table-wrap">
          <table className="scoreboard-table">
            <thead>
              <tr>
                <th scope="col" className="scoreboard-col-team">
                  Team
                </th>
                <th scope="col">Total</th>
                <th scope="col">Left</th>
                {questions.map((q, i) => (
                  <th key={q.id} scope="col" className="scoreboard-qhead">
                    <span className="scoreboard-q-label">Q{i + 1}</span>
                    {revealAnswers && (
                      <span className="scoreboard-ans">
                        {formatQuestionAnswerDisplay(q)}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={3 + questions.length} className="scoreboard-empty">
                    No teams yet
                  </td>
                </tr>
              ) : (
                teams.map((t) => {
                  const total = teamTotalScore(t.id, questions, submissions)
                  const row = submissions[t.id] || {}
                  const podiumClass = podiumClassByTeamId.get(t.id) ?? ''
                  return (
                    <tr key={t.id} className={podiumClass}>
                      <th scope="row" className="scoreboard-team">
                        {t.name}
                      </th>
                      <td className="scoreboard-total">{total}</td>
                      <td className="scoreboard-left">{t.remainingSubmissions}</td>
                      {questions.map((q) => {
                        const sub = row[q.id]
                        if (!sub) {
                          return (
                            <td key={q.id} className="cell-miss scoreboard-cell">
                              <span className="scoreboard-miss-dot">·</span>
                            </td>
                          )
                        }
                        if (sub.correct) {
                          return (
                            <td key={q.id} className="cell-ok scoreboard-cell">
                              <span className="scoreboard-score">
                                {correctSubmissionPoints(sub)}
                              </span>
                            </td>
                          )
                        }
                        const n = wrongMarkCount(sub)
                        return (
                          <td key={q.id} className="cell-bad scoreboard-cell">
                            <span
                              className="scoreboard-wrongs"
                              aria-label={`${n} incorrect ${n === 1 ? 'attempt' : 'attempts'}`}
                            >
                              {Array.from({ length: n }, (_, i) => (
                                <span key={i} className="scoreboard-x-mark">
                                  X
                                </span>
                              ))}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
