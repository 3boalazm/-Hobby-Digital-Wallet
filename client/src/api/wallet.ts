import apiClient from './client'
import type { AxiosResponse } from 'axios'
import type {
  WalletState,
  WalletAnalytics,
  WalletDepositRequest,
  WalletWithdrawRequest,
  WalletTransactionUpdateRequest,
  WalletMutationResult,
  WalletTransaction,
  WalletCategory,
  WalletCategoryCreateRequest,
  WalletCategoryUpdateRequest,
} from '@trek/shared'

const ax = apiClient

/**
 * Axios calls for the trip wallet (/api/trips/:tripId/wallet). Same shape as
 * api/collections.ts — unwrapped response body, `satisfies` on request
 * payloads so the shared Zod request types stay the single source of truth.
 * Backed by Firestore on the server (services/walletService.ts +
 * firestore/*Repo.ts); this file doesn't change either way — same REST
 * contract as when it ran on SQLite.
 */
export const walletApi = {
  get: (tripId: string | number): Promise<WalletState> =>
    ax.get(`/trips/${tripId}/wallet`).then((r: AxiosResponse) => r.data),
  getAnalytics: (tripId: string | number): Promise<WalletAnalytics> =>
    ax.get(`/trips/${tripId}/wallet/analytics`).then((r: AxiosResponse) => r.data),
  deposit: (tripId: string | number, body: WalletDepositRequest): Promise<WalletMutationResult> =>
    ax.post(`/trips/${tripId}/wallet/deposit`, body satisfies WalletDepositRequest).then((r: AxiosResponse) => r.data),
  withdraw: (tripId: string | number, body: WalletWithdrawRequest): Promise<WalletMutationResult> =>
    ax.post(`/trips/${tripId}/wallet/withdraw`, body satisfies WalletWithdrawRequest).then((r: AxiosResponse) => r.data),
  updateTransaction: (
    tripId: string | number,
    transactionId: number | string,
    body: WalletTransactionUpdateRequest,
  ): Promise<{ transaction: WalletTransaction }> =>
    ax
      .patch(`/trips/${tripId}/wallet/transactions/${transactionId}`, body satisfies WalletTransactionUpdateRequest)
      .then((r: AxiosResponse) => r.data),
  deleteTransaction: (tripId: string | number, transactionId: number | string): Promise<{ balance: number }> =>
    ax.delete(`/trips/${tripId}/wallet/transactions/${transactionId}`).then((r: AxiosResponse) => r.data),

  listCategories: (tripId: string | number): Promise<{ categories: WalletCategory[] }> =>
    ax.get(`/trips/${tripId}/wallet/categories`).then((r: AxiosResponse) => r.data),
  createCategory: (tripId: string | number, body: WalletCategoryCreateRequest): Promise<{ category: WalletCategory }> =>
    ax
      .post(`/trips/${tripId}/wallet/categories`, body satisfies WalletCategoryCreateRequest)
      .then((r: AxiosResponse) => r.data),
  updateCategory: (
    tripId: string | number,
    categoryId: string,
    body: WalletCategoryUpdateRequest,
  ): Promise<{ category: WalletCategory }> =>
    ax
      .patch(`/trips/${tripId}/wallet/categories/${categoryId}`, body satisfies WalletCategoryUpdateRequest)
      .then((r: AxiosResponse) => r.data),
  deleteCategory: (tripId: string | number, categoryId: string): Promise<{ success: boolean }> =>
    ax.delete(`/trips/${tripId}/wallet/categories/${categoryId}`).then((r: AxiosResponse) => r.data),
}
