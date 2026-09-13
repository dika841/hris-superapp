import * as React from 'react'
import { cn } from '@hris/utils'
import { Label } from '../../primitives/label'

export const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('space-y-1.5', className)} {...props} />
  )
})
FormItem.displayName = 'FormItem'

export const FormLabel = React.forwardRef<
  React.ComponentRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label> & { isRequired?: boolean }
>(({ className, isRequired, children, ...props }, ref) => {
  return (
    <Label
      ref={ref}
      className={cn('text-xs font-medium text-foreground', className)}
      isRequired={isRequired}
      {...props}
    >
      {children}
    </Label>
  )
})
FormLabel.displayName = 'FormLabel'

export const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  return <div ref={ref} {...props} />
})
FormControl.displayName = 'FormControl'

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-xs text-muted-foreground leading-normal', className)}
      {...props}
    />
  )
})
FormDescription.displayName = 'FormDescription'

export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
  errors?: (string | { message?: string } | undefined)[]
}

export const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, errors, children, ...props }, ref) => {
    let body: React.ReactNode = children

    if (!body && errors?.length) {
      const first = errors[0]
      body = typeof first === 'string' ? first : first?.message || 'Invalid value'
    }

    if (!body) {
      return null
    }

    return (
      <p
        ref={ref}
        className={cn('text-xs font-medium text-destructive animate-in fade-in-50', className)}
        {...props}
      >
        {body}
      </p>
    )
  }
)
FormMessage.displayName = 'FormMessage'
