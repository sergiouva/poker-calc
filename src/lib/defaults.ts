import type { Chip, Currency, Game } from './types'

export const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: 'EUR', symbol: '€', label: '€ EUR' },
  { code: 'USD', symbol: '$', label: '$ USD' },
  { code: 'GBP', symbol: '£', label: '£ GBP' },
]

export const DEFAULT_CHIPS: Chip[] = [
  { id: 'white', name: 'Blanca', color: '#ECE7DC', value: 5, enabled: true, custom: false },
  { id: 'red', name: 'Roja', color: '#C62F3A', value: 25, enabled: true, custom: false },
  { id: 'blue', name: 'Azul', color: '#2E6BD1', value: 100, enabled: true, custom: false },
  { id: 'green', name: 'Verde', color: '#1F9D5C', value: 500, enabled: true, custom: false },
  { id: 'yellow', name: 'Amarilla', color: '#E3B53E', value: 1000, enabled: false, custom: false },
  { id: 'black', name: 'Negra', color: '#26282C', value: 2500, enabled: false, custom: false },
]

/** Colores sugeridos en el selector de fichas personalizadas. */
export const CHIP_PRESETS = ['#ECE7DC', '#C62F3A', '#2E6BD1', '#1F9D5C', '#E3B53E', '#26282C', '#7A5AC8', '#E07A3F', '#2BA3A3', '#C2477E']

export const PLAYER_COLORS = ['#C62F3A', '#2E6BD1', '#1F9D5C', '#7A5AC8', '#D9A93A', '#E07A3F', '#2BA3A3', '#C2477E']

export function createGame(): Game {
  return {
    currency: 'EUR',
    defaultBuyIn: 2000,
    chips: DEFAULT_CHIPS.map((chip) => ({ ...chip })),
    players: [],
  }
}

export function uid(): string {
  // crypto.randomUUID solo existe en contextos seguros; al probar desde el móvil por IP local no lo hay.
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)
}
