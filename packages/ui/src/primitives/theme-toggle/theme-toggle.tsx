import * as React from 'react'
import { Sun, Moon } from '@phosphor-icons/react'
import { themeStore, toggleTheme } from '@hris/utils'
import { useStore } from '@tanstack/react-store'
import { cn } from '@hris/utils'

export interface ThemeToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  showLabel?: boolean
}

export const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ className, showLabel = false, ...props }, ref) => {
    const { resolved } = useStore(themeStore)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted) {
      return (
        <button
          ref={ref}
          type="button"
          aria-label="Toggle theme"
          className={cn(
            'inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 opacity-60',
            className
          )}
          {...props}
        >
          <span className="h-4 w-4" />
        </button>
      )
    }

    const isDark = resolved === 'dark'

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => toggleTheme()}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle theme"
        className={cn(
          'inline-flex items-center justify-center gap-2 h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all duration-200 active:scale-95 shadow-sm cursor-pointer select-none',
          showLabel ? 'px-3' : 'w-9',
          className
        )}
        {...props}
      >
        <span className="relative flex items-center justify-center h-4 w-4">
          <Sun
            className={cn(
              'h-4 w-4 transition-all duration-300 transform',
              isDark ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100 text-amber-500'
            )}
          />
          <Moon
            className={cn(
              'h-4 w-4 transition-all duration-300 transform',
              isDark ? 'rotate-0 scale-100 opacity-100 text-indigo-400' : '-rotate-90 scale-0 opacity-0 absolute'
            )}
          />
        </span>
        {showLabel && (
          <span className="text-xs font-medium">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        )}
      </button>
    )
  }
)
ThemeToggle.displayName = 'ThemeToggle'
