import { createInitialGame } from '../initial-game.js'

/**
 * Central game state for `/api/game` — **ephemeral process memory only** (no Redis, DB, or disk).
 * This is the “single source of truth” while the process is warm.
 *
 * On Vercel serverless, multiple concurrent instances each have their own memory; under load,
 * reads/writes can hit different instances and briefly disagree. Low traffic + one region usually
 * behaves like one copy. For guaranteed consistency you’d need shared storage (e.g. KV) or a
 * single long-running server — out of scope for “no persistent store.”
 */
let memory = null

export function readGame() {
  if (memory == null) {
    memory = createInitialGame()
  }
  return { ...createInitialGame(), ...memory }
}

export function writeGame(game) {
  memory = { ...createInitialGame(), ...game }
}
