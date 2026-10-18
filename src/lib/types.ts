export type Currency = 'EUR' | 'USD' | 'GBP'

/** Todas las cantidades de dinero se guardan en céntimos (enteros) para evitar errores de coma flotante. */
export interface Chip {
  id: string
  name: string
  color: string
  /** Valor de una ficha, en céntimos. */
  value: number
  enabled: boolean
  custom: boolean
}

export interface Player {
  id: string
  name: string
  color: string
  /** Entrada inicial y recompras, en céntimos. */
  buyIns: number[]
  /** Número de fichas de cada tipo al terminar, indexado por id de ficha. */
  finalChips: Record<string, number>
}

export interface Game {
  currency: Currency
  /** Importe que se propone al añadir un jugador o una recompra, en céntimos. */
  defaultBuyIn: number
  chips: Chip[]
  players: Player[]
}
