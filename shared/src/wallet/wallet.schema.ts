import { z } from 'zod';

/**
 * Wallet API contract — /api/trips/:tripId/wallet (shared trip fund).
 *
 * Trip-scoped like budget/packing/todo: every endpoint verifies trip access
 * (404 "Trip not found"); deposit/withdraw check the 'wallet_edit' permission
 * (403 "No permission"), same shape as 'budget_edit'.
 *
 * The deposit/withdraw rules port the validation from the reference
 * digitalWalletApp console app (DigitalWallet.cs): amount must be > 0, and a
 * withdrawal must not exceed the current balance. That project gated every
 * operation behind its own toy login() / _IsloggedIn flag; here that's
 * replaced by TREK's real JwtAuthGuard + trip-access check, so there's no
 * separate wallet-level login. Its inverted "Initial Deposit" constructor
 * bug (`if (initalBalance < 0)`) is not carried over — trip wallets simply
 * start at 0 and grow through real, recorded deposits.
 *
 * Mutations broadcast over WebSocket ('wallet:updated') with the forwarded
 * X-Socket-Id, like todo/packing.
 *
 * totalIncome/totalExpense (added for the Horizon dashboard's widgets) are
 * SQL-aggregated sums over this same transaction log — SUM(amount) grouped
 * by type — not a separate ledger. "Income" = deposits, "Expense" = withdrawals.
 *
 * `category` (added for the Expense Categories chart) is set on withdrawals
 * only — deposits aren't categorized. /wallet/analytics (below) is a
 * separate, read-only endpoint for the four Chart.js charts; it doesn't
 * replace the flat balance/transactions shape the Wallet page and dashboard
 * widgets already use.
 *
 * Categories were originally a fixed compile-time enum (six hardcoded
 * names). They're now their own Firestore collection (firestore/categoriesRepo.ts)
 * with real CRUD, seeded once per trip with those same six names so existing
 * behavior doesn't change on upgrade. A transaction's `category` above stays
 * a plain name string (not a category id) — a snapshot of the category at
 * the time of the transaction, so renaming/deleting a category later doesn't
 * silently rewrite historical records.
 */

export const walletTransactionTypeSchema = z.enum(['deposit', 'withdraw']);
export type WalletTransactionType = z.infer<typeof walletTransactionTypeSchema>;

export const walletCategorySchema = z.object({
  id: z.string(),
  trip_id: z.number(),
  name: z.string(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  created_at: z.string(),
});
export type WalletCategory = z.infer<typeof walletCategorySchema>;

export const walletCategoryCreateRequestSchema = z.object({
  name: z.string().min(1).max(60),
  icon: z.string().max(60).optional(),
  color: z.string().max(30).optional(),
});
export type WalletCategoryCreateRequest = z.infer<typeof walletCategoryCreateRequestSchema>;

export const walletCategoryUpdateRequestSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  icon: z.string().max(60).optional(),
  color: z.string().max(30).optional(),
});
export type WalletCategoryUpdateRequest = z.infer<typeof walletCategoryUpdateRequestSchema>;

export const walletTransactionSchema = z.object({
  id: z.number(),
  trip_id: z.number(),
  type: walletTransactionTypeSchema,
  amount: z.number().positive(),
  category: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  created_by: z.number().nullable(),
  created_at: z.string(),
});
export type WalletTransaction = z.infer<typeof walletTransactionSchema>;

export const walletStateSchema = z.object({
  balance: z.number(),
  totalIncome: z.number(),
  totalExpense: z.number(),
  transactions: z.array(walletTransactionSchema),
});
export type WalletState = z.infer<typeof walletStateSchema>;

export const walletDepositRequestSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  note: z.string().max(280).optional(),
});
export type WalletDepositRequest = z.infer<typeof walletDepositRequestSchema>;

export const walletWithdrawRequestSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.string().max(60).optional(),
  note: z.string().max(280).optional(),
});
export type WalletWithdrawRequest = z.infer<typeof walletWithdrawRequestSchema>;

export const walletTransactionUpdateRequestSchema = z.object({
  note: z.string().max(280).optional(),
  category: z.string().max(60).nullable().optional(),
});
export type WalletTransactionUpdateRequest = z.infer<typeof walletTransactionUpdateRequestSchema>;

export const walletMutationResultSchema = z.object({
  balance: z.number(),
  transaction: walletTransactionSchema,
});
export type WalletMutationResult = z.infer<typeof walletMutationResultSchema>;

// ── Analytics (Chart.js charts) ─────────────────────────────────────────────

export const walletMonthlyPointSchema = z.object({
  month: z.string(), // 'YYYY-MM'
  income: z.number(),
  expense: z.number(),
  balance: z.number(), // running balance as of month-end
});
export type WalletMonthlyPoint = z.infer<typeof walletMonthlyPointSchema>;

export const walletCategoryTotalSchema = z.object({
  category: z.string(),
  total: z.number(),
});
export type WalletCategoryTotal = z.infer<typeof walletCategoryTotalSchema>;

export const walletTrendPointSchema = z.object({
  date: z.string(),
  balance: z.number(), // running balance immediately after this transaction
});
export type WalletTrendPoint = z.infer<typeof walletTrendPointSchema>;

export const walletAnalyticsSchema = z.object({
  monthly: z.array(walletMonthlyPointSchema), // Monthly Balance + Income vs Expense charts
  categories: z.array(walletCategoryTotalSchema), // Expense Categories chart
  trend: z.array(walletTrendPointSchema), // Transaction Trend chart
});
export type WalletAnalytics = z.infer<typeof walletAnalyticsSchema>;
