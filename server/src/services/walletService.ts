import type { WalletTransactionType } from '@trek/shared';
import * as wallets from '../firestore/walletsRepo';
import * as transactions from '../firestore/transactionsRepo';
import * as categories from '../firestore/categoriesRepo';
import * as users from '../firestore/usersRepo';
import { WalletValidationError } from '../firestore/errors';

export { verifyTripAccess } from './tripAccess';
export { WalletValidationError, WalletConfigError } from '../firestore/errors';

/**
 * Wallet service — one shared fund per trip, now backed by Firestore
 * (firestore/walletsRepo.ts, transactionsRepo.ts, categoriesRepo.ts,
 * usersRepo.ts) instead of the bundled SQLite database. Everything else in
 * TREK (auth, trips, permissions, budget, etc.) is unaffected — this is the
 * only domain that talks to Firestore, and it's the only thing this file
 * composes.
 *
 * The deposit/withdraw rules still port the validation from the reference
 * digitalWalletApp console app (DigitalWallet.cs): amount must be > 0, and a
 * withdrawal must not exceed the current balance — now enforced inside a
 * Firestore transaction (transactionsRepo.createTransaction) instead of a
 * better-sqlite3 db.transaction(), for the same atomicity guarantee. The
 * login gate is still TREK's real JwtAuthGuard + verifyTripAccess (checked
 * in the controller), not a wallet-specific one.
 *
 * The old wallet_accounts/wallet_transactions SQLite tables (db/schema.ts)
 * are left in place but unused — harmless (CREATE TABLE IF NOT EXISTS), and
 * dropping them isn't required for this to work.
 */

export async function getBalance(tripId: string | number): Promise<number> {
  return wallets.getBalance(Number(tripId));
}

export async function listTransactions(tripId: string | number) {
  return transactions.listTransactions(Number(tripId));
}

/**
 * Income/Expense for the dashboard's stat widgets — summed over the same
 * transaction log, not a separate ledger. "Income" = deposits, "Expense" =
 * withdrawals.
 */
export async function getTotals(tripId: string | number): Promise<{ totalIncome: number; totalExpense: number }> {
  return transactions.getTotals(Number(tripId));
}

export async function getWalletState(tripId: string | number) {
  const id = Number(tripId);
  const [balance, totals, txns] = await Promise.all([
    wallets.getBalance(id),
    transactions.getTotals(id),
    transactions.listTransactions(id),
  ]);
  return {
    balance,
    totalIncome: totals.totalIncome,
    totalExpense: totals.totalExpense,
    transactions: txns,
  };
}

/** Deposit into the trip wallet. Mirrors Deposit()'s `amount <= 0` guard. */
export async function deposit(
  tripId: string | number,
  amount: number,
  userId: number,
  note?: string,
  username?: string,
) {
  if (!(amount > 0)) {
    throw new WalletValidationError('Amount must be greater than 0');
  }
  if (username) await users.upsertUserRef({ id: userId, username });
  return transactions.createTransaction(Number(tripId), 'deposit', amount, userId, note);
}

/** Withdraw from the trip wallet. Mirrors Withdraw()'s `amount <= 0 || amount > _Balance` guard. */
export async function withdraw(
  tripId: string | number,
  amount: number,
  userId: number,
  note?: string,
  category?: string,
  username?: string,
) {
  if (!(amount > 0)) {
    throw new WalletValidationError('Amount must be greater than 0');
  }
  if (username) await users.upsertUserRef({ id: userId, username });
  return transactions.createTransaction(Number(tripId), 'withdraw', amount, userId, note, category);
}

/** Edit a transaction's note/category — never touches amount/type/balance. */
export async function updateTransaction(
  tripId: string | number,
  transactionId: string,
  data: { note?: string; category?: string | null },
) {
  return transactions.updateTransaction(Number(tripId), transactionId, data);
}

/** Void (delete) a transaction — reverses its effect on the balance atomically. */
export async function deleteTransaction(tripId: string | number, transactionId: string) {
  return transactions.voidTransaction(Number(tripId), transactionId);
}

// ── Categories (CRUD) ────────────────────────────────────────────────────────

export async function listCategories(tripId: string | number) {
  return categories.listCategories(Number(tripId));
}

export async function createCategory(tripId: string | number, data: { name: string; icon?: string; color?: string }) {
  return categories.createCategory(Number(tripId), data);
}

export async function updateCategory(
  tripId: string | number,
  categoryId: string,
  data: { name?: string; icon?: string; color?: string },
) {
  return categories.updateCategory(Number(tripId), categoryId, data);
}

export async function deleteCategory(tripId: string | number, categoryId: string) {
  return categories.deleteCategory(Number(tripId), categoryId);
}

// ── Analytics (Chart.js charts) ─────────────────────────────────────────────
// Same shapes/logic as before, now reducing over the Firestore transaction
// list instead of a SQL query — the charts and their client code don't change.

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // 'YYYY-MM-DD...' -> 'YYYY-MM'
}

function lastNMonthKeys(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

interface AnalyticsRow {
  created_at: string;
  type: WalletTransactionType;
  amount: number;
  category: string | null;
}

/**
 * Monthly Balance + Income vs Expense charts. Walks the full transaction
 * history once (oldest first) to get a true running balance, buckets
 * income/expense into the visible window, and fill-forwards balance for any
 * month with no activity so the line doesn't drop to 0 between deposits.
 */
export async function getMonthlyAnalytics(tripId: string | number, months = 6) {
  const visibleMonths = lastNMonthKeys(months);
  const earliestVisible = visibleMonths[0];

  const allTx = [...(await transactions.listTransactions(Number(tripId)))].sort((a, b) =>
    a.created_at < b.created_at ? -1 : 1,
  ) as AnalyticsRow[];

  let running = 0;
  let carryBeforeWindow = 0;
  const incomeByMonth = new Map<string, number>();
  const expenseByMonth = new Map<string, number>();
  const balanceAtMonthEnd = new Map<string, number>();

  for (const tx of allTx) {
    const m = monthKey(tx.created_at);
    running += tx.type === 'deposit' ? tx.amount : -tx.amount;
    balanceAtMonthEnd.set(m, running);
    if (m < earliestVisible) {
      carryBeforeWindow = running;
    } else {
      const bucket = tx.type === 'deposit' ? incomeByMonth : expenseByMonth;
      bucket.set(m, (bucket.get(m) ?? 0) + tx.amount);
    }
  }

  let carry = carryBeforeWindow;
  return visibleMonths.map((month) => {
    if (balanceAtMonthEnd.has(month)) carry = balanceAtMonthEnd.get(month)!;
    return {
      month,
      income: incomeByMonth.get(month) ?? 0,
      expense: expenseByMonth.get(month) ?? 0,
      balance: carry,
    };
  });
}

/** Expense Categories chart — sum(amount) per category, withdrawals only. */
export async function getExpenseCategories(tripId: string | number) {
  const allTx = (await transactions.listTransactions(Number(tripId))) as AnalyticsRow[];
  const totals = new Map<string, number>();
  for (const tx of allTx) {
    if (tx.type !== 'withdraw') continue;
    const category = tx.category ?? 'Other';
    totals.set(category, (totals.get(category) ?? 0) + tx.amount);
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

/** Transaction Trend chart — running balance immediately after each of the last N transactions. */
export async function getTransactionTrend(tripId: string | number, limit = 20) {
  const allTx = [...(await transactions.listTransactions(Number(tripId)))].sort((a, b) =>
    a.created_at < b.created_at ? -1 : 1,
  ) as AnalyticsRow[];

  let running = 0;
  const points = allTx.map((tx) => {
    running += tx.type === 'deposit' ? tx.amount : -tx.amount;
    return { date: tx.created_at, balance: running };
  });

  return points.slice(-limit);
}

export async function getWalletAnalytics(tripId: string | number) {
  const [monthly, categoriesTotals, trend] = await Promise.all([
    getMonthlyAnalytics(tripId),
    getExpenseCategories(tripId),
    getTransactionTrend(tripId),
  ]);
  return { monthly, categories: categoriesTotals, trend };
}
