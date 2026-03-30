import clsx from 'clsx'
import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string | null
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      <input
        className={clsx(
          'w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-text placeholder:text-muted outline-none ring-primary transition focus:ring-2',
          error ? 'border-danger' : '',
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  )
}
