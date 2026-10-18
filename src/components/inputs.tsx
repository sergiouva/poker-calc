import { useState } from 'react'
import { cn } from '../lib/cn'
import { currencySymbol, formatPlain, parseMoney } from '../lib/money'
import type { Currency } from '../lib/types'

interface MoneyInputProps {
  cents: number
  currency: Currency
  onChange: (cents: number) => void
  label: string
  disabled?: boolean
  className?: string
}

/** Input de importe: se escribe "1,25" o "1.25" y se guarda en céntimos. */
export function MoneyInput({ cents, currency, onChange, label, disabled, className }: MoneyInputProps) {
  // Mientras se edita guardamos el texto tal cual para no pisar lo que escribe el usuario ("1," → "1,00").
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <div className={cn('relative', className)}>
      <input
        type="text"
        inputMode="decimal"
        aria-label={label}
        disabled={disabled}
        value={draft ?? formatPlain(cents)}
        onFocus={(e) => {
          setDraft(formatPlain(cents))
          e.target.select()
        }}
        onChange={(e) => {
          const text = e.target.value.replace(/[^\d.,]/g, '')
          setDraft(text)
          const parsed = parseMoney(text)
          if (parsed !== null) onChange(parsed)
        }}
        onBlur={() => setDraft(null)}
        className="field pr-8 text-right font-mono tabular-nums"
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-sm text-muted">
        {currencySymbol(currency)}
      </span>
    </div>
  )
}

interface CountInputProps {
  value: number
  onChange: (value: number) => void
  label: string
}

export function CountInput({ value, onChange, label }: CountInputProps) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      aria-label={label}
      placeholder="0"
      value={value === 0 ? '' : String(value)}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 5)
        onChange(digits === '' ? 0 : parseInt(digits, 10))
      }}
      className="field px-1 py-2 text-center font-mono tabular-nums"
    />
  )
}

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label: string
}

export function Segmented<T extends string>({ options, value, onChange, label }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-xl border border-line bg-surface-2 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm transition',
            option.value === value ? 'bg-gold font-bold text-gold-ink' : 'text-muted hover:text-ink',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-10 shrink-0 rounded-full border transition-colors',
        checked ? 'border-felt-2 bg-felt-2' : 'border-line bg-surface-2',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-4.5 rounded-full transition-transform',
          checked ? 'translate-x-4 bg-ink' : 'bg-muted',
        )}
      />
    </button>
  )
}
