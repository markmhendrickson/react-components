import React, { useState, useEffect, useRef } from 'react'
import { useLocation, Link, useParams, type Params } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from './ui/sidebar'
import { AppSidebar, type MenuItem } from './AppSidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import { cn } from '../lib/utils'

const DEBUG_SCROLL = false

function scrollLog(...args: unknown[]) {
  if (DEBUG_SCROLL && process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}

interface BreadcrumbItem {
  label: string
  href: string
  isLast: boolean
}

export interface LayoutProps {
  children: React.ReactNode
  siteName?: string
  menuItems?: MenuItem[]
  routeNames?: Record<string, string>
  getBreadcrumbLabel?: (pathname: string, params: Params) => string | null
}

/**
 * Configurable Layout component
 */
export function Layout({
  children,
  siteName,
  menuItems = [],
  routeNames = {},
  getBreadcrumbLabel
}: LayoutProps) {
  const location = useLocation()
  const params = useParams()
  const [dynamicLabel, setDynamicLabel] = useState<string | null>(null)
  const scrollPositions = useRef(new Map<string, number>())
  const previousPathname = useRef(location.pathname)
  const isRestoringRef = useRef(false)

  // Save scroll position when leaving a page (runs before pathname changes)
  useEffect(() => {
    // Save current page's scroll position before navigation
    if (previousPathname.current !== location.pathname) {
      const scrollY = window.scrollY
      scrollPositions.current.set(previousPathname.current, scrollY)

      scrollLog('[Scroll] Saved position for', previousPathname.current, ':', scrollY)

      // Update previous pathname after saving
      previousPathname.current = location.pathname
    }
  }, [location.pathname])

  // Save scroll position as user scrolls (debounced)
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>
    const handleScroll = () => {
      // Don't save scroll position if we're in the middle of restoring
      if (isRestoringRef.current) return

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        scrollPositions.current.set(location.pathname, window.scrollY)
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [location.pathname])

  // Restore scroll position or scroll to top on route change
  useEffect(() => {
    const savedPosition = scrollPositions.current.get(location.pathname)

    scrollLog('[Scroll] Route changed:', location.pathname)
    scrollLog('[Scroll] Saved positions:', Array.from(scrollPositions.current.entries()))
    scrollLog('[Scroll] Saved position for this route:', savedPosition)

    if (savedPosition !== undefined && savedPosition > 0) {
      // Restore saved scroll position for previously visited pages
      isRestoringRef.current = true

      scrollLog('[Scroll] Restoring to position:', savedPosition)

      // Wait for content to render - use multiple strategies for reliability
      const restoreScroll = () => {
        // Try multiple times to ensure content is loaded
        let attempts = 0
        const maxAttempts = 10

        const tryRestore = () => {
          attempts++

          // Check if page has content (not just empty)
          const hasContent = document.body.scrollHeight > window.innerHeight

          if (attempts === 1) {
            scrollLog('[Scroll] Content check - scrollHeight:', document.body.scrollHeight, 'innerHeight:', window.innerHeight, 'hasContent:', hasContent)
          }

          if (hasContent || attempts >= maxAttempts) {
            const actualPosition = Math.min(savedPosition, document.body.scrollHeight - window.innerHeight)
            window.scrollTo({
              top: actualPosition,
              behavior: 'auto'
            })

            scrollLog('[Scroll] Restored to position:', actualPosition, '(attempt', attempts + ')')

            // Allow scroll tracking after a brief delay
            setTimeout(() => {
              isRestoringRef.current = false
            }, 100)
          } else {
            // Retry after a short delay
            requestAnimationFrame(() => {
              setTimeout(tryRestore, 50)
            })
          }
        }

        // Start restoration process
        requestAnimationFrame(() => {
          setTimeout(tryRestore, 0)
        })
      }

      restoreScroll()
    } else {
      scrollLog('[Scroll] New page - scrolling to top')

      isRestoringRef.current = true
      window.scrollTo({ top: 0, behavior: 'auto' })

      setTimeout(() => {
        isRestoringRef.current = false
      }, 100)
    }
  }, [location.pathname])

  // Load dynamic label if getBreadcrumbLabel function is provided
  useEffect(() => {
    if (getBreadcrumbLabel) {
      const label = getBreadcrumbLabel(location.pathname, params)
      setDynamicLabel(label)
    } else {
      setDynamicLabel(null)
    }
  }, [location.pathname, params, getBreadcrumbLabel])

  // Generate breadcrumb items from pathname
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter((x) => x)
    const breadcrumbs: BreadcrumbItem[] = []

    // Always include Home
    breadcrumbs.push({ label: 'Home', href: '/', isLast: false })

    // Build breadcrumbs from path segments
    let currentPath = ''
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathnames.length - 1

      // Use custom label function if provided
      let label: string
      if (getBreadcrumbLabel && isLast && dynamicLabel) {
        label = dynamicLabel
      } else if (routeNames[segment]) {
        label = routeNames[segment]
      } else {
        // Format label (capitalize, replace hyphens with spaces)
        label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }

      breadcrumbs.push({
        label,
        href: currentPath,
        isLast,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar siteName={siteName || ''} menuItems={menuItems} />
      <MobileMenuFab />
      <SidebarInset className="min-w-0 max-w-full overflow-x-hidden">
        <PageHeader breadcrumbs={breadcrumbs} />
        <main className="min-h-[calc(100vh-var(--header-height,4rem))] pt-4 px-4 pb-4 md:pt-[var(--header-height,4rem)] md:px-6 md:pb-6 min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

/**
 * Page header component that conditionally shows sidebar trigger
 */
interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[]
}

/**
 * Fixed menu button at bottom-right on mobile only. Opens sidebar from the right.
 * Bottom inset uses 5.5rem minimum so Chrome on iOS (which often reports 0 safe-area) doesn't cover the FAB.
 */
function MobileMenuFab() {
  const { isMobile } = useSidebar()
  if (!isMobile) return null
  return (
    <div
      className="fixed right-6 z-50 md:hidden"
      style={{ bottom: 'max(5.5rem, 1.5rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <SidebarTrigger
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open menu"
      />
    </div>
  )
}

function PageHeader({ breadcrumbs }: PageHeaderProps) {
  const { open, isMobile } = useSidebar()

  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-height,4rem)] items-center gap-4 border-b bg-background px-4 min-w-0 max-w-full overflow-x-hidden">
      {/* Desktop: show trigger in header when sidebar is closed; mobile uses fixed FAB */}
      {!isMobile && !open && <SidebarTrigger className="-ml-1 shrink-0" />}
      <Breadcrumb className="min-w-0 flex-1 overflow-hidden max-w-full">
        <BreadcrumbList className="flex-nowrap min-w-0 max-w-full">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem className={cn(
                "min-w-0",
                index === breadcrumbs.length - 1 ? "flex-1 min-w-0" : "shrink-0"
              )}>
                {crumb.isLast ? (
                  <BreadcrumbPage className="truncate block w-full">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href} className="truncate whitespace-nowrap">{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="shrink-0" />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
