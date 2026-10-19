import type { ReactNode } from 'react'
import { ChipToken } from './ChipToken'

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 lg:px-6">
        <div className="flex items-center gap-2.5">
          <ChipToken color="#C62F3A" size={28} />
          <h1 className="font-display text-xl font-bold tracking-wide text-gold">Poker Calc</h1>
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  )
}
