import { Link, useLocation } from 'react-router-dom'
import { type LucideIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
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

interface AppSidebarProps {
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
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 h-16 w-full">
          {open && <SidebarTrigger />}
          <Link to="/" onClick={handleLinkClick} className="flex items-center gap-3 flex-1">
            <span className="text-base font-medium">{siteName}</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <Link to={item.path} onClick={handleLinkClick}>
                      {Icon && <Icon className="size-4" />}
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
