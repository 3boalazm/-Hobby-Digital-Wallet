import React from 'react'
import { Box, Heading } from '@chakra-ui/react'
import { Line } from 'react-chartjs-2'
import type { WalletMonthlyPoint } from '@trek/shared'
import { chartColors } from '../../theme/chartConfig'

interface MonthlyBalanceChartProps {
  data: WalletMonthlyPoint[]
}

export default function MonthlyBalanceChart({ data }: MonthlyBalanceChartProps): React.ReactElement {
  return (
    <Box borderRadius="20px" border="1px solid" borderColor="gray.100" p="20px">
      <Heading size="sm" mb="16px">
        Monthly Balance
      </Heading>
      <Line
        data={{
          labels: data.map((d) => d.month),
          datasets: [
            {
              label: 'Balance',
              data: data.map((d) => d.balance),
              borderColor: chartColors.balance,
              backgroundColor: `${chartColors.balance}22`,
              fill: true,
              tension: 0.4,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        }}
      />
    </Box>
  )
}
