import { cn } from '../lib/cn'

const STEPS = ['Fichas', 'Jugadores', 'Resultado'] as const

export function Stepper({ step, onChange }: { step: number; onChange: (step: number) => void }) {
  return (
    <nav aria-label="Pasos" className="mx-auto flex max-w-7xl gap-1.5 px-4 pt-3 pb-1 lg:hidden">
      {STEPS.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(i)}
          aria-current={i === step ? 'step' : undefined}
          className={cn(
            'flex-1 border-t-3 pt-2 text-center text-xs transition-colors',
            i === step ? 'border-gold font-semibold text-gold' : i < step ? 'border-felt-2 text-ink' : 'border-line text-muted',
          )}
        >
          {i + 1} · {label}
        </button>
      ))}
    </nav>
  )
}
