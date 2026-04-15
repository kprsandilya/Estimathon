import { useCallback, useEffect, useMemo, useState } from 'react'
import { createInitialGame } from '../gameDefaults'

const POLL_MS = 2000

export function useRemoteGame() {
  const [game, setLocalGame] = useState(createInitialGame)
  const [gameLoading, setGameLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const pull = useCallback(async () => {
    try {
      const r = await fetch('/api/game', { credentials: 'omit' })
      const data = await r.json()
      if (data.game && typeof data.game === 'object') {
        setLocalGame({ ...createInitialGame(), ...data.game })
        setFetchError(null)
      }
    } catch (e) {
      setFetchError(e)
    } finally {
      setGameLoading(false)
    }
  }, [])

  useEffect(() => {
    pull()
    const id = setInterval(pull, POLL_MS)
    return () => clearInterval(id)
  }, [pull])

  const setGame = useCallback((updater) => {
    setLocalGame((prev) => {
      const base = prev ?? createInitialGame()
      const next = typeof updater === 'function' ? updater(base) : updater
      fetch('/api/game', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: next }),
      })
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status))
        })
        .catch(() => {
          window.alert(
            'Could not save game state. If you are on the control panel, sign in as admin again.',
          )
        })
      return next
    })
  }, [])

  return useMemo(
    () => ({
      game,
      setGame,
      gameLoading,
      fetchError,
      isRemote: true,
      refresh: pull,
    }),
    [game, setGame, gameLoading, fetchError, pull],
  )
}
