import { useLocation } from 'react-router-dom'
import { getDashboardNavItems } from '../../services/dashboardNavService'

/**
 * Hook for HorizonFoundationPage — owns nav config + current path per
 * PATTERN.md. No real trip/budget/auth data is fetched here yet; this
 * page exists to prove out the Horizon shell in isolation before any
 * existing page adopts it.
 */
export function useHorizonFoundation() {
  const location = useLocation()
  const navItems = getDashboardNavItems()

  return {
    navItems,
    activePath: location.pathname,
  }
}
