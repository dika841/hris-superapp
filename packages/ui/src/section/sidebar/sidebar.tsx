import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { SidebarSimple, X } from '@phosphor-icons/react'
import { Button } from '../../primitives/button'
import { cn } from '@hris/utils'

const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

export type SidebarContext = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  openMobile: boolean
  setOpenMobile: (open: boolean | ((prev: boolean) => boolean)) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }
  return context
}

export interface SidebarProviderProps extends React.ComponentProps<'div'> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [_open, _setOpen] = React.useState(defaultOpen)
    const [openMobile, setOpenMobile] = React.useState(false)
    const [isMobile, setIsMobile] = React.useState(false)

    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === 'function' ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
      },
      [setOpenProp, open]
    )

    // Mobile detection
    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const toggleSidebar = React.useCallback(() => {
      return isMobile ? setOpenMobile((prev) => !prev) : setOpen((prev) => !prev)
    }, [isMobile, setOpen, setOpenMobile])

    // Keyboard shortcut (Cmd+B / Ctrl+B)
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [toggleSidebar])

    const state: 'expanded' | 'collapsed' = open ? 'expanded' : 'collapsed'

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            'group/sidebar-wrapper flex min-h-screen w-full text-sidebar-foreground transition-colors duration-200',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = 'SidebarProvider'

export interface SidebarProps extends React.ComponentProps<'aside'> {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      side = 'left',
      variant: _variant = 'sidebar',
      collapsible = 'icon',
      open: customOpen,
      onOpenChange: _setCustomOpen,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const sidebarContext = React.useContext(SidebarContext)
    const isMobile = sidebarContext?.isMobile ?? false
    const openMobile = sidebarContext?.openMobile ?? false
    const setOpenMobile = sidebarContext?.setOpenMobile

    // Support both provider-managed state and direct custom open prop
    const isOpen = customOpen !== undefined ? customOpen : (sidebarContext?.open ?? true)
    const state = isOpen ? 'expanded' : 'collapsed'

    // Non-collapsible variant
    if (collapsible === 'none') {
      return (
        <aside
          ref={ref}
          className={cn(
            'flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground shrink-0',
            side === 'left' ? 'border-r border-sidebar-border' : 'border-l border-sidebar-border',
            className
          )}
          {...props}
        >
          {children}
        </aside>
      )
    }

    // Mobile sheet drawer
    if (isMobile) {
      return (
        <>
          {openMobile && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
              onClick={() => setOpenMobile?.(false)}
            />
          )}
          <aside
            ref={ref}
            data-mobile="true"
            data-state={openMobile ? 'open' : 'closed'}
            className={cn(
              'fixed inset-y-0 z-50 flex h-full w-72 max-w-[85vw] flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-in-out',
              side === 'left'
                ? openMobile
                  ? 'translate-x-0 left-0 border-r border-sidebar-border'
                  : '-translate-x-full left-0'
                : openMobile
                  ? 'translate-x-0 right-0 border-l border-sidebar-border'
                  : 'translate-x-full right-0',
              className
            )}
            {...props}
          >
            <div className="absolute right-3 top-3 z-10">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setOpenMobile?.(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {children}
          </aside>
        </>
      )
    }

    // Desktop: Rock-solid flex sidebar with smooth transitions
    // If collapsible is 'icon', collapsed is w-16, expanded is w-64
    // If collapsible is 'offcanvas', collapsed is w-0 (hidden), expanded is default w-64 / w-72
    const widthClass = isOpen
      ? (className?.includes('w-') ? '' : 'w-64')
      : collapsible === 'icon'
        ? 'w-16'
        : 'w-0 border-none opacity-0 overflow-hidden'

    return (
      <aside
        ref={ref}
        data-state={state}
        data-side={side}
        data-collapsible={collapsible}
        className={cn(
          'relative flex flex-col h-screen shrink-0 bg-sidebar/95 backdrop-blur-xl text-sidebar-foreground transition-all duration-300 ease-in-out overflow-hidden',
          side === 'left' ? 'border-r border-sidebar-border' : 'border-l border-sidebar-border',
          widthClass,
          className
        )}
        {...props}
      >
        <div data-sidebar="sidebar" className="flex h-full w-full flex-col min-w-0 overflow-hidden">
          {children}
        </div>
      </aside>
    )
  }
)
Sidebar.displayName = 'Sidebar'

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const sidebar = React.useContext(SidebarContext)

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="sm"
      className={cn('h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer', className)}
      onClick={(event) => {
        onClick?.(event)
        sidebar?.toggleSidebar()
      }}
      aria-label="Toggle Sidebar"
      {...props}
    >
      <SidebarSimple className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = 'SidebarTrigger'

export const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>(({ className, ...props }, ref) => {
  const sidebar = React.useContext(SidebarContext)

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={() => sidebar?.toggleSidebar()}
      title="Toggle Sidebar"
      className={cn(
        'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear hover:bg-sidebar-border/50 sm:flex cursor-col-resize',
        'group-data-[side=left]:-right-2 group-data-[side=right]:-left-2',
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = 'SidebarRail'

export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'main'>
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        'relative flex min-h-screen flex-1 flex-col bg-background min-w-0 overflow-hidden transition-colors',
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = 'SidebarInset'

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-3.5 border-b border-sidebar-border/60 shrink-0', className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = 'SidebarHeader'

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-3 mt-auto border-t border-sidebar-border/60 shrink-0', className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = 'SidebarFooter'

export const SidebarSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="separator"
      className={cn('mx-2 my-1.5 h-px bg-sidebar-border/50', className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = 'SidebarSeparator'

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin',
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = 'SidebarContent'

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = 'SidebarGroup'

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        'flex h-6 shrink-0 items-center px-2 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider outline-none transition-all truncate',
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn('w-full text-sm', className)}
    {...props}
  />
))
SidebarGroupContent.displayName = 'SidebarGroupContent'

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn('flex w-full min-w-0 flex-col gap-0.5 list-none p-0 m-0', className)}
    {...props}
  />
))
SidebarMenu.displayName = 'SidebarMenu'

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn('group/menu-item relative list-none', className)}
    {...props}
  />
))
SidebarMenuItem.displayName = 'SidebarMenuItem'

export const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2.5 overflow-hidden rounded-xl p-2 text-left text-xs font-medium outline-none transition-all hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground focus-visible:ring-1 focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'text-sidebar-foreground/80 hover:text-sidebar-foreground',
        outline:
          'bg-background shadow-xs hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-sidebar-border',
      },
      size: {
        default: 'h-9 text-xs px-2.5',
        sm: 'h-8 text-xs px-2',
        lg: 'h-11 text-sm px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    asChild?: boolean
    isActive?: boolean
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = 'default',
      size = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(
          sidebarMenuButtonVariants({ variant, size }),
          isActive &&
          'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs border border-sidebar-border/60',
          className
        )}
        {...props}
      />
    )
  }
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

export const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      'ml-auto flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[10px] font-medium tabular-nums text-muted-foreground',
      className
    )}
    {...props}
  />
))
SidebarMenuBadge.displayName = 'SidebarMenuBadge'

export const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      'mx-3 flex min-w-0 translate-x-px flex-col gap-0.5 border-l border-sidebar-border/60 px-2 py-0.5 list-none',
      className
    )}
    {...props}
  />
))
SidebarMenuSub.displayName = 'SidebarMenuSub'

export const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('list-none', className)}
    {...props}
  />
))
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem'

export const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<'a'> & {
    asChild?: boolean
    size?: 'sm' | 'md'
    isActive?: boolean
  }
>(({ asChild = false, size = 'md', isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a'

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        'flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-lg px-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring cursor-pointer transition-colors',
        isActive && 'font-medium text-primary bg-primary/10',
        size === 'sm' && 'text-[11px]',
        size === 'md' && 'text-xs',
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton'
