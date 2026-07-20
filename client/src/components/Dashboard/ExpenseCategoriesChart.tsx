import React from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'
import { Doughnut } from 'react-chartjs-2'
import type { WalletCategoryTotal } from '@trek/shared'
import { chartColors } from '../../theme/chartConfig'

interface ExpenseCategoriesChartProps {
  data: WalletCategoryTotal[]
}

export default function ExpenseCategoriesChart({ data }: ExpenseCategoriesChartProps): React.ReactElement {
  if (data.length === 0) {
    return (
      <Box borderRadius="20px" border="1px solid" borderColor="gray.100" p="20px">
        <Heading size="sm" mb="16px">
          Expense Categories
        </Heading>
        <Text color="gray.500">No expenses recorded yet.</Text>
      </Box>
    )
  }

  return (
    <Box borderRadius="20px" border="1px solid" borderColor="gray.100" p="20px">
      <Heading size="sm" mb="16px">
        Expense Categories
      </Heading>
      <Doughnut
        data={{
          labels: data.map((d) => d.category),
          datasets: [
            {
              data: data.map((d) => d.total),
              backgroundColor: chartColors.categories,
              borderWidth: 0,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { position: 'right' } },
        }}
      />
    </Box>
  )
}
