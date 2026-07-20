import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'

/**
 * Shared UI-layer types for the Horizon dashboard foundation.
 * These are presentation types only — no domain/business data lives here.
 * Domain types keep coming from `@trek/shared`; this file is scoped
 * strictly to the new dashboard shell and is not a replacement for it.
 */

/**
 * A single entry in the Horizon-style sidebar. Shape intentionally mirrors
 * `PageSidebarTab` (id/label/icon/group) from
 * components/Layout/PageSidebar.tsx, so an existing page could adopt this
 * nav model later with minimal changes.
 */
export interface NavItem {
  id: string
  label: string
  path: string
  icon: IconType
  group?: string
}

export type ThemeMode = 'light' | 'dark'

export interface DashboardLayoutProps {
  navItems: NavItem[]
  activePath: string
  children: ReactNode
  title?: string
}
