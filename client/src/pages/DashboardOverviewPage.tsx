import React from 'react'
import { Box, Grid, SimpleGrid, Spinner, Text } from '@chakra-ui/react'
import { MdAccountBalanceWallet, MdTrendingUp, MdTrendingDown } from 'react-icons/md'
import HorizonDashboardLayout from '../components/HorizonDashboard/HorizonDashboardLayout'
import {
  StatWidget,
  RecentTransactionsWidget,
  QuickActionsWidget,
  MonthlyBalanceChart,
  IncomeVsExpenseChart,
  ExpenseCategoriesChart,
  TransactionTrendChart,
} from '../components/Dashboard'
import { getDashboardNavItems } from '../services/dashboardNavService'
import { useDashboardOverview } from './dashboardOverview/useDashboardOverview'

/**
 * Trip dashboard: Current Balance / Income / Expense / Recent Transactions /
 * Quick Actions widgets, plus four Chart.js charts (Monthly Balance, Income
 * vs Expense, Expense Categories, Transaction Trend) — all reading real data
 * from the wallet built previously (services/walletService.ts +
 * /api/trips/:tripId/wallet[/analytics]). Reachable at /trips/:id/dashboard,
 * rendered inside the Horizon shell.
 */
export default function DashboardOverviewPage(): React.ReactElement {
  const {
    tripId,
    balance,
    totalIncome,
    totalExpense,
    recentTransactions,
    monthly,
    categories,
    trend,
    isLoading,
    error,
  } = useDashboardOverview()
  const navItems = getDashboardNavItems(tripId)

  return (
    <HorizonDashboardLayout navItems={navItems} activePath={`/trips/${tripId}/dashboard`} title="Dashboard">
      {error && (
        <Text color="red.500" mb="16px">
          {error}
        </Text>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
        <Box display="flex" flexDirection="column" gap="20px">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="20px">
            <StatWidget label="Current Balance" value={balance} icon={MdAccountBalanceWallet} accentColor="brand.500" />
            <StatWidget label="Income" value={totalIncome} icon={MdTrendingUp} accentColor="green.500" prefix="+" />
            <StatWidget label="Expense" value={totalExpense} icon={MdTrendingDown} accentColor="red.500" prefix="-" />
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="20px">
            <MonthlyBalanceChart data={monthly} />
            <IncomeVsExpenseChart data={monthly} />
            <ExpenseCategoriesChart data={categories} />
            <TransactionTrendChart data={trend} />
          </SimpleGrid>
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap="20px">
            <RecentTransactionsWidget transactions={recentTransactions} tripId={tripId} />
            <QuickActionsWidget tripId={tripId} />
          </Grid>
        </Box>
      )}
    </HorizonDashboardLayout>
  )
}
