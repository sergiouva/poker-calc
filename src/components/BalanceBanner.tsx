import type { GameResults } from '../lib/calc'
import { cn } from '../lib/cn'
import { formatMoney } from '../lib/money'
import type { Currency } from '../lib/types'

interface Props {
  results: GameResults
  currency: Currency
}

export function BalanceBanner({ results, currency }: Props) {
  const ok = results.difference === 0

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-[13px] leading-snug',
        ok ? 'border-win/35 bg-win/10 text-win' : 'border-warn/35 bg-warn/10 text-warn',
      )}
    >
      <span aria-hidden>{ok ? '✓' : '!'}</span>
      <span>{balanceMessage(results, currency)}</span>
    </div>
  )
}

function balanceMessage({ difference, totalInvested, totalFinal }: GameResults, currency: Currency): string {
  const fmt = (cents: number) => formatMoney(cents, currency)
  const amounts = `(${fmt(totalFinal)} frente a ${fmt(totalInvested)} aportados)`

  if (difference === 0) return `Cuadra: ${fmt(totalInvested)} aportados = ${fmt(totalFinal)} en la mesa`
  if (difference > 0) return `Sobran ${fmt(difference)} en la mesa ${amounts}. Revisa las fichas finales.`
  return `Faltan ${fmt(Math.abs(difference))} en la mesa ${amounts}. Revisa las fichas finales o las recompras.`
}
