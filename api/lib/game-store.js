import { createInitialGame } from '../initial-game.js'

/**
 * Ephemeral in-process storage only (no Vercel KV / DB).
 * State is lost on cold start, redeploy, or scale-out (not durable).
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
