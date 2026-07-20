import React from 'react'
import { Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Text } from '@chakra-ui/react'
import type { WalletTransaction } from '@trek/shared'

interface ReportsTransactionTableProps {
  transactions: WalletTransaction[]
}

/** Denser, scannable table view of the filtered transactions — the Wallet
 *  page's TransactionHistoryList stays a card list for that context; this is
 *  the tabular, export-adjacent view Reports calls for. */
export default function ReportsTransactionTable({ transactions }: ReportsTransactionTableProps): React.ReactElement {
  if (transactions.length === 0) {
    return (
      <Text color="gray.500" p="20px">
        No transactions match these filters.
      </Text>
    )
  }

  return (
    <Box borderRadius="20px" border="1px solid" borderColor="gray.100" overflowX="auto">
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Type</Th>
            <Th>Category</Th>
            <Th>Note</Th>
            <Th isNumeric>Amount</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions.map((t) => (
            <Tr key={t.id}>
              <Td whiteSpace="nowrap">{new Date(t.created_at).toLocaleDateString()}</Td>
              <Td>
                <Badge colorScheme={t.type === 'deposit' ? 'green' : 'red'}>{t.type}</Badge>
              </Td>
              <Td>{t.category ?? '—'}</Td>
              <Td maxW="280px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {t.note ?? ''}
              </Td>
              <Td isNumeric color={t.type === 'deposit' ? 'green.600' : 'red.600'} fontWeight="600">
                {t.type === 'deposit' ? '+' : '-'}${t.amount.toFixed(2)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}
