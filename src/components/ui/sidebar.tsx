import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { PanelLeft } from "lucide-react"
import { cn } from "../../lib/utils"

// Constants
const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

// Context types
interface SidebarContextValue {
  open: boolean
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void
  state: "expanded" | "collapsed"
  isMobile: boolean
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Context
const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  ...props
}) => {
  // Assume mobile (sidebar closed) until we measure, to avoid flash on mobile
  const [isMobile, setIsMobile] = React.useState(true)
  const [open, _setOpen] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        const cookieValue = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
          ?.split("=")[1]
        _setOpen(cookieValue === "true" || cookieValue === "false" ? cookieValue === "true" : defaultOpen)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [defaultOpen])

  const setOpen = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }
      // Persist to cookie
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === SIDEBAR_KEYBOARD_SHORTCUT
      ) {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setOpen])


  // Close sidebar only when resizing from desktop to mobile (not when already on mobile and user opens)
  const prevIsMobileRef = React.useRef(isMobile)
  React.useEffect(() => {
    const wasDesktopNowMobile = isMobile && !prevIsMobileRef.current
    prevIsMobileRef.current = isMobile
    if (wasDesktopNowMobile && open) {
      _setOpen(false)
    }
  }, [isMobile, open])

  const value = React.useMemo(
    () => ({
      open: openProp ?? open,
      setOpen,
      state: (openProp ?? open) ? "expanded" as const : "collapsed" as const,
      isMobile,
    }),
    [open, openProp, setOpen, isMobile]
  )

  return (
    <SidebarContext.Provider value={value} {...props}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return {
    ...context,
    toggleSidebar: () => context.setOpen((prev) => !prev),
  }
}

// Sidebar Component
interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(({
  className,
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  ...props
}, ref) => {
  const { open, state } = useSidebar()

  return (
    <aside
      ref={ref as React.Ref<HTMLElement>}
      data-state={state}
      data-side={side}
      data-variant={variant}
      data-collapsible={collapsible}
      className={cn(
        "group/sidebar fixed inset-y-0 z-40 flex h-screen flex-col gap-2 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width,transform] duration-200 ease-linear",
        side === "left" ? "left-0" : "right-0",
        variant === "floating" && "m-2 rounded-lg border",
        variant === "inset" && "border-0",
        collapsible === "offcanvas" && !open && (side === "left" ? "-translate-x-full" : "translate-x-full"),
        // On mobile, hide by default with CSS so no flash before hydration; show only when expanded
        collapsible === "offcanvas" && side === "left" && "max-md:-translate-x-full max-md:data-[state=expanded]:translate-x-0",
        collapsible === "offcanvas" && side === "right" && "max-md:translate-x-full max-md:data-[state=expanded]:translate-x-0",
        collapsible === "icon" && !open ? "w-16" : "w-64",
        collapsible !== "icon" && open && "w-64",
        className
      )}
      style={{
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-icon": "3rem",
        width: collapsible === "icon" && !open ? "3rem" : SIDEBAR_WIDTH,
      } as React.CSSProperties}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"

// SidebarHeader
const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border pl-4 pr-4 md:pl-4 md:pr-5", className)}
      {...props}
    />
  )
)
SidebarHeader.displayName = "SidebarHeader"

// SidebarContent
const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-2 py-4 md:px-3", className)}
      {...props}
    />
  )
)
SidebarContent.displayName = "SidebarContent"

// SidebarFooter
const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-16 shrink-0 items-center gap-2 border-t border-sidebar-border px-4 md:px-6", className)}
      {...props}
    />
  )
)
SidebarFooter.displayName = "SidebarFooter"

// SidebarGroup
const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
)
SidebarGroup.displayName = "SidebarGroup"

// SidebarGroupLabel
interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, SidebarGroupLabelProps>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        ref={ref}
        className={cn(
          "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-linear focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

// SidebarGroupAction
interface SidebarGroupActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const SidebarGroupAction = React.forwardRef<HTMLButtonElement, SidebarGroupActionProps>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarGroupAction.displayName = "SidebarGroupAction"

// SidebarGroupContent
const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("w-full", className)}
      {...props}
    />
  )
)
SidebarGroupContent.displayName = "SidebarGroupContent"

// SidebarMenu
const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("flex w-full min-w-0 flex-col gap-1 list-none", className)}
      {...props}
    />
  )
)
SidebarMenu.displayName = "SidebarMenu"

// SidebarMenuItem
const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("group/menu-item relative list-none", className)}
      {...props}
    />
  )
)
SidebarMenuItem.displayName = "SidebarMenuItem"

// SidebarMenuButton
interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  isActive?: boolean
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ asChild = false, isActive, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        data-active={isActive}
        className={cn(
          "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-side=left]]/sidebar-item:pr-2 group-has-[[data-side=right]]/sidebar-item:pl-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// SidebarMenuAction
const SidebarMenuAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 opacity-0 transition-opacity group-hover/menu-item:opacity-100 peer-data-[active=true]/menu-button:opacity-100",
        className
      )}
      {...props}
    />
  )
)
SidebarMenuAction.displayName = "SidebarMenuAction"

// SidebarMenuBadge
const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
        className
      )}
      {...props}
    />
  )
)
SidebarMenuBadge.displayName = "SidebarMenuBadge"

// SidebarMenuSkeleton
interface SidebarMenuSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showIcon?: boolean
}

const SidebarMenuSkeleton = React.forwardRef<HTMLDivElement, SidebarMenuSkeletonProps>(
  ({ className, showIcon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
        {...props}
      >
        {showIcon && (
          <div className="flex h-4 w-4 items-center justify-center rounded-md bg-sidebar-accent" />
        )}
        <div className="flex h-4 flex-1 items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-sidebar-accent" />
        </div>
      </div>
    )
  }
)
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

// SidebarMenuSub
const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn(
        "mx-3.5 flex min-w-0 flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 list-none",
        className
      )}
      {...props}
    />
  )
)
SidebarMenuSub.displayName = "SidebarMenuSub"

// SidebarMenuSubItem
const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("list-none", className)} {...props} />
  )
)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

// SidebarMenuSubButton
interface SidebarMenuSubButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean
}

const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, SidebarMenuSubButtonProps>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"
    return (
      <Comp
        ref={ref}
        className={cn(
          "flex min-w-0 -indent-3 items-center gap-2 rounded-md p-2 pl-7 text-sidebar-foreground outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

// SidebarSeparator
const SidebarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mx-2 my-2 h-px shrink-0 bg-sidebar-border", className)}
      {...props}
    />
  )
)
SidebarSeparator.displayName = "SidebarSeparator"

// SidebarRail
const SidebarRail = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { open, setOpen } = useSidebar()
    return (
      <button
        ref={ref}
        onClick={() => setOpen(!open)}
        className={cn(
          "absolute inset-y-0 z-50 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:-translate-x-1/2 after:bg-sidebar-border after:transition-all after:duration-200 hover:after:bg-sidebar-accent group-data-[side=left]/sidebar:left-full group-data-[side=left]/sidebar:hover:translate-x-0 group-data-[side=right]/sidebar:right-full group-data-[side=right]/sidebar:-translate-x-1/2 group-data-[collapsible=icon]/sidebar:block",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarRail.displayName = "SidebarRail"

// SidebarInset
const SidebarInset = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => {
    const { open, isMobile } = useSidebar()
    return (
      <main
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          "relative flex min-h-screen flex-1 flex-col bg-background min-w-0",
          !isMobile && open && "md:ml-64",
          "transition-[margin] duration-200 ease-linear",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarInset.displayName = "SidebarInset"

// SidebarTrigger
const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()
    return (
      <button
        ref={ref}
        onClick={toggleSidebar}
        className={cn(
          "inline-flex items-center justify-center rounded-md p-2 text-sm font-medium outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        <PanelLeft className="size-4" />
        <span className="sr-only">Toggle sidebar</span>
      </button>
    )
  }
)
SidebarTrigger.displayName = "SidebarTrigger"

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarRail,
  SidebarInset,
  SidebarTrigger,
}
