import React from 'react'
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react'
import type { WalletMonthlyPoint } from '@trek/shared'

interface MonthlySummaryWidgetProps {
  data: WalletMonthlyPoint[]
}

/**
 * Tabular complement to the Dashboard's Monthly Balance / Income vs Expense
 * charts (components/Dashboard/MonthlyBalanceChart.tsx, IncomeVsExpenseChart.tsx)
 * — same `monthly` data (services/walletService.ts's getMonthlyAnalytics()),
 * shown as scannable/exportable rows instead of a chart. Always the full,
 * unfiltered window — see useReports.ts for why it doesn't follow the
 * search/filter controls.
 */
export default function MonthlySummaryWidget({ data }: MonthlySummaryWidgetProps): React.ReactElement {
  return (
    <Box borderRadius="20px" border="1px solid" borderColor="gray.100" p="20px">
      <Heading size="sm" mb="16px">
        Monthly Summary
      </Heading>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Month</Th>
            <Th isNumeric>Income</Th>
            <Th isNumeric>Expense</Th>
            <Th isNumeric>Net</Th>
            <Th isNumeric>Balance</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((point) => {
            const net = point.income - point.expense
            return (
              <Tr key={point.month}>
                <Td>{point.month}</Td>
                <Td isNumeric color="green.600">
                  +${point.income.toFixed(2)}
                </Td>
                <Td isNumeric color="red.600">
                  -${point.expense.toFixed(2)}
                </Td>
                <Td isNumeric color={net >= 0 ? 'green.600' : 'red.600'}>
                  {net >= 0 ? '+' : ''}
                  ${net.toFixed(2)}
                </Td>
                <Td isNumeric fontWeight="600">
                  ${point.balance.toFixed(2)}
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
      {data.length === 0 && (
        <Text color="gray.500" mt="8px">
          No activity yet.
        </Text>
      )}
    </Box>
  )
}
