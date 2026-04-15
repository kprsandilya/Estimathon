import { isRemoteGameMode } from './remoteGameFlag'

/**
 * Local manual mode: no `/api/game` — teams, questions, and the scoreboard live in
 * **localStorage** on each browser. Use the control panel to add teams and questions locally.
 *
 * Enable by leaving `VITE_USE_REMOTE_GAME` unset, `false`, or any falsy variant at build time.
 */
export function isLocalManualGameMode() {
  return !isRemoteGameMode()
}
