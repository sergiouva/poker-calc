import { settle, type GameResults } from '../lib/calc'
import { cn } from '../lib/cn'
import { formatMoney } from '../lib/money'
import type { Currency } from '../lib/types'
import { Avatar } from './Avatar'
import { ChipToken } from './ChipToken'
import { PanelHeader } from './PanelHeader'
import { BalanceBanner } from './BalanceBanner'

interface Props {
  results: GameResults
  currency: Currency
}

export function ResultsPanel({ results, currency }: Props) {
  const { rows } = results
  const fmt = (cents: number) => formatMoney(cents, currency)

  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <PanelHeader title="Resultado" />
        <div className="card py-10 text-center text-muted">Añade jugadores para ver quién gana y quién paga.</div>
      </div>
    )
  }

  const winner = rows[0].net > 0 ? rows[0] : null
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.net)), 1)
  const settlements = settle(rows)

  return (
    <div className="flex flex-col gap-3">
      <PanelHeader title="Resultado" />

      {winner && (
        <div className="flex items-center gap-4 rounded-2xl border border-[#1d7a4f] bg-[radial-gradient(ellipse_at_50%_0%,var(--color-felt-2),var(--color-felt)_75%)] p-4">
          <ChipToken color="#E3B53E" size={60} />
          <div className="min-w-0">
            <div className="text-xs text-[#cfe8da]">Mayor ganancia</div>
            <div className="truncate font-display text-2xl">{winner.player.name}</div>
            <div className="font-mono text-2xl font-bold text-win">{formatMoney(winner.net, currency, { signed: true })}</div>
          </div>
        </div>
      )}

      <div className="card flex flex-col gap-3">
        {rows.map(({ player, net }) => (
          <div key={player.id}>
            <div className="flex items-center gap-3">
              <Avatar player={player} size={30} />
              <span className="min-w-0 flex-1 truncate font-semibold">{player.name}</span>
              <span className={cn('font-mono font-bold', net > 0 ? 'text-win' : net < 0 ? 'text-loss' : 'text-muted')}>
                {formatMoney(net, currency, { signed: true })}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className={cn('h-full rounded-full transition-[width] duration-500', net >= 0 ? 'bg-win' : 'bg-loss')}
                style={{ width: `${(Math.abs(net) / maxAbs) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {results.difference !== 0 && <BalanceBanner results={results} currency={currency} />}

      <div className="card">
        <div className="label mb-1">Quién paga a quién</div>
        {settlements.length === 0 ? (
          <p className="py-2 text-sm text-muted">Nadie debe nada a nadie.</p>
        ) : (
          <ul>
            {settlements.map((s, i) => (
              <li key={i} className="flex items-center gap-2 border-b border-line py-2.5 text-[15px] last:border-0">
                <b className="truncate">{s.from.name}</b>
                <span aria-label="paga a" className="text-gold">
                  →
                </span>
                <b className="min-w-0 flex-1 truncate">{s.to.name}</b>
                <span className="font-mono">{fmt(s.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
