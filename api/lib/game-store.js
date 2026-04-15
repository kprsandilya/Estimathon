import { Redis } from '@upstash/redis'
import { createInitialGame } from '../initial-game.js'

const KEY = 'estimathon:game:v1'

/**
 * Shared Redis (Upstash or Vercel KV REST) when `UPSTASH_*` or `KV_REST_*` env is set.
 * Otherwise in-process memory — fine for `vercel dev` / local API without Redis.
 */
let memory = null
let redisClient

function getRedis() {
  if (redisClient !== undefined) return redisClient
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (url && token) {
    redisClient = new Redis({ url, token })
  } else {
    redisClient = null
  }
  return redisClient
}

/** @returns {'redis' | 'memory'} */
export function getGameStoreBackend() {
  return getRedis() ? 'redis' : 'memory'
}

export async function readGame() {
  const r = getRedis()
  if (!r) {
    if (memory == null) memory = createInitialGame()
    return { ...createInitialGame(), ...memory }
  }
  const raw = await r.get(KEY)
  if (raw == null || raw === '') {
    return createInitialGame()
  }
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return { ...createInitialGame(), ...parsed }
  } catch {
    return createInitialGame()
  }
}

export async function writeGame(game) {
  const merged = { ...createInitialGame(), ...game }
  const r = getRedis()
  if (!r) {
    memory = merged
    return
  }
  await r.set(KEY, JSON.stringify(merged))
}
