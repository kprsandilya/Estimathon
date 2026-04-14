import { useMemo } from 'react'
import { GameContext } from './gameContext'
import { createInitialGame, STORAGE_KEY } from './gameDefaults'
import { useSyncedState } from './hooks/useSyncedState'

export function GameProvider({ children }) {
  const [game, setGame] = useSyncedState(STORAGE_KEY, createInitialGame)
  const value = useMemo(() => ({ game, setGame }), [game, setGame])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
