import { FieldValue, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { getWalletFirestore } from '../firestore/client';
import { walletDocRef, adjustBalanceInTransaction } from './walletsRepo';
import { WalletValidationError } from './errors';

const COLLECTION = 'transactions';

export type WalletTransactionType = 'deposit' | 'withdraw';

export interface WalletTransactionDoc {
  id: string;
  trip_id: number;
  type: WalletTransactionType;
  amount: number;
  category: string | null;
  note: string | null;
  created_by: number;
  created_at: string;
}

function db(): Firestore {
  return getWalletFirestore();
}

function toTransactionDoc(id: string, data: FirebaseFirestore.DocumentData): WalletTransactionDoc {
  const createdAt = data.created_at as Timestamp | undefined;
  return {
    id,
    trip_id: data.trip_id,
    type: data.type,
    amount: data.amount,
    category: data.category ?? null,
    note: data.note ?? null,
    created_by: data.created_by,
    created_at: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
  };
}

/**
 * Single-field equality filter only (no .orderBy() in the query itself) —
 * combining an equality filter with an orderBy on a different field would
 * need a Firestore composite index provisioned up front. Sorting the
 * (trip-sized, not collection-sized) result in-process avoids that
 * deployment step entirely.
 */
export async function listTransactions(tripId: number): Promise<WalletTransactionDoc[]> {
  const snap = await db().collection(COLLECTION).where('trip_id', '==', tripId).get();
  return snap.docs
    .map((d) => toTransactionDoc(d.id, d.data()))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

/** Income/Expense for the dashboard widgets — summed in-process over the same
 *  list rather than a Firestore aggregate query, same index-avoidance reasoning
 *  as listTransactions(); fine at trip-wallet scale (dozens–hundreds of rows). */
export async function getTotals(tripId: number): Promise<{ totalIncome: number; totalExpense: number }> {
  const txns = await listTransactions(tripId);
  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of txns) {
    if (t.type === 'deposit') totalIncome += t.amount;
    else totalExpense += t.amount;
  }
  return { totalIncome, totalExpense };
}

/**
 * Deposit or withdraw: writes the transaction doc and adjusts the wallet
 * balance atomically (same Firestore transaction), so the two collections
 * never disagree. The overdraft check reads the LIVE balance inside the
 * transaction (not a value passed in from an earlier request) so two
 * concurrent withdrawals can't both pass against a stale balance.
 *
 * `category` is only meaningful for withdrawals (matches the existing
 * Expense Categories chart — income isn't categorized); deposits always
 * store it as null regardless of what's passed.
 */
export async function createTransaction(
  tripId: number,
  type: WalletTransactionType,
  amount: number,
  userId: number,
  note?: string,
  category?: string,
): Promise<{ balance: number; transaction: WalletTransactionDoc }> {
  const firestore = db();
  const walletRef = walletDocRef(tripId);
  const txnRef = firestore.collection(COLLECTION).doc();

  const newBalance = await firestore.runTransaction(async (txn) => {
    const walletSnap = await txn.get(walletRef);
    const currentBalance = walletSnap.exists ? (walletSnap.data()!.balance ?? 0) : 0;

    if (type === 'withdraw' && amount > currentBalance) {
      throw new WalletValidationError('Withdrawal cannot exceed the current balance');
    }

    const delta = type === 'deposit' ? amount : -amount;
    const balance = adjustBalanceInTransaction(txn, tripId, delta, currentBalance);

    txn.set(txnRef, {
      trip_id: tripId,
      type,
      amount,
      category: type === 'withdraw' ? (category ?? null) : null,
      note: note ?? null,
      created_by: userId,
      created_at: FieldValue.serverTimestamp(),
    });

    return balance;
  });

  const created = await txnRef.get();
  return { balance: newBalance, transaction: toTransactionDoc(txnRef.id, created.data()!) };
}

/** Metadata-only edit (note/category) — never touches amount/type, so the
 *  balance is untouched and this needs no Firestore transaction. */
export async function updateTransaction(
  tripId: number,
  transactionId: string,
  data: { note?: string; category?: string | null },
): Promise<WalletTransactionDoc | null> {
  const ref = db().collection(COLLECTION).doc(transactionId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.trip_id !== tripId) return null;

  const update: Record<string, unknown> = {};
  if (data.note !== undefined) update.note = data.note;
  if (data.category !== undefined) update.category = data.category;
  await ref.update(update);

  const updated = await ref.get();
  return toTransactionDoc(ref.id, updated.data()!);
}

/** "Delete" = void: removes the transaction AND reverses its effect on the
 *  balance, atomically, so history and balance can't drift apart. A bare
 *  delete of the doc without this would silently corrupt the balance. */
export async function voidTransaction(tripId: number, transactionId: string): Promise<{ balance: number } | null> {
  const firestore = db();
  const txnDocRef = firestore.collection(COLLECTION).doc(transactionId);
  const walletRef = walletDocRef(tripId);

  return firestore.runTransaction(async (txn) => {
    const txnSnap = await txn.get(txnDocRef);
    if (!txnSnap.exists || txnSnap.data()?.trip_id !== tripId) return null;
    const txnData = txnSnap.data()!;

    const walletSnap = await txn.get(walletRef);
    const currentBalance = walletSnap.exists ? (walletSnap.data()!.balance ?? 0) : 0;

    const delta = txnData.type === 'deposit' ? -txnData.amount : txnData.amount;
    const balance = adjustBalanceInTransaction(txn, tripId, delta, currentBalance);

    txn.delete(txnDocRef);
    return { balance };
  });
}
