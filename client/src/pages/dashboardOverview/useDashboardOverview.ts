import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { WalletTransaction, WalletMonthlyPoint, WalletCategoryTotal, WalletTrendPoint } from '@trek/shared'
import { walletApi } from '../../api/wallet'
import { getApiErrorMessage } from '../../utils/apiError'

const RECENT_TRANSACTIONS_LIMIT = 5

/**
 * Hook for DashboardOverviewPage — reads /api/trips/:tripId/wallet (state)
 * and /api/trips/:tripId/wallet/analytics (chart data) in parallel;
 * services/walletService.ts is the single source of truth for all of it,
 * this hook just slices/shapes it for the widgets and charts.
 */
export function useDashboardOverview() {
  const { id: tripId } = useParams<{ id: string }>()
  const [balance, setBalance] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState<WalletTransaction[]>([])
  const [monthly, setMonthly] = useState<WalletMonthlyPoint[]>([])
  const [categories, setCategories] = useState<WalletCategoryTotal[]>([])
  const [trend, setTrend] = useState<WalletTrendPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!tripId) return
    setIsLoading(true)
    Promise.all([walletApi.get(tripId), walletApi.getAnalytics(tripId)])
      .then(([state, analytics]) => {
        setBalance(state.balance)
        setTotalIncome(state.totalIncome)
        setTotalExpense(state.totalExpense)
        setRecentTransactions(state.transactions.slice(0, RECENT_TRANSACTIONS_LIMIT))
        setMonthly(analytics.monthly)
        setCategories(analytics.categories)
        setTrend(analytics.trend)
        setError(null)
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load the dashboard.')))
      .finally(() => setIsLoading(false))
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  return {
    tripId,
    balance,
    totalIncome,
    totalExpense,
    recentTransactions,
    monthly,
    categories,
    trend,
    isLoading,
    error,
  }
}
