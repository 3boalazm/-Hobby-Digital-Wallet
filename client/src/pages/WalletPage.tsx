import React from 'react'
import { Alert, AlertIcon, Box, Spinner } from '@chakra-ui/react'
import HorizonDashboardLayout from '../components/HorizonDashboard/HorizonDashboardLayout'
import { BalanceCard, WalletActionForm, TransactionHistoryList } from '../components/Wallet'
import { getDashboardNavItems } from '../services/dashboardNavService'
import { useWallet } from './wallet/useWallet'

/**
 * Trip wallet: balance, deposit, withdraw, transaction history.
 * Reachable at /trips/:id/wallet, same pattern as /trips/:id/files.
 * Page = wiring container: all state/effects/API calls live in useWallet().
 */
export default function WalletPage(): React.ReactElement {
  const {
    tripId,
    balance,
    transactions,
    categories,
    isLoading,
    isSubmitting,
    error,
    successMessage,
    deposit,
    withdraw,
    deleteTransaction,
  } = useWallet()
  const navItems = getDashboardNavItems(tripId)

  return (
    <HorizonDashboardLayout navItems={navItems} activePath={`/trips/${tripId}/wallet`} title="Wallet">
      <Box display="flex" flexDirection="column" gap={{ base: '16px', md: '24px' }} maxW="640px">
        {error && (
          <Alert status="error" borderRadius="12px">
            <AlertIcon />
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert status="success" borderRadius="12px">
            <AlertIcon />
            {successMessage}
          </Alert>
        )}
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <BalanceCard balance={balance} />
            <WalletActionForm balance={balance} isSubmitting={isSubmitting} categories={categories} onDeposit={deposit} onWithdraw={withdraw} />
            <TransactionHistoryList transactions={transactions} onDelete={deleteTransaction} />
          </>
        )}
      </Box>
    </HorizonDashboardLayout>
  )
}
