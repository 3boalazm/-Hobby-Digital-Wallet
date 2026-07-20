import React from 'react'
import { Box, Flex, Heading, Link as ChakraLink } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import type { WalletTransaction } from '@trek/shared'
import { TransactionHistoryList } from '../Wallet'

interface RecentTransactionsWidgetProps {
  transactions: WalletTransaction[]
  tripId?: string
}

/** Reuses the same TransactionHistoryList the Wallet page renders — the
 *  dashboard just passes it a shorter (already-sliced) list. */
export default function RecentTransactionsWidget({ transactions, tripId }: RecentTransactionsWidgetProps): React.ReactElement {
  return (
    <Box borderRadius="20px" border="1px solid" borderColor="gray.100" p="20px">
      <Flex justify="space-between" align="center" mb="16px">
        <Heading size="sm">Recent Transactions</Heading>
        {tripId && (
          <ChakraLink as={Link} to={`/trips/${tripId}/wallet`} fontSize="sm" color="brand.600">
            View all
          </ChakraLink>
        )}
      </Flex>
      <TransactionHistoryList transactions={transactions} />
    </Box>
  )
}
