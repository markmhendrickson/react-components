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

/**
 * Configurable AppSidebar component
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
      <SidebarContent
        className="md:pb-4"
        style={isMobile ? { paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' } : undefined}
      >
        {/* Spacer on mobile pushes menu to bottom for thumb reachability */}
        <div className="flex-1 min-h-0 md:hidden" aria-hidden="true" />
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
      </SidebarContent>
    </Sidebar>
  )
}
