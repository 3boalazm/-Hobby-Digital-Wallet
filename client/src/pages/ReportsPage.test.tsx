import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../tests/helpers/render';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../../tests/helpers/msw/server';
import { resetAllStores, seedStore } from '../../tests/helpers/store';
import { buildUser } from '../../tests/helpers/factories';
import { useAuthStore } from '../store/authStore';
import ReportsPage from './ReportsPage';

function renderReportsPage(tripId: number | string = 1) {
  return render(
    <Routes>
      <Route path="/trips/:id/reports" element={<ReportsPage />} />
    </Routes>,
    { initialEntries: [`/trips/${tripId}/reports`] },
  );
}

beforeEach(() => {
  resetAllStores();
  seedStore(useAuthStore, { isAuthenticated: true, user: buildUser() });
});

describe('ReportsPage', () => {
  it('loads and shows transaction statistics, monthly summary, and the table', async () => {
    server.use(
      http.get('/api/trips/:id/wallet', () =>
        HttpResponse.json({
          balance: 50,
          totalIncome: 100,
          totalExpense: 50,
          transactions: [
            { id: 1, trip_id: 1, type: 'deposit', amount: 100, category: null, note: 'Initial funding', created_by: 1, created_at: '2026-07-01T00:00:00.000Z' },
            { id: 2, trip_id: 1, type: 'withdraw', amount: 50, category: 'Food', note: 'Dinner', created_by: 1, created_at: '2026-07-02T00:00:00.000Z' },
          ],
        }),
      ),
      http.get('/api/trips/:id/wallet/categories', () =>
        HttpResponse.json({ categories: [{ id: 'c1', trip_id: 1, name: 'Food', icon: null, color: null, created_at: '2026-07-01T00:00:00.000Z' }] }),
      ),
      http.get('/api/trips/:id/wallet/analytics', () =>
        HttpResponse.json({
          monthly: [{ month: '2026-07', income: 100, expense: 50, balance: 50 }],
          categories: [{ category: 'Food', total: 50 }],
          trend: [{ date: '2026-07-02T00:00:00.000Z', balance: 50 }],
        }),
      ),
    );

    renderReportsPage(1);

    await waitFor(() => {
      expect(screen.getByText('Monthly Summary')).toBeInTheDocument();
    });
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('Initial funding')).toBeInTheDocument();
  });

  it('filters the table by search text', async () => {
    server.use(
      http.get('/api/trips/:id/wallet', () =>
        HttpResponse.json({
          balance: 50,
          totalIncome: 100,
          totalExpense: 50,
          transactions: [
            { id: 1, trip_id: 1, type: 'deposit', amount: 100, category: null, note: 'Initial funding', created_by: 1, created_at: '2026-07-01T00:00:00.000Z' },
            { id: 2, trip_id: 1, type: 'withdraw', amount: 50, category: 'Food', note: 'Dinner', created_by: 1, created_at: '2026-07-02T00:00:00.000Z' },
          ],
        }),
      ),
      http.get('/api/trips/:id/wallet/categories', () => HttpResponse.json({ categories: [] })),
      http.get('/api/trips/:id/wallet/analytics', () => HttpResponse.json({ monthly: [], categories: [], trend: [] })),
    );

    renderReportsPage(1);
    await waitFor(() => {
      expect(screen.getByText('Dinner')).toBeInTheDocument();
    });

    const search = screen.getByPlaceholderText('Search note, category, type…');
    await userEvent.type(search, 'Dinner');

    await waitFor(() => {
      expect(screen.queryByText('Initial funding')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Dinner')).toBeInTheDocument();
  });
});
