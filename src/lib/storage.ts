import { sanitizeGame } from './game'
import type { Game } from './types'

const KEY = 'poker-calc:game:v1'

export function loadGame(): Game | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? sanitizeGame(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function saveGame(game: Game): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(game))
  } catch {
    // Navegación privada o almacenamiento lleno: la app sigue funcionando sin guardar.
  }
}
