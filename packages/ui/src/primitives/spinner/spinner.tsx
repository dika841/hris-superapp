import * as React from 'react'
import { CircleNotch } from '@phosphor-icons/react'
import { cn } from '@hris/utils'

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg'
}

export function Spinner({ size = 'md', className, ...props }: SpinnerProps) {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <CircleNotch
      className={cn('animate-spin text-indigo-400', sizeMap[size], className)}
      {...props}
    />
  )
}
