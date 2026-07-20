import React from 'react'
import { Box, Flex, Text, Badge, IconButton } from '@chakra-ui/react'
import { MdDeleteOutline } from 'react-icons/md'
import type { WalletTransaction } from '@trek/shared'

interface TransactionHistoryListProps {
  transactions: WalletTransaction[]
  /** Optional — when omitted, no delete affordance renders (e.g. the
   *  Dashboard's read-only Recent Transactions preview doesn't pass this). */
  onDelete?: (transactionId: number) => void
}

export default function TransactionHistoryList({ transactions, onDelete }: TransactionHistoryListProps): React.ReactElement {
  if (transactions.length === 0) {
    return <Text color="gray.500">No transactions yet.</Text>
  }

  return (
    <Box borderRadius="16px" border="1px solid" borderColor="gray.100" overflow="hidden">
      {transactions.map((tx) => (
        <Flex
          key={tx.id}
          justify="space-between"
          align="center"
          px="20px"
          py="14px"
          borderBottom="1px solid"
          borderColor="gray.50"
          gap="12px"
        >
          <Box>
            <Flex align="center" gap="6px" mb="4px">
              <Badge colorScheme={tx.type === 'deposit' ? 'green' : 'red'}>{tx.type}</Badge>
              {tx.category && (
                <Badge colorScheme="gray" variant="subtle">
                  {tx.category}
                </Badge>
              )}
            </Flex>
            {tx.note && (
              <Text fontSize="sm" color="gray.500">
                {tx.note}
              </Text>
            )}
          </Box>
          <Flex align="center" gap="8px">
            <Box textAlign="right">
              <Text fontWeight="600" color={tx.type === 'deposit' ? 'green.600' : 'red.600'}>
                {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
              </Text>
              <Text fontSize="xs" color="gray.400">
                {new Date(tx.created_at).toLocaleString()}
              </Text>
            </Box>
            {onDelete && (
              <IconButton
                aria-label="Delete transaction"
                icon={<MdDeleteOutline />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => onDelete(tx.id)}
              />
            )}
          </Flex>
        </Flex>
      ))}
    </Box>
  )
}
