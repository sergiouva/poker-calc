import type { Chip, Game, Player } from './types'

export interface PlayerResult {
  player: Player
  /** Total aportado (entrada + recompras). */
  invested: number
  /** Valor de las fichas con las que ha terminado. */
  final: number
  net: number
}

export interface GameResults {
  /** Ordenados de mayor a menor ganancia. */
  rows: PlayerResult[]
  /** Total aportado por todos los jugadores. */
  totalInvested: number
  /** Valor final de todas las fichas de todos los jugadores. */
  totalFinal: number
  /** Diferencia entre el valor final y el total aportado.
   * Si está en negativo significa que falta dinero
   */
  difference: number

  /** Todos están escritos en céntimos */
}

export interface Settlement {
  from: Player
  to: Player
  amount: number
}

export function stackValue(chips: Chip[], counts: Record<string, number>): number {
  return chips.reduce((sum, chip) => (chip.enabled ? sum + (counts[chip.id] ?? 0) * chip.value : sum), 0)
}

export function totalInvested(player: Player): number {
  return player.buyIns.reduce((sum, amount) => sum + amount, 0)
}

export function computeResults(game: Game): GameResults {
  const rows = game.players
    .map((player) => {
      const invested = totalInvested(player)
      const final = stackValue(game.chips, player.finalChips)
      return { player, invested, final, net: final - invested }
    })
    .sort((a, b) => b.net - a.net)

  const sumInvested = rows.reduce((sum, r) => sum + r.invested, 0)
  const totalFinal = rows.reduce((sum, r) => sum + r.final, 0)
  const difference = totalFinal - sumInvested

  return {
    rows,
    totalInvested: sumInvested,
    totalFinal,
    difference,
  }
}

/**
 * Calcula los pagos para saldar la partida con pocas transferencias:
 * primero empareja deudas y créditos idénticos, y luego el que más debe paga al que más tiene que cobrar.
 * Si las cuentas no cuadran, la diferencia queda sin repartir.
 */
export function settle(rows: PlayerResult[]): Settlement[] {
  const debtors = rows.filter((r) => r.net < 0).map((r) => ({ player: r.player, left: -r.net }))
  const creditors = rows.filter((r) => r.net > 0).map((r) => ({ player: r.player, left: r.net }))
  const settlements: Settlement[] = []

  for (const debtor of debtors) {
    const match = creditors.find((c) => c.left === debtor.left)
    if (match) {
      settlements.push({ from: debtor.player, to: match.player, amount: debtor.left })
      match.left = 0
      debtor.left = 0
    }
  }

  const pending = (list: typeof debtors) => list.filter((e) => e.left > 0).sort((a, b) => b.left - a.left)
  const ds = pending(debtors)
  const cs = pending(creditors)
  let i = 0
  let j = 0
  while (i < ds.length && j < cs.length) {
    const amount = Math.min(ds[i].left, cs[j].left)
    settlements.push({ from: ds[i].player, to: cs[j].player, amount })
    ds[i].left -= amount
    cs[j].left -= amount
    if (ds[i].left === 0) i++
    if (cs[j].left === 0) j++
  }

  return settlements
}
