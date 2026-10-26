import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Languages, SunMoon, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from './ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export interface MenuItem {
  path: string
  label: string
  icon?: LucideIcon
}

export interface AppSidebarProps {
  siteName: string
  menuItems?: MenuItem[]
  direction?: 'ltr' | 'rtl'
  /** Optional content rendered below the menu (e.g. search) */
  extraContent?: React.ReactNode
  languageMenuItems?: LanguageMenuItem[]
  languageMenuLabel?: string
  /** Theme menu labels (for i18n) */
  themeMenuLabel?: string
  themeMenuAriaLabel?: string
  themeSystem?: string
  themeLight?: string
  themeDark?: string
  /**
   * Desktop collapse behaviour. 'offcanvas' (default) slides the sidebar fully out of view.
   * 'icon' collapses it to a narrow icon rail whose items show their names in tooltips.
   */
  collapsible?: 'offcanvas' | 'icon'
  /** Tooltip for the rail's expand button (icon mode). */
  expandLabel?: string
}

export interface LanguageMenuItem {
  path: string
  label: string
  isActive?: boolean
  onSelect?: () => void
  className?: string
}

/** Bottom inset so nav clears browser chrome. Chrome on iOS often reports 0 safe-area; use a minimum that clears its URL bar and keeps last item (e.g. Links) visible (~5.75rem). */
const MOBILE_NAV_BOTTOM = 'max(5.75rem, 1.5rem, env(safe-area-inset-bottom, 0px))'
const THEME_PREFERENCE_STORAGE_KEY = 'site-theme-preference'
type ThemePreference = 'system' | 'light' | 'dark'

/**
 * Configurable AppSidebar component.
 * On mobile, nav items are in a bar at the bottom of the sidebar panel (above browser chrome); it slides in/out with the sidebar.
 */
export function AppSidebar({
  siteName,
  menuItems = [],
  direction = 'ltr',
  extraContent,
  languageMenuItems = [],
  languageMenuLabel = 'Language',
  themeMenuLabel = 'Theme',
  themeMenuAriaLabel = 'Toggle theme menu',
  themeSystem = 'System',
  themeLight = 'Light',
  themeDark = 'Dark',
  collapsible = 'offcanvas',
  expandLabel = 'Expand sidebar',
}: AppSidebarProps) {
  const isRtl = direction === 'rtl'
  const location = useLocation()
  const { isMobile, setOpen, open } = useSidebar()
  const railMode = collapsible === 'icon' && !isMobile
  const collapsed = railMode && !open
  const labelHiddenWhenCollapsed = 'group-data-[state=collapsed]/sidebar:hidden'
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') {
      return 'system'
    }
    const storedThemePreference = window.localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY)
    return storedThemePreference === 'light' || storedThemePreference === 'dark' ? storedThemePreference : 'system'
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldUseDark = themePreference === 'dark' || (themePreference === 'system' && prefersDarkScheme)
    document.documentElement.classList.toggle('dark', shouldUseDark)

    if (themePreference === 'system') {
      window.localStorage.removeItem(THEME_PREFERENCE_STORAGE_KEY)
      return
    }
    window.localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, themePreference)
  }, [themePreference])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (themePreference !== 'system') {
        return
      }
      document.documentElement.classList.toggle('dark', event.matches)
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemThemeChange)
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }

    mediaQuery.addListener(handleSystemThemeChange)
    return () => mediaQuery.removeListener(handleSystemThemeChange)
  }, [themePreference])

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
        <SidebarMenu>
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.label}>
                <Link to={item.path} onClick={handleLinkClick} aria-label={item.label}>
                  {Icon && (
                    <span className="flex shrink-0 text-sidebar-foreground [&>svg]:size-5 [&>svg]:fill-none [&>svg]:stroke-current md:[&>svg]:size-4">
                      <Icon aria-hidden />
                    </span>
                  )}
                  <span className={labelHiddenWhenCollapsed}>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  const languageMenu = languageMenuItems.length > 0 ? (
    <SidebarGroup className="w-full">
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              type="button"
              tooltip={languageMenuLabel}
              onClick={() => {
                if (collapsed) {
                  setOpen(true)
                  setLanguageMenuOpen(true)
                  return
                }
                setLanguageMenuOpen((prev) => !prev)
              }}
              aria-expanded={languageMenuOpen && !collapsed}
              aria-label="Toggle language menu"
            >
              <span className="flex shrink-0 text-sidebar-foreground [&>svg]:size-5 [&>svg]:fill-none [&>svg]:stroke-current md:[&>svg]:size-4">
                <Languages aria-hidden />
              </span>
              <span className={labelHiddenWhenCollapsed}>{languageMenuLabel}</span>
              <ChevronDown
                aria-hidden
                className={`${isRtl ? 'mr-auto' : 'ml-auto'} h-4 w-4 shrink-0 transition-transform ${labelHiddenWhenCollapsed} ${languageMenuOpen ? 'rotate-180' : ''}`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
          {languageMenuOpen && !collapsed &&
            languageMenuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild isActive={item.isActive} className={item.className}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      item.onSelect?.()
                      setLanguageMenuOpen(false)
                      handleLinkClick()
                    }}
                  >
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ) : null

  const themeMenu = (
    <SidebarGroup className="w-full">
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              type="button"
              tooltip={themeMenuLabel}
              onClick={() => {
                if (collapsed) {
                  setOpen(true)
                  setThemeMenuOpen(true)
                  return
                }
                setThemeMenuOpen((prev) => !prev)
              }}
              aria-expanded={themeMenuOpen && !collapsed}
              aria-label={themeMenuAriaLabel}
            >
              <span className="flex shrink-0 text-sidebar-foreground [&>svg]:size-5 [&>svg]:fill-none [&>svg]:stroke-current md:[&>svg]:size-4">
                <SunMoon aria-hidden />
              </span>
              <span className={labelHiddenWhenCollapsed}>{themeMenuLabel}</span>
              <ChevronDown
                aria-hidden
                className={`${isRtl ? 'mr-auto' : 'ml-auto'} h-4 w-4 shrink-0 transition-transform ${labelHiddenWhenCollapsed} ${themeMenuOpen ? 'rotate-180' : ''}`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
          {themeMenuOpen && !collapsed && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  type="button"
                  isActive={themePreference === 'system'}
                  onClick={() => {
                    setThemePreference('system')
                    setThemeMenuOpen(false)
                  }}
                >
                  <span>{themeSystem}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  type="button"
                  isActive={themePreference === 'light'}
                  onClick={() => {
                    setThemePreference('light')
                    setThemeMenuOpen(false)
                  }}
                >
                  <span>{themeLight}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  type="button"
                  isActive={themePreference === 'dark'}
                  onClick={() => {
                    setThemePreference('dark')
                    setThemeMenuOpen(false)
                  }}
                >
                  <span>{themeDark}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  return (
    <Sidebar side={isMobile ? 'right' : isRtl ? 'right' : 'left'} collapsible={railMode ? 'icon' : 'offcanvas'}>
      <SidebarHeader className="group-data-[state=collapsed]/sidebar:px-0 group-data-[state=collapsed]/sidebar:justify-center">
        <div className="flex items-center gap-2 h-16 w-full group-data-[state=collapsed]/sidebar:justify-center">
          {!isMobile && (open || railMode) && (
            collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger aria-label={expandLabel} />
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  {expandLabel}
                </TooltipContent>
              </Tooltip>
            ) : (
              <SidebarTrigger className="-ml-1" />
            )
          )}
          {!collapsed && (
            <Link to="/" onClick={handleLinkClick} className="flex items-center gap-3 flex-1">
              <span className="text-base font-medium">{siteName}</span>
            </Link>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="md:pb-4 group-data-[state=collapsed]/sidebar:px-2">
        {isMobile ? (
          <>
            {extraContent != null && (
              <SidebarGroup>
                <SidebarGroupContent>{extraContent}</SidebarGroupContent>
              </SidebarGroup>
            )}
            <div className="flex-1 min-h-0" aria-hidden="true" />
          </>
        ) : (
          <>
            {menuContent}
            {extraContent != null && (
              <SidebarGroup>
                <SidebarGroupContent>{extraContent}</SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>
      {!isMobile && (
        <SidebarFooter className="h-auto w-full flex-col items-stretch gap-1 py-2 px-2 md:px-3 group-data-[state=collapsed]/sidebar:px-2">
          {themeMenu}
          {languageMenu}
        </SidebarFooter>
      )}
      {isMobile && (
        <div
          className="absolute inset-x-0 top-0 flex flex-col gap-2 border-t border-sidebar-border bg-sidebar px-2 pt-4 pb-6 text-sidebar-foreground md:hidden overflow-y-auto min-h-0"
          style={{ bottom: MOBILE_NAV_BOTTOM }}
        >
          <div className="flex-1 min-h-0" aria-hidden="true" />
          {themeMenu}
          {languageMenu}
          {menuContent}
        </div>
      )}
    </Sidebar>
  )
}
