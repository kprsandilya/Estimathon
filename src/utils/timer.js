import { FORTY_MIN_SEC } from '../gameDefaults.js'

/** Configured round length; used when resetting the timer. */
export function configuredTimerDurationSec(game) {
  const s = game.timerDurationSec
  if (typeof s === 'number' && s >= 60) return s
  return FORTY_MIN_SEC
}

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
