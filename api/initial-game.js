/** Mirrors `src/gameDefaults.js` for serverless (no cross-import). */
const FORTY_MIN_SEC = 40 * 60

export function createInitialGame() {
  return {
    teams: [],
    questions: [],
    submissions: {},
    locked: false,
    revealAnswers: false,
    gameEnded: false,
    timerDurationSec: FORTY_MIN_SEC,
    timerPausedSec: FORTY_MIN_SEC,
    timerEndAt: null,
  }
}
