import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { WalletTransaction, WalletCategory } from '@trek/shared'
import { walletApi } from '../../api/wallet'
import { getApiErrorMessage } from '../../utils/apiError'

/**
 * Hook for WalletPage — owns balance/history/categories state, loading/
 * error/submitting flags, and the deposit/withdraw/delete handlers, per
 * PATTERN.md. The server (services/walletService.ts, Firestore-backed) is
 * the source of truth for validation; this hook just surfaces whatever it
 * returns or rejects with.
 */
export function useWallet() {
  const { id: tripId } = useParams<{ id: string }>()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [categories, setCategories] = useState<WalletCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Auto-clears whatever the last success message was after a few seconds,
  // so it reads as a toast-like confirmation rather than a permanent banner.
  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [successMessage])

  const load = useCallback(() => {
    if (!tripId) return
    setIsLoading(true)
    Promise.all([walletApi.get(tripId), walletApi.listCategories(tripId)])
      .then(([state, categoriesResult]) => {
        setBalance(state.balance)
        setTransactions(state.transactions)
        setCategories(categoriesResult.categories)
        setError(null)
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load the wallet.')))
      .finally(() => setIsLoading(false))
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const deposit = useCallback(
    async (amount: number, note?: string) => {
      if (!tripId) return
      setIsSubmitting(true)
      try {
        const result = await walletApi.deposit(tripId, { amount, note })
        setBalance(result.balance)
        setTransactions((prev) => [result.transaction, ...prev])
        setError(null)
        setSuccessMessage(`Deposit of $${amount.toFixed(2)} recorded.`)
      } catch (err) {
        setError(getApiErrorMessage(err, 'Deposit failed.'))
      } finally {
        setIsSubmitting(false)
      }
    },
    [tripId],
  )

  const withdraw = useCallback(
    async (amount: number, note?: string, category?: string) => {
      if (!tripId) return
      setIsSubmitting(true)
      try {
        const result = await walletApi.withdraw(tripId, { amount, note, category })
        setBalance(result.balance)
        setTransactions((prev) => [result.transaction, ...prev])
        setError(null)
        setSuccessMessage(`Withdrawal of $${amount.toFixed(2)} recorded.`)
      } catch (err) {
        setError(getApiErrorMessage(err, 'Withdraw failed.'))
      } finally {
        setIsSubmitting(false)
      }
    },
    [tripId],
  )

  /** Voids a transaction: removes it and reverses its effect on the balance (see firestore/transactionsRepo.ts). */
  const deleteTransaction = useCallback(
    async (transactionId: number) => {
      if (!tripId) return
      setIsSubmitting(true)
      try {
        const result = await walletApi.deleteTransaction(tripId, transactionId)
        setBalance(result.balance)
        setTransactions((prev) => prev.filter((t) => t.id !== transactionId))
        setError(null)
        setSuccessMessage('Transaction deleted.')
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not delete that transaction.'))
      } finally {
        setIsSubmitting(false)
      }
    },
    [tripId],
  )

  return {
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
  }
}
