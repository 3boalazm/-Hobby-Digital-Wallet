import React from 'react'
import { SimpleGrid } from '@chakra-ui/react'
import { MdReceiptLong, MdTrendingUp, MdTrendingDown } from 'react-icons/md'
import { StatWidget } from '../Dashboard'
import type { TransactionStatistics } from '../../pages/reports/useReports'

interface TransactionStatisticsWidgetProps {
  statistics: TransactionStatistics
}

/** Reuses components/Dashboard/StatWidget so Reports' stat cards match the Dashboard's, not a third visual style. */
export default function TransactionStatisticsWidget({ statistics }: TransactionStatisticsWidgetProps): React.ReactElement {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing="16px">
      <StatWidget label="Transactions" value={statistics.count} icon={MdReceiptLong} accentColor="brand.500" format="count" />
      <StatWidget label="Avg. Deposit" value={statistics.averageDeposit} icon={MdTrendingUp} accentColor="green.500" prefix="+" />
      <StatWidget label="Avg. Withdrawal" value={statistics.averageWithdraw} icon={MdTrendingDown} accentColor="red.500" prefix="-" />
      <StatWidget label="Largest Withdrawal" value={statistics.largestWithdraw} icon={MdTrendingDown} accentColor="orange.500" prefix="-" />
    </SimpleGrid>
  )
}
