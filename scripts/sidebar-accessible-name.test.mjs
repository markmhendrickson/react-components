import assert from 'node:assert/strict'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { Home, FileText } from 'lucide-react'
import { AppSidebar } from '../src/components/AppSidebar.tsx'
import { SidebarProvider } from '../src/components/ui/sidebar.tsx'

test('icon rail navigation links keep the supplied localized accessible names', () => {
  const items = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/posts', label: 'Publicaciones', icon: FileText },
  ]
  const html = renderToStaticMarkup(
    React.createElement(MemoryRouter, { initialEntries: ['/posts'] },
      React.createElement(SidebarProvider, { defaultOpen: false },
        React.createElement(AppSidebar, { siteName: 'Example', menuItems: items, collapsible: 'icon' }),
      ),
    ),
  )
  for (const item of items) {
    const link = [...html.matchAll(/<a\b[^>]*>/g)]
      .map(([opening]) => opening)
      .find((opening) => opening.includes(`href="${item.path}"`) && opening.includes('peer/menu-button'))
    assert(link, `${item.path}: rendered link`)
    assert(link.includes(`aria-label="${item.label}"`), `${item.path}: accessible name from localized label`)
    assert(html.includes(`>${item.label}</span>`), `${item.path}: visible label retained for expanded/mobile state`)
  }
})
