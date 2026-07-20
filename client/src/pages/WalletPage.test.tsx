import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../tests/helpers/render';
import { Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../../tests/helpers/msw/server';
import { resetAllStores, seedStore } from '../../tests/helpers/store';
import { buildUser } from '../../tests/helpers/factories';
import { useAuthStore } from '../store/authStore';
import WalletPage from './WalletPage';

function renderWalletPage(tripId: number | string = 1) {
  return render(
    <Routes>
      <Route path="/trips/:id/wallet" element={<WalletPage />} />
    </Routes>,
    { initialEntries: [`/trips/${tripId}/wallet`] },
  );
}

beforeEach(() => {
  resetAllStores();
  seedStore(useAuthStore, { isAuthenticated: true, user: buildUser() });
});

describe('WalletPage', () => {
  it('loads the balance and shows it', async () => {
    server.use(
      http.get('/api/trips/:id/wallet', () =>
        HttpResponse.json({ balance: 120.5, totalIncome: 120.5, totalExpense: 0, transactions: [] }),
      ),
      http.get('/api/trips/:id/wallet/categories', () => HttpResponse.json({ categories: [] })),
    );

    renderWalletPage(1);

    await waitFor(() => {
      expect(screen.getByText('$120.50')).toBeInTheDocument();
    });
    expect(screen.getByText('No transactions yet.')).toBeInTheDocument();
  });
});
