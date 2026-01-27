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
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[Scroll] Saved position for', previousPathname.current, ':', scrollY)
      }
      
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
    
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Scroll] Route changed:', location.pathname)
      console.log('[Scroll] Saved positions:', Array.from(scrollPositions.current.entries()))
      console.log('[Scroll] Saved position for this route:', savedPosition)
    }
    
    if (savedPosition !== undefined && savedPosition > 0) {
      // Restore saved scroll position for previously visited pages
      isRestoringRef.current = true
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[Scroll] Restoring to position:', savedPosition)
      }
      
      // Wait for content to render - use multiple strategies for reliability
      const restoreScroll = () => {
        // Try multiple times to ensure content is loaded
        let attempts = 0
        const maxAttempts = 10
        
        const tryRestore = () => {
          attempts++
          
          // Check if page has content (not just empty)
          const hasContent = document.body.scrollHeight > window.innerHeight
          
          if (process.env.NODE_ENV === 'development' && attempts === 1) {
            console.log('[Scroll] Content check - scrollHeight:', document.body.scrollHeight, 'innerHeight:', window.innerHeight, 'hasContent:', hasContent)
          }
          
          if (hasContent || attempts >= maxAttempts) {
            const actualPosition = Math.min(savedPosition, document.body.scrollHeight - window.innerHeight)
            window.scrollTo({
              top: actualPosition,
              behavior: 'auto'
            })
            
            if (process.env.NODE_ENV === 'development') {
              console.log('[Scroll] Restored to position:', actualPosition, '(attempt', attempts + ')')
            }
            
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
      // Scroll to top for new pages
      if (process.env.NODE_ENV === 'development') {
        console.log('[Scroll] New page - scrolling to top')
      }
      
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
      <SidebarInset className="min-w-0 max-w-full overflow-x-hidden">
        <PageHeader breadcrumbs={breadcrumbs} />
        <main className="min-h-[calc(100vh-4rem)] pt-[86px] p-4 md:p-6 min-w-0 max-w-full overflow-x-hidden">
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

function PageHeader({ breadcrumbs }: PageHeaderProps) {
  const { open } = useSidebar()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 min-w-0 max-w-full overflow-x-hidden">
      {!open && <SidebarTrigger className="-ml-1 shrink-0" />}
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
