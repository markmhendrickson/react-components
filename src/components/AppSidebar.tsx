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
}: AppSidebarProps) {
  const isRtl = direction === 'rtl'
  const location = useLocation()
  const { isMobile, setOpen, open } = useSidebar()
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
              <SidebarMenuButton asChild isActive={isActive(item.path)}>
                <Link to={item.path} onClick={handleLinkClick}>
                  {Icon && (
                    <span className="flex shrink-0 text-sidebar-foreground [&>svg]:size-5 [&>svg]:fill-none [&>svg]:stroke-current md:[&>svg]:size-4">
                      <Icon aria-hidden />
                    </span>
                  )}
                  <span>{item.label}</span>
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
              onClick={() => setLanguageMenuOpen((prev) => !prev)}
              aria-expanded={languageMenuOpen}
              aria-label="Toggle language menu"
            >
              <span className="flex shrink-0 text-sidebar-foreground [&>svg]:size-5 [&>svg]:fill-none [&>svg]:stroke-current md:[&>svg]:size-4">
                <Languages aria-hidden />
              </span>
              <span>{languageMenuLabel}</span>
              <ChevronDown
                aria-hidden
                className={`${isRtl ? 'mr-auto' : 'ml-auto'} h-4 w-4 shrink-0 transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
          {languageMenuOpen &&
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
              onClick={() => setThemeMenuOpen((prev) => !prev)}
              aria-expanded={themeMenuOpen}
              aria-label={themeMenuAriaLabel}
            >
              <span className="flex shrink-0 text-sidebar-foreground [&>svg]:size-5 [&>svg]:fill-none [&>svg]:stroke-current md:[&>svg]:size-4">
                <SunMoon aria-hidden />
              </span>
              <span>{themeMenuLabel}</span>
              <ChevronDown
                aria-hidden
                className={`${isRtl ? 'mr-auto' : 'ml-auto'} h-4 w-4 shrink-0 transition-transform ${themeMenuOpen ? 'rotate-180' : ''}`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
          {themeMenuOpen && (
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
    <Sidebar side={isMobile ? 'right' : isRtl ? 'right' : 'left'}>
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
        <SidebarFooter className="h-auto w-full flex-col items-stretch gap-1 py-2 px-2 md:px-3">
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
