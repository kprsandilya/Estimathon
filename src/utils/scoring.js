/** Points for one correct interval: floor(upper / lower) = floor(b / a). */
export function correctIntervalPoints(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number' || a <= 0) return 0
  return Math.floor(b / a)
}

/** Prefer a,b; fallback for legacy saved rows missing a/b. */
export function correctSubmissionPoints(sub) {
  if (typeof sub.a === 'number' && typeof sub.b === 'number' && sub.a > 0) {
    return Math.floor(sub.b / sub.a)
  }
  return typeof sub.score === 'number' ? sub.score : 0
}

/** @param {number} answer @param {number} a @param {number} b */
export function submissionCorrect(answer, a, b) {
  return answer >= a && answer <= b
}

/**
 * Team total = 2^(# incorrect or missing questions) * (10 + Σ floor(b/a) over correct questions).
 * Lower is better. Implemented here and consumed by Scoreboard / ControlPanel.
 */
export function teamTotalScore(teamId, questions, submissions) {
  const byQ = submissions[teamId] || {}
  let incorrect = 0
  let sumCorrect = 0
  for (const q of questions) {
    const sub = byQ[q.id]
    if (!sub || !sub.correct) {
      incorrect++
    } else {
      sumCorrect += correctSubmissionPoints(sub)
    }
  }
  return Math.pow(2, incorrect) * (10 + sumCorrect)
}
