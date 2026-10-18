function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

interface Props {
  color: string
  size?: number
  className?: string
}

/** Ficha de póker dibujada con CSS: borde con franjas y anillo interior. */
export function ChipToken({ color, size = 40, className }: Props) {
  const light = luminance(color) > 0.75
  const stripe = light ? '#2E6BD1' : '#F7F3EA'
  const ring = light ? '#9AA0A8' : 'rgba(255,255,255,.85)'

  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: 'inline-block',
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0 46%, ${ring} 47% 50%, ${color} 51% 64%, transparent 65%), repeating-conic-gradient(${color} 0 22.5deg, ${stripe} 22.5deg 45deg)`,
        boxShadow: 'inset 0 0 0 2px rgba(0,0,0,.25), 0 3px 6px rgba(0,0,0,.55)',
      }}
    />
  )
}
