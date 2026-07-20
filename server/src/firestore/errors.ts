/**
 * Thrown for a rejected wallet mutation (amount <= 0, or a withdrawal/void
 * that would overdraft). Lives here (rather than in services/walletService.ts)
 * so firestore/transactionsRepo.ts can throw it from inside a Firestore
 * transaction callback without importing back from the service that imports
 * this repo.
 */
export class WalletValidationError extends Error {}

/**
 * Thrown when Firestore itself isn't reachable/configured (missing or
 * invalid FIRESTORE_SERVICE_ACCOUNT_JSON — see firestore/client.ts). Kept
 * distinct from WalletValidationError so the controller can return 503
 * ("feature not set up") instead of 400 ("bad input") — the request itself
 * may have been perfectly valid.
 */
export class WalletConfigError extends Error {}
