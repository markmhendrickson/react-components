import assert from 'node:assert/strict'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { Home, FileText } from 'lucide-react'
import { AppSidebar } from '../src/components/AppSidebar.tsx'
import { Layout } from '../src/components/Layout.tsx'
import { SidebarProvider, SidebarTrigger } from '../src/components/ui/sidebar.tsx'

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

test('localized sidebar names reach the rendered controls while defaults remain available', () => {
  const localized = renderToStaticMarkup(
    React.createElement(MemoryRouter, null,
      React.createElement(Layout, {
        siteName: 'Example',
        languageMenuItems: [{ path: '/es/', label: 'Español' }],
        languageMenuAriaLabel: 'Alternar menú de idiomas',
        themeMenuAriaLabel: 'Abrir menú de tema',
        sidebarOpenLabel: 'Abrir menú',
        sidebarCloseLabel: 'Cerrar barra lateral',
        sidebarToggleLabel: 'Alternar barra lateral',
      }, React.createElement('main', null, 'Page')),
    ),
  )
  assert(localized.includes('aria-label="Alternar menú de idiomas"'), 'language trigger uses supplied name')
  assert(localized.includes('aria-label="Abrir menú de tema"'), 'theme trigger keeps supplied name')
  assert(localized.includes('aria-label="Abrir menú"'), 'mobile opener uses supplied name')

  const trigger = renderToStaticMarkup(
    React.createElement(SidebarProvider, null,
      React.createElement(SidebarTrigger, { 'aria-label': 'Alternar barra lateral' }),
    ),
  )
  assert(trigger.includes('aria-label="Alternar barra lateral"'))
  assert(trigger.includes('class="sr-only">Alternar barra lateral</span>'), 'hidden text follows the accessible name')

  const defaultTrigger = renderToStaticMarkup(
    React.createElement(SidebarProvider, null, React.createElement(SidebarTrigger)),
  )
  assert(defaultTrigger.includes('class="sr-only">Toggle sidebar</span>'), 'standalone default remains available')
})
