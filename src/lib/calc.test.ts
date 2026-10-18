import { describe, expect, it } from 'vitest'
import { computeResults, settle } from './calc'
import { createGame } from './defaults'
import { gameReducer, sanitizeGame } from './game'
import { formatMoney, parseMoney } from './money'
import { decodeGame, encodeGame } from './share'
import type { Game, Player } from './types'

function player(id: string, buyIns: number[], finalChips: Record<string, number>): Player {
  return { id, name: id, color: '#C62F3A', buyIns, finalChips }
}

// Ejemplo de los mockups: blanca 0,05 · roja 0,25 · azul 1 · verde 5
function sampleGame(): Game {
  return {
    ...createGame(),
    players: [
      player('Ana', [2000], { white: 15, red: 12, blue: 11, green: 4 }),
      player('Bruno', [2000], { white: 10, red: 4, blue: 5, green: 1 }),
      player('Carla', [2000], { white: 5, red: 8, blue: 5, green: 3 }),
      player('Dani', [2000], { white: 10, red: 4, blue: 5, green: 1 }),
    ],
  }
}

describe('computeResults', () => {
  it('calcula el neto de cada jugador y comprueba que cuadra', () => {
    const r = computeResults(sampleGame())
    expect(r.rows.map((x) => [x.player.id, x.net])).toEqual([
      ['Ana', 1475],
      ['Carla', 225],
      ['Bruno', -850],
      ['Dani', -850],
    ])
    expect(r.totalInvested).toBe(8000)
    expect(r.difference).toBe(0)
  })

  it('cuenta las recompras como dinero aportado', () => {
    const game = { ...createGame(), players: [player('A', [2000, 1000], { green: 5 })] }
    expect(computeResults(game).rows[0]).toMatchObject({ invested: 3000, final: 2500, net: -500 })
  })

  it('ignora las fichas desactivadas', () => {
    const game = { ...createGame(), players: [player('A', [0], { black: 3, blue: 2 })] }
    expect(computeResults(game).rows[0].final).toBe(200)
  })

  it('detecta cuando las fichas no cuadran', () => {
    const game = sampleGame()
    game.players[0].finalChips.white = 10
    expect(computeResults(game).difference).toBe(-25)
  })
})

describe('settle', () => {
  it('reparte las deudas del ejemplo en 3 pagos', () => {
    const s = settle(computeResults(sampleGame()).rows)
    expect(s.map((x) => [x.from.id, x.to.id, x.amount])).toEqual([
      ['Bruno', 'Ana', 850],
      ['Dani', 'Ana', 625],
      ['Dani', 'Carla', 225],
    ])
  })

  it('empareja primero deudas y créditos idénticos', () => {
    const rows = [
      { player: player('A', [], {}), invested: 0, final: 0, net: 500 },
      { player: player('B', [], {}), invested: 0, final: 0, net: 300 },
      { player: player('C', [], {}), invested: 0, final: 0, net: -300 },
      { player: player('D', [], {}), invested: 0, final: 0, net: -500 },
    ]
    expect(settle(rows)).toHaveLength(2)
  })

  it('la suma pagada a cada acreedor coincide con lo que gana', () => {
    const rows = computeResults(sampleGame()).rows
    const received = new Map<string, number>()
    for (const s of settle(rows)) received.set(s.to.id, (received.get(s.to.id) ?? 0) + s.amount)
    expect(received.get('Ana')).toBe(1475)
    expect(received.get('Carla')).toBe(225)
  })
})

describe('reducer', () => {
  it('al borrar una ficha se limpian los recuentos de los jugadores', () => {
    let game = gameReducer(createGame(), { type: 'addChip', chip: { name: 'Morada', color: '#7A5AC8', value: 200 } })
    const chipId = game.chips.at(-1)!.id
    game = gameReducer(game, { type: 'addPlayer', id: 'p1' })
    game = gameReducer(game, { type: 'setFinalChips', playerId: 'p1', chipId, count: 4 })
    game = gameReducer(game, { type: 'removeChip', id: chipId })
    expect(game.players[0].finalChips).toEqual({})
  })

  it('las recompras usan la entrada por defecto', () => {
    let game = gameReducer(createGame(), { type: 'setDefaultBuyIn', amount: 1000 })
    game = gameReducer(game, { type: 'addPlayer', id: 'p1' })
    game = gameReducer(game, { type: 'addBuyIn', playerId: 'p1' })
    expect(game.players[0].buyIns).toEqual([1000, 1000])
  })
})

describe('money', () => {
  it('parsea importes con coma o punto', () => {
    expect(parseMoney('1,25')).toBe(125)
    expect(parseMoney('0.05')).toBe(5)
    expect(parseMoney('20')).toBe(2000)
    expect(parseMoney('')).toBe(0)
    expect(parseMoney('1,2,3')).toBeNull()
  })

  it('formatea con signo', () => {
    expect(formatMoney(1475, 'EUR', { signed: true })).toMatch(/^\+14,75\s€$/)
    expect(formatMoney(-850, 'EUR', { signed: true })).toMatch(/^−8,50\s€$/)
  })
})

describe('compartir', () => {
  it('codifica y decodifica la partida, con acentos incluidos', () => {
    const game = sampleGame()
    game.players[0].name = 'Ángela ñ'
    expect(decodeGame(encodeGame(game))).toEqual(game)
  })

  it('rechaza datos inválidos', () => {
    expect(decodeGame('basura')).toBeNull()
    expect(sanitizeGame({ currency: 'XXX' })).toBeNull()
    const game = sampleGame() as unknown as { players: { color: string }[] }
    game.players[0].color = 'red; background:url(x)'
    expect(sanitizeGame(game)?.players).toHaveLength(3)
  })
})
