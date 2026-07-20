import { FieldValue, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { getWalletFirestore } from '../firestore/client';

const COLLECTION = 'categories';

export interface WalletCategoryDoc {
  id: string;
  trip_id: number;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
}

/**
 * Same six categories that were previously a compile-time enum
 * (walletExpenseCategories in shared/src/wallet/wallet.schema.ts, used only
 * by withdrawals for the Expense Categories chart) — seeded once per trip so
 * existing behavior doesn't change the moment this becomes real, editable data.
 */
const DEFAULT_CATEGORIES: Array<{ name: string; icon: string | null; color: string | null }> = [
  { name: 'Food', icon: null, color: null },
  { name: 'Transport', icon: null, color: null },
  { name: 'Lodging', icon: null, color: null },
  { name: 'Activities', icon: null, color: null },
  { name: 'Shopping', icon: null, color: null },
  { name: 'Other', icon: null, color: null },
];

function db(): Firestore {
  return getWalletFirestore();
}

function toCategoryDoc(id: string, data: FirebaseFirestore.DocumentData): WalletCategoryDoc {
  const createdAt = data.created_at as Timestamp | undefined;
  return {
    id,
    trip_id: data.trip_id,
    name: data.name,
    icon: data.icon ?? null,
    color: data.color ?? null,
    created_at: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
  };
}

/** Lists a trip's categories, seeding the defaults above once if none exist yet. */
export async function listCategories(tripId: number): Promise<WalletCategoryDoc[]> {
  const collectionRef = db().collection(COLLECTION);
  const snap = await collectionRef.where('trip_id', '==', tripId).get();

  if (snap.empty) {
    const batch = db().batch();
    const created: WalletCategoryDoc[] = [];
    for (const seed of DEFAULT_CATEGORIES) {
      const ref = collectionRef.doc();
      batch.set(ref, { trip_id: tripId, ...seed, created_at: FieldValue.serverTimestamp() });
      created.push({ id: ref.id, trip_id: tripId, ...seed, created_at: new Date().toISOString() });
    }
    await batch.commit();
    return created;
  }

  return snap.docs
    .map((d) => toCategoryDoc(d.id, d.data()))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createCategory(
  tripId: number,
  data: { name: string; icon?: string; color?: string },
): Promise<WalletCategoryDoc> {
  const ref = db().collection(COLLECTION).doc();
  await ref.set({
    trip_id: tripId,
    name: data.name,
    icon: data.icon ?? null,
    color: data.color ?? null,
    created_at: FieldValue.serverTimestamp(),
  });
  const created = await ref.get();
  return toCategoryDoc(ref.id, created.data()!);
}

export async function updateCategory(
  tripId: number,
  categoryId: string,
  data: { name?: string; icon?: string; color?: string },
): Promise<WalletCategoryDoc | null> {
  const ref = db().collection(COLLECTION).doc(categoryId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.trip_id !== tripId) return null;

  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.icon !== undefined) update.icon = data.icon;
  if (data.color !== undefined) update.color = data.color;
  await ref.update(update);

  const updated = await ref.get();
  return toCategoryDoc(ref.id, updated.data()!);
}

export async function deleteCategory(tripId: number, categoryId: string): Promise<boolean> {
  const ref = db().collection(COLLECTION).doc(categoryId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.trip_id !== tripId) return false;
  await ref.delete();
  return true;
}
