import { useEffect, useReducer } from 'react'
import { createGame } from '../lib/defaults'
import { gameReducer } from '../lib/game'
import { loadGame, saveGame } from '../lib/storage'

export function useGame() {
  const [game, dispatch] = useReducer(gameReducer, undefined, () => loadGame() ?? createGame())

  useEffect(() => {
    saveGame(game)
  }, [game])

  return [game, dispatch] as const
}
