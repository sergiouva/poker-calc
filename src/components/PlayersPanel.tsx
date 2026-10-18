import { useState, type Dispatch } from 'react'
import type { GameResults } from '../lib/calc'
import { uid } from '../lib/defaults'
import type { GameAction } from '../lib/game'
import type { Game } from '../lib/types'
import { ChipToken } from './ChipToken'
import { PanelHeader } from './PanelHeader'
import { PlayerCard } from './PlayerCard'
import { BalanceBanner } from './BalanceBanner'

interface Props {
  game: Game
  results: GameResults
  dispatch: Dispatch<GameAction>
}

export function PlayersPanel({ game, results, dispatch }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(game.players[0]?.id ?? null)
  const activeChips = game.chips.filter((c) => c.enabled)
  // Mantenemos el orden en que se añadieron, no el de resultados.
  const resultById = new Map(results.rows.map((r) => [r.player.id, r]))

  const addPlayer = () => {
    const id = uid()
    dispatch({ type: 'addPlayer', id })
    setExpandedId(id)
  }

  return (
    <div className="flex flex-col gap-3">
      <PanelHeader title="Jugadores" hint="Lo que ha puesto cada uno y con cuántas fichas ha terminado." />

      {game.players.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex -space-x-3">
            {activeChips.slice(0, 4).map((chip) => (
              <ChipToken key={chip.id} color={chip.color} size={36} />
            ))}
          </div>
          <p className="text-muted">Todavía no hay nadie en la mesa.</p>
        </div>
      ) : (
        game.players.map((player) => {
          const result = resultById.get(player.id)
          if (!result) return null
          return (
            <PlayerCard
              key={player.id}
              result={result}
              chips={activeChips}
              currency={game.currency}
              expanded={expandedId === player.id}
              onToggle={() => setExpandedId(expandedId === player.id ? null : player.id)}
              dispatch={dispatch}
            />
          )
        })
      )}

      <button type="button" className="btn-ghost" onClick={addPlayer}>
        + Añadir jugador
      </button>

      {game.players.length > 0 ? (
        <BalanceBanner results={results} currency={game.currency} />
      ) : null}
    </div>
  )
}
