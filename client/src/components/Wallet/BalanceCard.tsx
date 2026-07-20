import React from 'react'
import { Box, Stat, StatLabel, StatNumber } from '@chakra-ui/react'

interface BalanceCardProps {
  balance: number
}

export default function BalanceCard({ balance }: BalanceCardProps): React.ReactElement {
  return (
    <Box borderRadius="20px" bg="brand.500" color="white" p="24px">
      <Stat>
        <StatLabel opacity={0.8}>Wallet balance</StatLabel>
        <StatNumber fontSize="3xl">${balance.toFixed(2)}</StatNumber>
      </Stat>
    </Box>
  )
}
