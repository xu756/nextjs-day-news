import type { ReactNode } from 'react'

export function MdxCallout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <aside className="not-prose my-6 rounded-2xl border border-border/80 bg-accent/45 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
        {title}
      </p>
      <div className="text-sm leading-7 text-foreground/90">{children}</div>
    </aside>
  )
}
