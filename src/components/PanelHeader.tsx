import type { ReactNode } from 'react'

export function PanelHeader({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="mb-1 flex items-end justify-between gap-3 px-1">
      <div>
        <h2 className="font-display text-xl lg:text-lg lg:text-gold">{title}</h2>
        {hint && <p className="mt-0.5 text-[13px] leading-snug text-muted">{hint}</p>}
      </div>
      {action}
    </div>
  )
}
