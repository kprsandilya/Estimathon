/** @param {{ timerEndAt: number | null, timerPausedSec: number }} game */
export function getTimerSecondsRemaining(game) {
  if (game.timerEndAt != null) {
    return Math.max(0, Math.ceil((game.timerEndAt - Date.now()) / 1000))
  }
  return game.timerPausedSec ?? 0
}

/** @param {number} sec */
export function formatCountdown(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
