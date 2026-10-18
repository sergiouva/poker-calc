import { sanitizeGame } from './game'
import type { Game } from './types'

const PARAM = 'p'

export function encodeGame(game: Game): string {
  const bytes = new TextEncoder().encode(JSON.stringify(game))
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeGame(encoded: string): Game | null {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
    return sanitizeGame(JSON.parse(new TextDecoder().decode(bytes)))
  } catch {
    return null
  }
}

/** La partida va en el hash (#p=…), así nunca llega a ningún servidor. */
export function buildShareUrl(game: Game): string {
  return `${location.origin}${location.pathname}#${PARAM}=${encodeGame(game)}`
}

export function readSharedGame(): Game | null {
  const value = new URLSearchParams(location.hash.slice(1)).get(PARAM)
  return value ? decodeGame(value) : null
}

export function clearSharedGame(): void {
  history.replaceState(null, '', location.pathname + location.search)
}
