import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../tests/helpers/render';
import { Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../../tests/helpers/msw/server';
import { resetAllStores, seedStore } from '../../tests/helpers/store';
import { buildUser } from '../../tests/helpers/factories';
import { useAuthStore } from '../store/authStore';
import DashboardOverviewPage from './DashboardOverviewPage';

// jsdom has no real canvas 2D context, so Chart.js can't actually draw here.
// Stub react-chartjs-2's chart components (same approach FilesPage.test.tsx
// uses for FileManager/Navbar) — this test is about the page wiring real
// data through, not about Chart.js's own rendering, which isn't our code.
vi.mock('react-chartjs-2', () => ({
  Line: () => React.createElement('div', { 'data-testid': 'chart-line' }),
  Bar: () => React.createElement('div', { 'data-testid': 'chart-bar' }),
  Doughnut: () => React.createElement('div', { 'data-testid': 'chart-doughnut' }),
}));

function renderDashboard(tripId: number | string = 1) {
  return render(
    <Routes>
      <Route path="/trips/:id/dashboard" element={<DashboardOverviewPage />} />
    </Routes>,
    { initialEntries: [`/trips/${tripId}/dashboard`] },
  );
}

beforeEach(() => {
  resetAllStores();
  seedStore(useAuthStore, { isAuthenticated: true, user: buildUser() });
});

describe('DashboardOverviewPage', () => {
  it('loads and shows the stat widgets, charts and quick actions', async () => {
    server.use(
      http.get('/api/trips/:id/wallet', () =>
        HttpResponse.json({
          balance: 75,
          totalIncome: 200,
          totalExpense: 125,
          transactions: [
            { id: 1, trip_id: 1, type: 'deposit', amount: 200, category: null, note: null, created_by: 1, created_at: '2026-07-01T00:00:00.000Z' },
            { id: 2, trip_id: 1, type: 'withdraw', amount: 125, category: 'Food', note: null, created_by: 1, created_at: '2026-07-02T00:00:00.000Z' },
          ],
        }),
      ),
      http.get('/api/trips/:id/wallet/analytics', () =>
        HttpResponse.json({
          monthly: [{ month: '2026-07', income: 200, expense: 125, balance: 75 }],
          categories: [{ category: 'Food', total: 125 }],
          trend: [
            { date: '2026-07-01T00:00:00.000Z', balance: 200 },
            { date: '2026-07-02T00:00:00.000Z', balance: 75 },
          ],
        }),
      ),
    );

    renderDashboard(1);

    await waitFor(() => {
      expect(screen.getByText('$75.00')).toBeInTheDocument();
    });
    // '+$200.00' legitimately appears twice: the Income stat card, and the
    // matching $200 deposit row in Recent Transactions — both correct.
    expect(screen.getAllByText('+$200.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('-$125.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Monthly Balance')).toBeInTheDocument();
    expect(screen.getByText('Income vs Expense')).toBeInTheDocument();
    expect(screen.getByText('Expense Categories')).toBeInTheDocument();
    expect(screen.getByText('Transaction Trend')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });
});
