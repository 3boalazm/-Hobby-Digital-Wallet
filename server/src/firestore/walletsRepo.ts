import { FieldValue, Timestamp, type Firestore, type Transaction } from 'firebase-admin/firestore';
import { getWalletFirestore } from '../firestore/client';

const COLLECTION = 'wallets';

export interface WalletDoc {
  trip_id: number;
  balance: number;
  updated_at: string;
}

function db(): Firestore {
  return getWalletFirestore();
}

function toWalletDoc(tripId: number, data: FirebaseFirestore.DocumentData): WalletDoc {
  const updatedAt = data.updated_at as Timestamp | undefined;
  return {
    trip_id: tripId,
    balance: data.balance ?? 0,
    updated_at: updatedAt ? updatedAt.toDate().toISOString() : new Date().toISOString(),
  };
}

/** Read a trip's wallet doc, creating a zero-balance one on first access (mirrors the old getOrCreateAccount()). */
export async function getOrCreateWallet(tripId: number): Promise<WalletDoc> {
  const ref = db().collection(COLLECTION).doc(String(tripId));
  const snap = await ref.get();
  if (snap.exists) {
    return toWalletDoc(tripId, snap.data()!);
  }

  await ref.set({ trip_id: tripId, balance: 0, updated_at: FieldValue.serverTimestamp() });
  const created = await ref.get();
  return toWalletDoc(tripId, created.data()!);
}

export async function getBalance(tripId: number): Promise<number> {
  return (await getOrCreateWallet(tripId)).balance;
}

/**
 * Adjust the balance by `delta` (positive for deposit, negative for
 * withdraw/void) inside an already-open Firestore transaction, so the
 * balance write and the transaction-log write in transactionsRepo.ts commit
 * atomically. Returns the new balance for the caller to return to the client.
 */
export function adjustBalanceInTransaction(txn: Transaction, tripId: number, delta: number, currentBalance: number): number {
  const ref = db().collection(COLLECTION).doc(String(tripId));
  const newBalance = currentBalance + delta;
  txn.set(ref, { trip_id: tripId, balance: newBalance, updated_at: FieldValue.serverTimestamp() }, { merge: true });
  return newBalance;
}

export function walletDocRef(tripId: number) {
  return db().collection(COLLECTION).doc(String(tripId));
}
