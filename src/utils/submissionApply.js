import { correctIntervalPoints, submissionCorrect } from './scoring'
import { wrongMarkCount } from './submissionsDisplay'
import {
  canonicalQuestionAnswer,
  effectiveUpperBound,
  toCanonical,
} from './units'

/**
 * Pure transition for one submission. Used by admin form, participant join, and API.
 * @returns {{ game: object } | { error: string }}
 */
export function computeSubmissionUpdate(game, input) {
  const {
    teamId,
    questionId,
    aBox,
    bBox,
    aUnit,
    bUnit,
    bOffset,
  } = input

  if (game.locked) return { error: 'Submissions are locked.' }
  if (game.gameEnded) return { error: 'The game has ended.' }
  if (!teamId || !questionId) return { error: 'Pick a team and a question.' }

  const a = Number(aBox)
  const b = Number(bBox)
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { error: 'Enter valid numbers for a and b.' }
  }

  const team = game.teams.find((t) => t.id === teamId)
  const question = game.questions.find((q) => q.id === questionId)
  if (!team || !question) return { error: 'Invalid team or question.' }
  if (team.remainingSubmissions <= 0) {
    return { error: 'No submissions left for this team.' }
  }

  const canonicalA = toCanonical(a, aUnit)
  const canonicalB = effectiveUpperBound(b, bUnit, bOffset)

  if (!(canonicalA > 0)) {
    return { error: 'Lower bound must be positive after scaling.' }
  }
  if (!(canonicalB > 0)) {
    return { error: 'Upper bound must be positive (check b and offset).' }
  }
  if (canonicalA > canonicalB) {
    return { error: 'Need lower bound ≤ upper bound (in absolute value).' }
  }

  const answer = canonicalQuestionAnswer(question)
  if (typeof answer !== 'number' || Number.isNaN(answer)) {
    return { error: 'This question does not have a valid answer set yet.' }
  }

  const correct = submissionCorrect(answer, canonicalA, canonicalB)
  const score = correct ? correctIntervalPoints(canonicalA, canonicalB) : null
  const prev = game.submissions[teamId]?.[questionId]
  const history = [...(prev?.history || [])]
  if (prev) history.push({ a: prev.a, b: prev.b })

  const wrongAttempts = correct
    ? 0
    : (prev && !prev.correct ? wrongMarkCount(prev) : 0) + 1

  const nextSubs = { ...game.submissions }
  const teamSubs = { ...(nextSubs[teamId] || {}) }
  teamSubs[questionId] = {
    a: canonicalA,
    b: canonicalB,
    aValue: a,
    aUnit,
    bValue: b,
    bUnit,
    bOffset,
    correct,
    score,
    history,
    wrongAttempts,
  }
  nextSubs[teamId] = teamSubs

  return {
    game: {
      ...game,
      submissions: nextSubs,
      teams: game.teams.map((t) =>
        t.id === teamId
          ? { ...t, remainingSubmissions: t.remainingSubmissions - 1 }
          : t,
      ),
    },
  }
}
