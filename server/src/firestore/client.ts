import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { WalletConfigError } from './errors';

/**
 * Firestore connection for the wallet feature (wallets, transactions,
 * categories, and a denormalized users read-cache — see ../services/walletService.ts).
 *
 * Everything else in TREK stays on the bundled SQLite database
 * (../db/database.ts); this is a second, independent store used only by
 * the wallet domain, so it's initialized lazily on first use rather than
 * at server boot — an instance that never touches the wallet feature
 * never needs FIRESTORE_* configured at all.
 */

const FIRESTORE_APP_NAME = 'trek-wallet';

let firestoreApp: App | undefined;
let firestoreDb: Firestore | undefined;

function loadServiceAccount(): Record<string, unknown> {
  const raw = process.env.FIRESTORE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new WalletConfigError(
      'FIRESTORE_SERVICE_ACCOUNT_JSON is not set. The wallet feature needs a GCP service-account key ' +
        '(Cloud Datastore User or Firebase Admin role) to reach Firestore — see server/.env.example.',
    );
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new WalletConfigError('FIRESTORE_SERVICE_ACCOUNT_JSON is not valid JSON — check server/.env.example for the expected shape.');
  }
}

function getFirestoreApp(): App {
  if (firestoreApp) return firestoreApp;

  const existing = getApps().find((a) => a.name === FIRESTORE_APP_NAME);
  if (existing) {
    firestoreApp = existing;
    return firestoreApp;
  }

  const serviceAccount = loadServiceAccount();
  firestoreApp = initializeApp(
    {
      credential: cert(serviceAccount as never),
      projectId: process.env.FIRESTORE_PROJECT_ID || (serviceAccount.project_id as string | undefined),
    },
    FIRESTORE_APP_NAME,
  );
  return firestoreApp;
}

/** The wallet feature's Firestore handle. Throws with an actionable message if unconfigured. */
export function getWalletFirestore(): Firestore {
  if (!firestoreDb) {
    firestoreDb = getFirestore(getFirestoreApp());
  }
  return firestoreDb;
}
