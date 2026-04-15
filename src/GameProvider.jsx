import { useMemo } from 'react'
import { GameContext } from './gameContext'
import { createInitialGame, STORAGE_KEY } from './gameDefaults'
import { useRemoteGame } from './hooks/useRemoteGame'
import { useSyncedState } from './hooks/useSyncedState'
import { isRemoteGameMode } from './utils/remoteGameFlag'

function GameProviderLocal({ children }) {
  const [game, setGame] = useSyncedState(STORAGE_KEY, createInitialGame)
  const value = useMemo(
    () => ({
      game,
      setGame,
      gameLoading: false,
      isRemote: false,
      fetchError: null,
      refresh: () => {},
    }),
    [game, setGame],
  )
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

function GameProviderRemote({ children }) {
  const remote = useRemoteGame()
  const value = useMemo(
    () => ({
      game: remote.game,
      setGame: remote.setGame,
      gameLoading: remote.gameLoading,
      isRemote: true,
      fetchError: remote.fetchError,
      refresh: remote.refresh,
    }),
    [remote],
  )
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function GameProvider({ children }) {
  const remote = isRemoteGameMode()
  return remote ? (
    <GameProviderRemote>{children}</GameProviderRemote>
  ) : (
    <GameProviderLocal>{children}</GameProviderLocal>
  )
}
