import { Injectable } from '@nestjs/common';
import { broadcast } from '../../websocket';
import { checkPermission } from '../../services/permissions';
import type { User } from '../../types';
import * as svc from '../../services/walletService';

type Trip = NonNullable<ReturnType<typeof svc.verifyTripAccess>>;

/**
 * Thin Nest wrapper around the wallet service. Trip-access/permission checks
 * stay synchronous (SQLite, via services/permissions.ts + tripAccess.ts);
 * everything that now touches Firestore (services/walletService.ts) is
 * async, so those methods here return Promises that the controller awaits.
 */
@Injectable()
export class WalletService {
  verifyTripAccess(tripId: string, userId: number) {
    return svc.verifyTripAccess(tripId, userId);
  }

  canEdit(trip: Trip, user: User): boolean {
    return checkPermission('wallet_edit', user.role, trip.user_id, user.id, trip.user_id !== user.id);
  }

  broadcast(tripId: string, event: string, payload: Record<string, unknown>, socketId: string | undefined): void {
    broadcast(tripId, event, payload, socketId);
  }

  getState(tripId: string) {
    return svc.getWalletState(tripId);
  }

  getAnalytics(tripId: string) {
    return svc.getWalletAnalytics(tripId);
  }

  deposit(tripId: string, amount: number, userId: number, note: string | undefined, username: string) {
    return svc.deposit(tripId, amount, userId, note, username);
  }

  withdraw(tripId: string, amount: number, userId: number, note: string | undefined, category: string | undefined, username: string) {
    return svc.withdraw(tripId, amount, userId, note, category, username);
  }

  updateTransaction(tripId: string, transactionId: string, data: { note?: string; category?: string | null }) {
    return svc.updateTransaction(tripId, transactionId, data);
  }

  deleteTransaction(tripId: string, transactionId: string) {
    return svc.deleteTransaction(tripId, transactionId);
  }

  listCategories(tripId: string) {
    return svc.listCategories(tripId);
  }

  createCategory(tripId: string, data: { name: string; icon?: string; color?: string }) {
    return svc.createCategory(tripId, data);
  }

  updateCategory(tripId: string, categoryId: string, data: { name?: string; icon?: string; color?: string }) {
    return svc.updateCategory(tripId, categoryId, data);
  }

  deleteCategory(tripId: string, categoryId: string) {
    return svc.deleteCategory(tripId, categoryId);
  }
}
