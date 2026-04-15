/**
 * When true, the app loads game state from `/api/game` (server-held copy) instead of localStorage.
 * Set at build time via `VITE_USE_REMOTE_GAME`.
 */
export function isRemoteGameMode() {
  const v = import.meta.env.VITE_USE_REMOTE_GAME
  if (v === true) return true
  const s = String(v ?? '')
    .toLowerCase()
    .trim()
  return s === 'true' || s === '1' || s === 'yes' || s === 'on'
}
