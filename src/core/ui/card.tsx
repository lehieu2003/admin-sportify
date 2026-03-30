import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border/80 bg-panel/85 p-6 shadow-[0_8px_28px_rgba(0,0,0,0.25)] backdrop-blur',
        className,
      )}
      {...props}
    />
  )
}
