import {
  MdDashboard,
  MdMap,
  MdAccountBalanceWallet,
  MdPieChart,
  MdChecklist,
  MdSettings,
  MdBarChart,
} from 'react-icons/md'
import type { NavItem } from '../models/dashboardLayout'

/**
 * Nav config for the Horizon dashboard shell.
 * 'Overview', 'Wallet', 'Reports' and 'Budget' are real, trip-scoped pages
 * (see pages/DashboardOverviewPage.tsx, WalletPage.tsx, ReportsPage.tsx,
 * BudgetPage.tsx) — each needs an actual trip id to link to, and falls back
 * to its original placeholder destination when one isn't available.
 * Trips/Packing/Settings are still unwired placeholders.
 */
export function getDashboardNavItems(tripId?: string | number): NavItem[] {
  return [
    { id: 'overview', label: 'Overview', path: tripId ? `/trips/${tripId}/dashboard` : '/horizon-foundation', icon: MdDashboard },
    { id: 'wallet', label: 'Wallet', path: tripId ? `/trips/${tripId}/wallet` : '/dashboard', icon: MdAccountBalanceWallet },
    { id: 'reports', label: 'Reports', path: tripId ? `/trips/${tripId}/reports` : '/dashboard', icon: MdBarChart },
    { id: 'trips', label: 'Trips', path: '/dashboard', icon: MdMap },
    { id: 'budget', label: 'Budget', path: tripId ? `/trips/${tripId}/budget` : '/dashboard', icon: MdPieChart },
    { id: 'packing', label: 'Packing', path: '/dashboard', icon: MdChecklist },
    { id: 'settings', label: 'Settings', path: '/settings', icon: MdSettings },
  ]
}
