import type { Player } from '../lib/types'

export function Avatar({ player, size = 36 }: { player: Player; size?: number }) {
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: player.color, fontSize: size * 0.4 }}
    >
      {player.name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  )
}
