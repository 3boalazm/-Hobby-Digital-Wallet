import { Body, Controller, Delete, Get, Headers, HttpException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import type { User } from '../../types';
import { WalletService } from './wallet.service';
import { WalletValidationError, WalletConfigError } from '../../services/walletService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * /api/trips/:tripId/wallet — trip-scoped shared fund, backed by Firestore
 * (wallets/transactions/categories collections, plus a denormalized users
 * read-cache — see services/walletService.ts and firestore/*Repo.ts).
 *
 * GET is available to any trip member/owner (view-only, same as todo's
 * list()); mutations (deposit/withdraw, transaction edit/void, category
 * create/update/delete) check the 'wallet_edit' permission (403 "No
 * permission"), same shape as budget/packing/todo. Amount validation mirrors
 * the reference digitalWalletApp console app: amount must be > 0, and a
 * withdrawal must not exceed the current balance — enforced in
 * services/walletService.ts and surfaced here as 400s. Deposit/withdraw and
 * void broadcast over WebSocket with the forwarded X-Socket-Id.
 *
 * GET .../analytics is a separate, read-only endpoint for the dashboard's
 * four Chart.js charts (monthly balance/income/expense, expense categories,
 * transaction trend) — same trip-access check, no permission check beyond that.
 *
 * Every handler runs through withErrorHandling() so a misconfigured Firestore
 * (missing/invalid FIRESTORE_SERVICE_ACCOUNT_JSON) comes back as a clear 503
 * instead of a generic 500 — the rest of TREK doesn't need Firestore, but
 * this whole controller does, so that failure mode is worth calling out
 * distinctly from "you sent a bad amount" (400).
 */
@Controller('api/trips/:tripId/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  private requireTrip(tripId: string, user: User) {
    const trip = this.wallet.verifyTripAccess(tripId, user.id);
    if (!trip) {
      throw new HttpException({ error: 'Trip not found' }, 404);
    }
    return trip;
  }

  private requireEdit(trip: ReturnType<WalletService['verifyTripAccess']>, user: User): void {
    if (!this.wallet.canEdit(trip!, user)) {
      throw new HttpException({ error: 'No permission' }, 403);
    }
  }

  private async withErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof WalletValidationError) {
        throw new HttpException({ error: err.message }, 400);
      }
      if (err instanceof WalletConfigError) {
        throw new HttpException({ error: 'Wallet feature is not configured on this server (Firestore).' }, 503);
      }
      throw err;
    }
  }

  @Get()
  async get(@CurrentUser() user: User, @Param('tripId') tripId: string) {
    this.requireTrip(tripId, user);
    return this.withErrorHandling(() => this.wallet.getState(tripId));
  }

  @Get('analytics')
  async getAnalytics(@CurrentUser() user: User, @Param('tripId') tripId: string) {
    this.requireTrip(tripId, user);
    return this.withErrorHandling(() => this.wallet.getAnalytics(tripId));
  }

  @Post('deposit')
  async deposit(
    @CurrentUser() user: User,
    @Param('tripId') tripId: string,
    @Body() body: { amount?: number; note?: string },
    @Headers('x-socket-id') socketId?: string,
  ) {
    const trip = this.requireTrip(tripId, user);
    this.requireEdit(trip, user);
    return this.withErrorHandling(async () => {
      const result = await this.wallet.deposit(tripId, Number(body.amount), user.id, body.note, user.username);
      this.wallet.broadcast(tripId, 'wallet:updated', result, socketId);
      return result;
    });
  }

  @Post('withdraw')
  async withdraw(
    @CurrentUser() user: User,
    @Param('tripId') tripId: string,
    @Body() body: { amount?: number; note?: string; category?: string },
    @Headers('x-socket-id') socketId?: string,
  ) {
    const trip = this.requireTrip(tripId, user);
    this.requireEdit(trip, user);
    return this.withErrorHandling(async () => {
      const result = await this.wallet.withdraw(tripId, Number(body.amount), user.id, body.note, body.category, user.username);
      this.wallet.broadcast(tripId, 'wallet:updated', result, socketId);
      return result;
    });
  }

  @Patch('transactions/:transactionId')
  async updateTransaction(
    @CurrentUser() user: User,
    @Param('tripId') tripId: string,
    @Param('transactionId') transactionId: string,
    @Body() body: { note?: string; category?: string | null },
    @Headers('x-socket-id') socketId?: string,
  ) {
    const trip = this.requireTrip(tripId, user);
    this.requireEdit(trip, user);
    return this.withErrorHandling(async () => {
      const updated = await this.wallet.updateTransaction(tripId, transactionId, body);
      if (!updated) {
        throw new HttpException({ error: 'Transaction not found' }, 404);
      }
      this.wallet.broadcast(tripId, 'wallet:transaction-updated', { transaction: updated }, socketId);
      return { transaction: updated };
    });
  }

  @Delete('transactions/:transactionId')
  async deleteTransaction(
    @CurrentUser() user: User,
    @Param('tripId') tripId: string,
    @Param('transactionId') transactionId: string,
    @Headers('x-socket-id') socketId?: string,
  ) {
    const trip = this.requireTrip(tripId, user);
    this.requireEdit(trip, user);
    return this.withErrorHandling(async () => {
      const result = await this.wallet.deleteTransaction(tripId, transactionId);
      if (!result) {
        throw new HttpException({ error: 'Transaction not found' }, 404);
      }
      this.wallet.broadcast(tripId, 'wallet:updated', result, socketId);
      return result;
    });
  }

  @Get('categories')
  async listCategories(@CurrentUser() user: User, @Param('tripId') tripId: string) {
    this.requireTrip(tripId, user);
    return this.withErrorHandling(async () => ({ categories: await this.wallet.listCategories(tripId) }));
  }

  @Post('categories')
  async createCategory(
    @CurrentUser() user: User,
    @Param('tripId') tripId: string,
    @Body() body: { name?: string; icon?: string; color?: string },
  ) {
    const trip = this.requireTrip(tripId, user);
    this.requireEdit(trip, user);
    if (!body.name) {
      throw new HttpException({ error: 'Category name is required' }, 400);
    }
    return this.withErrorHandling(async () => {
      const category = await this.wallet.createCategory(tripId, { name: body.name!, icon: body.icon, color: body.color });
      return { category };
    });
  }

  @Patch('categories/:categoryId')
  async updateCategory(
    @CurrentUser() user: User,
    @Param('tripId') tripId: string,
    @Param('categoryId') categoryId: string,
    @Body() body: { name?: string; icon?: string; color?: string },
  ) {
    const trip = this.requireTrip(tripId, user);
    this.requireEdit(trip, user);
    return this.withErrorHandling(async () => {
      const category = await this.wallet.updateCategory(tripId, categoryId, body);
      if (!category) {
        throw new HttpException({ error: 'Category not found' }, 404);
      }
      return { category };
    });
  }

  @Delete('categories/:categoryId')
  async deleteCategory(
    @CurrentUser() user: User,
    @Param('tripId') tripId: string,
    @Param('categoryId') categoryId: string,
  ) {
    const trip = this.requireTrip(tripId, user);
    this.requireEdit(trip, user);
    return this.withErrorHandling(async () => {
      const deleted = await this.wallet.deleteCategory(tripId, categoryId);
      if (!deleted) {
        throw new HttpException({ error: 'Category not found' }, 404);
      }
      return { success: true };
    });
  }
}
