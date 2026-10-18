import { useState } from 'react'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { cn } from '../lib/cn'
import { CHIP_PRESETS } from '../lib/defaults'
import type { Chip, Currency } from '../lib/types'
import { ChipToken } from './ChipToken'
import { MoneyInput } from './inputs'
import { Modal } from './Modal'

export type ChipDraft = Pick<Chip, 'name' | 'color' | 'value'>

interface Props {
  /** Ficha a editar; sin ella se crea una nueva. */
  chip?: Chip
  currency: Currency
  onSave: (draft: ChipDraft) => void
  onDelete?: () => void
  onClose: () => void
}

export function ChipEditor({ chip, currency, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState(chip?.name ?? '')
  const [color, setColor] = useState(chip?.color ?? '#7A5AC8')
  const [value, setValue] = useState(chip?.value ?? 100)
  const canSave = name.trim() !== ''

  return (
    <Modal title={chip ? 'Editar ficha' : 'Nueva ficha'} onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (canSave) onSave({ name: name.trim(), color, value })
        }}
      >
        <div className="flex items-center gap-4 rounded-2xl bg-[radial-gradient(ellipse_at_center,var(--color-felt-2),var(--color-felt)_75%)] p-4">
          <ChipToken color={color} size={64} />
          <div className="min-w-0">
            <div className="truncate font-display text-lg">{name.trim() || 'Sin nombre'}</div>
            <div className="font-mono text-sm text-ink/80">{color.toUpperCase()}</div>
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="label">Nombre</span>
          <input
            className="field"
            value={name}
            maxLength={24}
            placeholder="Ej. Morada"
            onChange={(e) => setName(e.target.value)}
            autoFocus={!chip}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="label">Color</span>
          <div className="chip-picker">
            <HexColorPicker color={color} onChange={setColor} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {CHIP_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-label={`Color ${preset}`}
                onClick={() => setColor(preset)}
                className={cn(
                  'size-7 rounded-full border-2 transition',
                  preset.toLowerCase() === color.toLowerCase() ? 'border-gold scale-110' : 'border-line',
                )}
                style={{ background: preset }}
              />
            ))}
            <HexColorInput
              color={color}
              onChange={setColor}
              prefixed
              aria-label="Código hexadecimal"
              className="field ml-auto w-28 py-1.5 font-mono text-sm uppercase"
            />
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="label">Valor de cada ficha</span>
          <MoneyInput cents={value} currency={currency} onChange={setValue} label="Valor de cada ficha" />
        </label>

        <div className="mt-2 flex gap-3">
          {onDelete && (
            <button type="button" onClick={onDelete} className="btn-outline flex-1 text-loss">
              Eliminar
            </button>
          )}
          <button type="submit" disabled={!canSave} className="btn-primary flex-[2]">
            {chip ? 'Guardar' : 'Añadir ficha'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
