import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { getWalletFirestore } from '../firestore/client';

const COLLECTION = 'users';

export interface WalletUserRef {
  id: number;
  username: string;
}

function db(): Firestore {
  return getWalletFirestore();
}

/**
 * Users collection — intentionally read-mostly. TREK's SQLite `users` table
 * (server/src/db/schema.ts) is the real identity/auth source of truth; this
 * collection is a small denormalized copy (id + username only) so
 * transaction docs can be joined to a display name without either storing
 * the name redundantly on every transaction or reaching back into SQLite
 * from the Firestore layer.
 *
 * Create/Update: upsertUserRef() — called once per request from
 * services/walletService.ts using the already-authenticated req.user, so it
 * self-heals if a username changes (next write re-syncs it). No public
 * create/update/delete endpoint is exposed for this collection — deleting or
 * hand-editing an identity record through the wallet feature isn't a
 * legitimate operation; account changes go through TREK's real user system.
 */
export async function upsertUserRef(user: WalletUserRef): Promise<void> {
  await db()
    .collection(COLLECTION)
    .doc(String(user.id))
    .set(
      {
        id: user.id,
        username: user.username,
        synced_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export async function getUserRef(userId: number): Promise<WalletUserRef | null> {
  const snap = await db().collection(COLLECTION).doc(String(userId)).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return { id: data.id, username: data.username };
}
