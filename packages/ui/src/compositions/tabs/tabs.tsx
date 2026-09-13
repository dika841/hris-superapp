import * as React from 'react'
import { cn } from '@hris/utils'

interface TabsContextValue {
  value: string
  onValueChange: (val: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

export function Tabs({ defaultValue, value: controlledValue, onValueChange, className, children, ...props }: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || '')
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const handleValueChange = React.useCallback((val: string) => {
    if (!isControlled) setUncontrolledValue(val)
    onValueChange?.(val)
  }, [isControlled, onValueChange])

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-xl bg-slate-900/90 p-1 border border-slate-800 text-slate-400',
        className
      )}
      {...props}
    />
  )
)
TabsList.displayName = 'TabsList'

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = React.useContext(TabsContext)
    const isSelected = ctx?.value === value

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          isSelected
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
          className
        )}
        onClick={() => ctx?.onValueChange(value)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = React.useContext(TabsContext)
    if (ctx?.value !== value) return null

    return (
      <div
        ref={ref}
        className={cn('mt-4 focus-visible:outline-none animate-in fade-in-50 duration-200', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = 'TabsContent'
