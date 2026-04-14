export const STORAGE_KEY = 'estimathon-game-v1'

export const FORTY_MIN_SEC = 40 * 60

export function createInitialGame() {
  return {
    teams: [],
    questions: [],
    submissions: {},
    locked: false,
    revealAnswers: false,
    timerPausedSec: FORTY_MIN_SEC,
    timerEndAt: null,
  }
}
