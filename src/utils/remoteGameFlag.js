/**
 * Live / shared mode: game state comes from `GET /api/game` (poll). Use with server-side Redis
 * (Upstash or Vercel KV) for a single source of truth across instances.
 *
 * When false, everything stays in localStorage (see `isLocalManualGameMode` in `localGameMode.js`).
 */
export function isRemoteGameMode() {
  const v = import.meta.env.VITE_USE_REMOTE_GAME
  if (v === true) return true
  const s = String(v ?? '')
    .toLowerCase()
    .trim()
  return s === 'true' || s === '1' || s === 'yes' || s === 'on'
}
