import { createGame, PLAYER_COLORS, uid } from './defaults'
import type { Chip, Currency, Game, Player } from './types'

export type GameAction =
  | { type: 'setCurrency'; currency: Currency }
  | { type: 'setDefaultBuyIn'; amount: number }
  | { type: 'updateChip'; id: string; patch: Partial<Pick<Chip, 'name' | 'color' | 'value' | 'enabled'>> }
  | { type: 'addChip'; chip: Pick<Chip, 'name' | 'color' | 'value'> }
  | { type: 'removeChip'; id: string }
  | { type: 'addPlayer'; id: string }
  | { type: 'updatePlayer'; id: string; patch: Partial<Pick<Player, 'name' | 'color'>> }
  | { type: 'removePlayer'; id: string }
  | { type: 'addBuyIn'; playerId: string }
  | { type: 'setBuyIn'; playerId: string; index: number; amount: number }
  | { type: 'removeBuyIn'; playerId: string; index: number }
  | { type: 'setFinalChips'; playerId: string; chipId: string; count: number }
  | { type: 'load'; game: Game }
  | { type: 'reset' }

function mapPlayer(game: Game, id: string, fn: (p: Player) => Player): Game {
  return { ...game, players: game.players.map((p) => (p.id === id ? fn(p) : p)) }
}

export function gameReducer(game: Game, action: GameAction): Game {
  switch (action.type) {
    case 'setCurrency':
      return { ...game, currency: action.currency }
    case 'setDefaultBuyIn':
      return { ...game, defaultBuyIn: action.amount }
    case 'updateChip':
      return { ...game, chips: game.chips.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)) }
    case 'addChip':
      return { ...game, chips: [...game.chips, { ...action.chip, id: uid(), enabled: true, custom: true }] }
    case 'removeChip':
      return {
        ...game,
        chips: game.chips.filter((c) => c.id !== action.id),
        players: game.players.map((p) => {
          const { [action.id]: _removed, ...finalChips } = p.finalChips
          return { ...p, finalChips }
        }),
      }
    case 'addPlayer': {
      const n = game.players.length
      const player: Player = {
        id: action.id,
        name: `Jugador ${n + 1}`,
        color: PLAYER_COLORS[n % PLAYER_COLORS.length],
        buyIns: [game.defaultBuyIn],
        finalChips: {},
      }
      return { ...game, players: [...game.players, player] }
    }
    case 'updatePlayer':
      return mapPlayer(game, action.id, (p) => ({ ...p, ...action.patch }))
    case 'removePlayer':
      return { ...game, players: game.players.filter((p) => p.id !== action.id) }
    case 'addBuyIn':
      return mapPlayer(game, action.playerId, (p) => ({ ...p, buyIns: [...p.buyIns, game.defaultBuyIn] }))
    case 'setBuyIn':
      return mapPlayer(game, action.playerId, (p) => ({
        ...p,
        buyIns: p.buyIns.map((b, i) => (i === action.index ? action.amount : b)),
      }))
    case 'removeBuyIn':
      return mapPlayer(game, action.playerId, (p) => ({ ...p, buyIns: p.buyIns.filter((_, i) => i !== action.index) }))
    case 'setFinalChips':
      return mapPlayer(game, action.playerId, (p) => ({
        ...p,
        finalChips: { ...p.finalChips, [action.chipId]: action.count },
      }))
    case 'load':
      return action.game
    case 'reset':
      return createGame()
  }
}

// ---------- Validación de datos externos (localStorage y enlaces compartidos) ----------

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isCents = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 1e11
const isColor = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)
const isText = (v: unknown): v is string => typeof v === 'string' && v.length <= 60

function sanitizeChip(raw: unknown): Chip | null {
  if (!isRecord(raw)) return null
  const { id, name, color, value, enabled, custom } = raw
  if (!isText(id) || !isText(name) || !isColor(color) || !isCents(value)) return null
  return { id, name, color, value, enabled: enabled === true, custom: custom === true }
}

function sanitizePlayer(raw: unknown): Player | null {
  if (!isRecord(raw)) return null
  const { id, name, color, buyIns, finalChips } = raw
  if (!isText(id) || !isText(name) || !isColor(color) || !Array.isArray(buyIns) || !isRecord(finalChips)) return null
  const counts: Record<string, number> = {}
  for (const [chipId, count] of Object.entries(finalChips)) {
    if (isCents(count)) counts[chipId] = count
  }
  return { id, name, color, buyIns: buyIns.filter(isCents), finalChips: counts }
}

/** Convierte datos de origen no fiable en una partida válida, o null si no lo son. */
export function sanitizeGame(raw: unknown): Game | null {
  if (!isRecord(raw)) return null
  const { currency, defaultBuyIn, chips, players } = raw
  if (currency !== 'EUR' && currency !== 'USD' && currency !== 'GBP') return null
  if (!isCents(defaultBuyIn) || !Array.isArray(chips) || !Array.isArray(players)) return null
  return {
    currency,
    defaultBuyIn,
    chips: chips.map(sanitizeChip).filter((c): c is Chip => c !== null),
    players: players.map(sanitizePlayer).filter((p): p is Player => p !== null),
  }
}
