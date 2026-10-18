import { useState, type Dispatch } from 'react'
import { cn } from '../lib/cn'
import { CURRENCIES } from '../lib/defaults'
import type { GameAction } from '../lib/game'
import type { Chip, Game } from '../lib/types'
import { ChipEditor } from './ChipEditor'
import { ChipToken } from './ChipToken'
import { MoneyInput, Segmented, Switch } from './inputs'
import { PanelHeader } from './PanelHeader'

interface Props {
  game: Game
  dispatch: Dispatch<GameAction>
}

export function ChipsPanel({ game, dispatch }: Props) {
  // null = cerrado, 'new' = creando, Chip = editando
  const [editing, setEditing] = useState<Chip | 'new' | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <PanelHeader title="Fichas" hint="Activa las fichas que se usan y dales un valor. Toca una ficha para cambiar su color." />

      <div className="card flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="label">Divisa</span>
          <Segmented
            label="Divisa"
            value={game.currency}
            onChange={(currency) => dispatch({ type: 'setCurrency', currency })}
            options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-semibold">Entrada por jugador</div>
            <div className="label">Se propone al añadir jugadores y recompras</div>
          </div>
          <MoneyInput
            className="w-28 shrink-0"
            label="Entrada por jugador"
            cents={game.defaultBuyIn}
            currency={game.currency}
            onChange={(amount) => dispatch({ type: 'setDefaultBuyIn', amount })}
          />
        </div>
      </div>

      {game.chips.map((chip) => (
        <div key={chip.id} className={cn('card flex items-center gap-3 py-3', !chip.enabled && 'opacity-55')}>
          <Switch
            label={`Usar ficha ${chip.name}`}
            checked={chip.enabled}
            onChange={(enabled) => dispatch({ type: 'updateChip', id: chip.id, patch: { enabled } })}
          />
          <button
            type="button"
            onClick={() => setEditing(chip)}
            aria-label={`Editar ficha ${chip.name}`}
            className="rounded-full transition hover:scale-105"
          >
            <ChipToken color={chip.color} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{chip.name}</div>
            <div className="label">{chip.enabled ? 'En juego' : 'No se usa'}</div>
          </div>
          <MoneyInput
            className="w-28 shrink-0"
            label={`Valor de la ficha ${chip.name}`}
            cents={chip.value}
            currency={game.currency}
            disabled={!chip.enabled}
            onChange={(value) => dispatch({ type: 'updateChip', id: chip.id, patch: { value } })}
          />
        </div>
      ))}

      <button type="button" className="btn-ghost" onClick={() => setEditing('new')}>
        + Añadir ficha personalizada
      </button>

      {editing && (
        <ChipEditor
          chip={editing === 'new' ? undefined : editing}
          currency={game.currency}
          onClose={() => setEditing(null)}
          onSave={(draft) => {
            if (editing === 'new') dispatch({ type: 'addChip', chip: draft })
            else dispatch({ type: 'updateChip', id: editing.id, patch: draft })
            setEditing(null)
          }}
          onDelete={
            editing !== 'new' && editing.custom
              ? () => {
                  dispatch({ type: 'removeChip', id: editing.id })
                  setEditing(null)
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
