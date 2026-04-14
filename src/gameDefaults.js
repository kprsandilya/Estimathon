export const STORAGE_KEY = 'estimathon-game-v1'

export const FORTY_MIN_SEC = 40 * 60

export function createInitialGame() {
  return {
    teams: [],
    questions: [],
    submissions: {},
    locked: false,
    revealAnswers: false,
    timerDurationSec: FORTY_MIN_SEC,
    timerPausedSec: FORTY_MIN_SEC,
    timerEndAt: null,
  }
}
