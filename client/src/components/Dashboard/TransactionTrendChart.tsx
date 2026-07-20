import React from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'
import { Line } from 'react-chartjs-2'
import type { WalletTrendPoint } from '@trek/shared'
import { chartColors } from '../../theme/chartConfig'

interface TransactionTrendChartProps {
  data: WalletTrendPoint[]
}

export default function TransactionTrendChart({ data }: TransactionTrendChartProps): React.ReactElement {
  if (data.length === 0) {
    return (
      <Box borderRadius="20px" border="1px solid" borderColor="gray.100" p="20px">
        <Heading size="sm" mb="16px">
          Transaction Trend
        </Heading>
        <Text color="gray.500">No transactions yet.</Text>
      </Box>
    )
  }

  return (
    <Box borderRadius="20px" border="1px solid" borderColor="gray.100" p="20px">
      <Heading size="sm" mb="16px">
        Transaction Trend
      </Heading>
      <Line
        data={{
          labels: data.map((d) => new Date(d.date).toLocaleDateString()),
          datasets: [
            {
              label: 'Balance',
              data: data.map((d) => d.balance),
              borderColor: chartColors.balance,
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 3,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { ticks: { maxTicksLimit: 6 } } },
        }}
      />
    </Box>
  )
}
