import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@hris/utils'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 select-none',
  {
    variants: {
      variant: {
        default: 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        secondary: 'border-slate-200/80 dark:border-slate-700/60 bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400',
        success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        destructive: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400',
        danger: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400',
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
        info: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        outline: 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
