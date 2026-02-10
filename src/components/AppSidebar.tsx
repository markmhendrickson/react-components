import { Link, useLocation } from 'react-router-dom'
import { type LucideIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from './ui/sidebar'

export interface MenuItem {
  path: string
  label: string
  icon?: LucideIcon
}

export interface AppSidebarProps {
  siteName: string
  menuItems?: MenuItem[]
}

/** Bottom inset so nav clears browser chrome. Chrome on iOS often reports 0 safe-area; use a minimum that clears its URL bar (~5.5rem). */
const MOBILE_NAV_BOTTOM = 'max(5.5rem, 1.5rem, env(safe-area-inset-bottom, 0px))'

/**
 * Configurable AppSidebar component.
 * On mobile, nav items are in a bar at the bottom of the sidebar panel (above browser chrome); it slides in/out with the sidebar.
 */
export function AppSidebar({ siteName, menuItems = [] }: AppSidebarProps) {
  const location = useLocation()
  const { isMobile, setOpen, open } = useSidebar()

  const isActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleLinkClick = () => {
    if (isMobile) {
      setOpen(false)
    }
  }

  const menuContent = (
    <SidebarGroup>
      <SidebarGroupContent>
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild isActive={isActive(item.path)}>
                <Link to={item.path} onClick={handleLinkClick}>
                  {Icon && <Icon className="size-5 shrink-0 md:size-4" />}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarGroupContent>
    </SidebarGroup>
  )

  return (
    <Sidebar side={isMobile ? 'right' : 'left'}>
      <SidebarHeader>
        <div className="flex items-center gap-2 h-16 w-full">
          {open && !isMobile && <SidebarTrigger className="-ml-1" />}
          <Link to="/" onClick={handleLinkClick} className="flex items-center gap-3 flex-1">
            <span className="text-base font-medium">{siteName}</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="md:pb-4">
        {isMobile ? (
          <div className="flex-1 min-h-0" aria-hidden="true" />
        ) : (
          menuContent
        )}
      </SidebarContent>
      {isMobile && (
        <div
          className="absolute inset-x-0 flex flex-col gap-2 border-t border-sidebar-border bg-sidebar px-2 py-4 text-sidebar-foreground md:hidden"
          style={{ bottom: MOBILE_NAV_BOTTOM }}
        >
          {menuContent}
        </div>
      )}
    </Sidebar>
  )
}
