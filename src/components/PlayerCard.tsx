import type { Dispatch } from 'react'
import type { PlayerResult } from '../lib/calc'
import { cn } from '../lib/cn'
import type { GameAction } from '../lib/game'
import { formatMoney } from '../lib/money'
import type { Chip, Currency } from '../lib/types'
import { Avatar } from './Avatar'
import { ChipToken } from './ChipToken'
import { CountInput, MoneyInput } from './inputs'

interface Props {
  result: PlayerResult
  chips: Chip[]
  currency: Currency
  expanded: boolean
  onToggle: () => void
  dispatch: Dispatch<GameAction>
}

export function PlayerCard({ result, chips, currency, expanded, onToggle, dispatch }: Props) {
  const { player, invested, final, net } = result
  const fmt = (cents: number) => formatMoney(cents, currency)

  return (
    <div className={cn('card p-0 transition-colors', expanded && 'border-muted/40')}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 p-3.5 text-left"
      >
        <Avatar player={player} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{player.name || 'Sin nombre'}</div>
          <div className="label truncate">
            Aporta <span className="font-mono">{fmt(invested)}</span> · Mesa <span className="font-mono">{fmt(final)}</span>
          </div>
        </div>
        <span className={cn('font-mono text-sm font-bold', net > 0 ? 'text-win' : net < 0 ? 'text-loss' : 'text-muted')}>
          {formatMoney(net, currency, { signed: true })}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('size-4 shrink-0 text-muted transition-transform duration-200', expanded && 'rotate-180')}
        >
          <path d="M5 7.5 10 12.5 15 7.5" />
        </svg>
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-line p-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="label">Nombre</span>
            <input
              className="field"
              value={player.name}
              maxLength={24}
              onChange={(e) => dispatch({ type: 'updatePlayer', id: player.id, patch: { name: e.target.value } })}
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="label">Aportado</span>
            {player.buyIns.map((amount, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-sm text-muted">{index === 0 ? 'Entrada' : `Recompra ${index}`}</span>
                <MoneyInput
                  className="flex-1"
                  label={index === 0 ? 'Entrada' : `Recompra ${index}`}
                  cents={amount}
                  currency={currency}
                  onChange={(cents) => dispatch({ type: 'setBuyIn', playerId: player.id, index, amount: cents })}
                />
                <button
                  type="button"
                  aria-label="Quitar"
                  disabled={player.buyIns.length === 1}
                  onClick={() => dispatch({ type: 'removeBuyIn', playerId: player.id, index })}
                  className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-muted hover:text-loss disabled:invisible"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost py-2.5 text-sm"
              onClick={() => dispatch({ type: 'addBuyIn', playerId: player.id })}
            >
              + Recompra
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="label">Fichas al terminar</span>
              <span className="font-mono text-sm">{fmt(final)}</span>
            </div>
            {chips.length === 0 ? (
              <p className="text-sm text-muted">No hay fichas activas. Actívalas en el paso de fichas.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6">
                {chips.map((chip) => (
                  <div
                    key={chip.id}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface-2/60 p-2"
                  >
                    <ChipToken color={chip.color} size={28} />
                    <CountInput
                      label={`Fichas ${chip.name} de ${player.name}`}
                      value={player.finalChips[chip.id] ?? 0}
                      onChange={(count) =>
                        dispatch({ type: 'setFinalChips', playerId: player.id, chipId: chip.id, count })
                      }
                    />
                    <span className="max-w-full truncate font-mono text-[10px] text-muted">
                      {formatMoney(chip.value, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="self-start text-sm text-loss/80 hover:text-loss"
            onClick={() => {
              if (confirm(`¿Eliminar a ${player.name || 'este jugador'}?`)) dispatch({ type: 'removePlayer', id: player.id })
            }}
          >
            Eliminar jugador
          </button>
        </div>
      )}
    </div>
  )
}
