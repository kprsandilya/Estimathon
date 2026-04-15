import { useMemo } from 'react'
import { getRankedTeams } from './utils/scoring'

export default function EndGamePodium({ teams, questions, submissions }) {
  const top = useMemo(
    () => getRankedTeams(teams, questions, submissions).slice(0, 3),
    [teams, questions, submissions],
  )

  const first = top[0]
  const second = top[1]
  const third = top[2]

  return (
    <div className="podium-final">
      <h2 className="podium-final-title">Game over</h2>
      <p className="podium-final-sub">Final podium — lower total score wins</p>
      <div className="podium-final-stand">
        <div className="podium-final-col podium-final-second">
          <div className="podium-final-block">
            <span className="podium-final-rank">2nd</span>
            {second ? (
              <>
                <span className="podium-final-name">{second.name}</span>
                <span className="podium-final-score">{second.total}</span>
              </>
            ) : (
              <span className="podium-final-empty">—</span>
            )}
          </div>
          <div className="podium-riser podium-riser--silver" aria-hidden />
        </div>
        <div className="podium-final-col podium-final-first">
          <div className="podium-final-block">
            <span className="podium-final-rank">1st</span>
            {first ? (
              <>
                <span className="podium-final-name">{first.name}</span>
                <span className="podium-final-score">{first.total}</span>
              </>
            ) : (
              <span className="podium-final-empty">—</span>
            )}
          </div>
          <div className="podium-riser podium-riser--gold" aria-hidden />
        </div>
        <div className="podium-final-col podium-final-third">
          <div className="podium-final-block">
            <span className="podium-final-rank">3rd</span>
            {third ? (
              <>
                <span className="podium-final-name">{third.name}</span>
                <span className="podium-final-score">{third.total}</span>
              </>
            ) : (
              <span className="podium-final-empty">—</span>
            )}
          </div>
          <div className="podium-riser podium-riser--bronze" aria-hidden />
        </div>
      </div>
    </div>
  )
}
