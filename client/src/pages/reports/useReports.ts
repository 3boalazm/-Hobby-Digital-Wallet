import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { WalletTransaction, WalletCategory, WalletMonthlyPoint } from '@trek/shared'
import { walletApi } from '../../api/wallet'
import { getApiErrorMessage } from '../../utils/apiError'
import { toCsv } from '../../utils/csv'
import { downloadTextAsFile } from '../../utils/fileDownload'

export type ReportsTypeFilter = 'all' | 'deposit' | 'withdraw'

export interface TransactionStatistics {
  count: number
  depositCount: number
  withdrawCount: number
  averageDeposit: number
  averageWithdraw: number
  largestDeposit: number
  largestWithdraw: number
}

const EMPTY_STATISTICS: TransactionStatistics = {
  count: 0,
  depositCount: 0,
  withdrawCount: 0,
  averageDeposit: 0,
  averageWithdraw: 0,
  largestDeposit: 0,
  largestWithdraw: 0,
}

function computeStatistics(transactions: WalletTransaction[]): TransactionStatistics {
  if (transactions.length === 0) return EMPTY_STATISTICS

  const deposits = transactions.filter((t) => t.type === 'deposit')
  const withdrawals = transactions.filter((t) => t.type === 'withdraw')
  const sum = (rows: WalletTransaction[]) => rows.reduce((total, t) => total + t.amount, 0)
  const max = (rows: WalletTransaction[]) => rows.reduce((m, t) => Math.max(m, t.amount), 0)

  return {
    count: transactions.length,
    depositCount: deposits.length,
    withdrawCount: withdrawals.length,
    averageDeposit: deposits.length ? sum(deposits) / deposits.length : 0,
    averageWithdraw: withdrawals.length ? sum(withdrawals) / withdrawals.length : 0,
    largestDeposit: max(deposits),
    largestWithdraw: max(withdrawals),
  }
}

/**
 * Hook for ReportsPage — reads the same /api/trips/:tripId/wallet and
 * /wallet/analytics endpoints the Wallet page and Dashboard already use
 * (services/walletService.ts is still the single source of truth); this
 * hook adds client-side search/filter/statistics/export on top, since the
 * data volume here (a trip's own transactions) doesn't need server-side
 * query support.
 *
 * Monthly Summary intentionally reads the full, unfiltered `monthly` series
 * — mixing a category/type filter into a per-month rollup gets confusing
 * fast, so it stays a stable, always-complete view. Search/filters instead
 * drive the transaction table, the statistics, and the CSV export.
 */
export function useReports() {
  const { id: tripId } = useParams<{ id: string }>()
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [categories, setCategories] = useState<WalletCategory[]>([])
  const [monthly, setMonthly] = useState<WalletMonthlyPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState<ReportsTypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (!tripId) return
    setIsLoading(true)
    Promise.all([walletApi.get(tripId), walletApi.listCategories(tripId), walletApi.getAnalytics(tripId)])
      .then(([state, categoriesResult, analytics]) => {
        setTransactions(state.transactions)
        setCategories(categoriesResult.categories)
        setMonthly(analytics.monthly)
        setError(null)
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load reports.')))
      .finally(() => setIsLoading(false))
  }, [tripId])

  const filteredTransactions = useMemo(() => {
    const search = searchText.trim().toLowerCase()
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (categoryFilter !== 'all' && (t.category ?? '') !== categoryFilter) return false
      if (dateFrom && t.created_at < dateFrom) return false
      if (dateTo && t.created_at > `${dateTo}T23:59:59.999Z`) return false
      if (search) {
        const haystack = `${t.note ?? ''} ${t.category ?? ''} ${t.type}`.toLowerCase()
        if (!haystack.includes(search)) return false
      }
      return true
    })
  }, [transactions, searchText, typeFilter, categoryFilter, dateFrom, dateTo])

  const statistics = useMemo(() => computeStatistics(filteredTransactions), [filteredTransactions])

  const exportCsv = useCallback(() => {
    const csv = toCsv(filteredTransactions, [
      { key: 'created_at', label: 'Date' },
      { key: 'type', label: 'Type' },
      { key: (t) => t.category ?? '', label: 'Category' },
      { key: (t) => t.note ?? '', label: 'Note' },
      { key: 'amount', label: 'Amount' },
    ])
    const stamp = new Date().toISOString().slice(0, 10)
    downloadTextAsFile(`trek-wallet-report-trip-${tripId}-${stamp}.csv`, csv)
  }, [filteredTransactions, tripId])

  return {
    tripId,
    categories,
    monthly,
    isLoading,
    error,
    searchText,
    setSearchText,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    filteredTransactions,
    statistics,
    exportCsv,
  }
}
