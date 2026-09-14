import * as React from 'react'
import { CaretLeft, CaretRight, DotsThree } from '@phosphor-icons/react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@hris/utils'
import { buttonVariants, type ButtonProps } from '../../primitives/button'

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

export type PaginationLinkProps = {
  isActive?: boolean
  href?: string
  asChild?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ButtonHTMLAttributes<HTMLButtonElement>

const PaginationLink = ({
  className,
  isActive,
  size = 'sm',
  href,
  asChild = false,
  ...props
}: PaginationLinkProps) => {
  if (href) {
    return (
      <a
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          buttonVariants({
            variant: isActive ? 'outline' : 'ghost',
            size,
          }),
          isActive && 'border-primary/50 bg-primary/10 text-primary font-semibold hover:bg-primary/15',
          className
        )}
        {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      />
    )
  }

  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      type="button"
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        isActive && 'border-primary/50 bg-primary/10 text-primary font-semibold hover:bg-primary/15',
        className
      )}
      {...props}
    />
  )
}
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({
  className,
  text = 'Previous',
  ...props
}: PaginationLinkProps & { text?: string }) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="sm"
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
    <CaretLeft className="h-4 w-4" />
    <span className="hidden sm:inline">{text}</span>
  </PaginationLink>
)
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({
  className,
  text = 'Next',
  ...props
}: PaginationLinkProps & { text?: string }) => (
  <PaginationLink
    aria-label="Go to next page"
    size="sm"
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    <span className="hidden sm:inline">{text}</span>
    <CaretRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-8 w-8 items-center justify-center text-muted-foreground', className)}
    {...props}
  >
    <DotsThree className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
