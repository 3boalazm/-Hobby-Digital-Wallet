import React from 'react'
import { Box, Flex, Spinner, Text } from '@chakra-ui/react'
import HorizonDashboardLayout from '../components/HorizonDashboard/HorizonDashboardLayout'
import {
  ReportsSearchBar,
  ReportsFilters,
  TransactionStatisticsWidget,
  MonthlySummaryWidget,
  ReportsTransactionTable,
  ExportCsvButton,
} from '../components/Reports'
import { getDashboardNavItems } from '../services/dashboardNavService'
import { useReports } from './reports/useReports'

/**
 * Trip reports: search + filters over the wallet's transaction history,
 * transaction statistics, a monthly summary table, and CSV export — all
 * reading the same /api/trips/:tripId/wallet[/analytics] data the Wallet
 * page and Dashboard already use (services/walletService.ts). Reachable at
 * /trips/:id/reports, rendered inside the Horizon shell.
 */
export default function ReportsPage(): React.ReactElement {
  const {
    tripId,
    categories,
    monthly,
    isLoading,
    error,
    searchText,
    setSearchText,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    filteredTransactions,
    statistics,
    exportCsv,
  } = useReports()
  const navItems = getDashboardNavItems(tripId)

  return (
    <HorizonDashboardLayout navItems={navItems} activePath={`/trips/${tripId}/reports`} title="Reports">
      {error && (
        <Text color="red.500" mb="16px">
          {error}
        </Text>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
        <Box display="flex" flexDirection="column" gap="20px">
          <TransactionStatisticsWidget statistics={statistics} />
          <MonthlySummaryWidget data={monthly} />
          <Flex justify="space-between" align="center" flexWrap="wrap" gap="12px">
            <Flex gap="12px" flexWrap="wrap" flex="1">
              <ReportsSearchBar value={searchText} onChange={setSearchText} />
              <ReportsFilters
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                categories={categories}
                dateFrom={dateFrom}
                onDateFromChange={setDateFrom}
                dateTo={dateTo}
                onDateToChange={setDateTo}
              />
            </Flex>
            <ExportCsvButton onExport={exportCsv} disabled={filteredTransactions.length === 0} />
          </Flex>
          <ReportsTransactionTable transactions={filteredTransactions} />
        </Box>
      )}
    </HorizonDashboardLayout>
  )
}
