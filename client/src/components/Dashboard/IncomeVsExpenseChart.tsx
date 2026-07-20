import React from 'react'
import { Box, Heading } from '@chakra-ui/react'
import { Bar } from 'react-chartjs-2'
import type { WalletMonthlyPoint } from '@trek/shared'
import { chartColors } from '../../theme/chartConfig'

interface IncomeVsExpenseChartProps {
  data: WalletMonthlyPoint[]
}

export default function IncomeVsExpenseChart({ data }: IncomeVsExpenseChartProps): React.ReactElement {
  return (
    <Box borderRadius="20px" border="1px solid" borderColor="gray.100" p="20px">
      <Heading size="sm" mb="16px">
        Income vs Expense
      </Heading>
      <Bar
        data={{
          labels: data.map((d) => d.month),
          datasets: [
            { label: 'Income', data: data.map((d) => d.income), backgroundColor: chartColors.income, borderRadius: 6 },
            { label: 'Expense', data: data.map((d) => d.expense), backgroundColor: chartColors.expense, borderRadius: 6 },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
          scales: { y: { beginAtZero: true } },
        }}
      />
    </Box>
  )
}
