import React from 'react'
import { Box, Spinner, Text } from '@chakra-ui/react'
import HorizonDashboardLayout from '../components/HorizonDashboard/HorizonDashboardLayout'
import BudgetPanel from '../components/Budget/BudgetPanel'
import { getDashboardNavItems } from '../services/dashboardNavService'
import { useBudgetPage } from './budget/useBudgetPage'

/**
 * Trip budget. Reuses components/Budget/BudgetPanel.tsx wholesale — the same
 * component TREK already has fully built and tested (categories, per-person/
 * per-day splits, settlement/debt calculation, pie chart, CSV export) — this
 * page only supplies what it needs (tripId, tripMembers) and places it inside
 * the Horizon shell. Reachable at /trips/:id/budget.
 *
 * Note: BudgetPanel is styled via TREK's own CSS-variable theme (not Chakra),
 * so its content looks like the rest of the native app rather than matching
 * the Horizon/Chakra chrome around it — that's the existing component as-is,
 * not a new visual language invented for this page.
 */
export default function BudgetPage(): React.ReactElement {
  const { tripId, tripMembers, isLoading, error } = useBudgetPage()
  const navItems = getDashboardNavItems(tripId)

  return (
    <HorizonDashboardLayout navItems={navItems} activePath={`/trips/${tripId}/budget`} title="Budget">
      {error && (
        <Text color="red.500" mb="16px">
          {error}
        </Text>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
        <Box>
          <BudgetPanel tripId={Number(tripId)} tripMembers={tripMembers} />
        </Box>
      )}
    </HorizonDashboardLayout>
  )
}
