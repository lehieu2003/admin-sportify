import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary text-black hover:bg-primary-hover',
  secondary: 'bg-panel-alt text-text hover:bg-zinc-700',
  danger: 'bg-danger text-white hover:brightness-110',
  ghost: 'bg-transparent text-text hover:bg-white/10',
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  )
}
