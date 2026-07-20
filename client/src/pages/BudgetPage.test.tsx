import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../tests/helpers/render';
import { Route, Routes } from 'react-router-dom';
import { resetAllStores, seedStore } from '../../tests/helpers/store';
import { buildUser } from '../../tests/helpers/factories';
import { useAuthStore } from '../store/authStore';
import BudgetPage from './BudgetPage';

function renderBudgetPage(tripId: number | string = 1) {
  return render(
    <Routes>
      <Route path="/trips/:id/budget" element={<BudgetPage />} />
    </Routes>,
    { initialEntries: [`/trips/${tripId}/budget`] },
  );
}

beforeEach(() => {
  resetAllStores();
  seedStore(useAuthStore, { isAuthenticated: true, user: buildUser() });
});

describe('BudgetPage', () => {
  // No custom MSW handlers here on purpose — the app's default handlers
  // (tests/helpers/msw/handlers/trips.ts, budget.ts) already return a real
  // trip + a seeded budget item via buildBudgetItem(); this only checks that
  // BudgetPage's bootstrapping (loadTrip + member fetch) gets far enough for
  // the existing BudgetPanel to render real data. BudgetPanel's own behavior
  // is already covered by BudgetPanel.test.tsx (FE-COMP-BUDGET-001..040).
  it('loads the trip and renders the existing BudgetPanel with its data', async () => {
    renderBudgetPage(1);

    await waitFor(() => {
      expect(screen.getByText(/Budget item \d+/)).toBeInTheDocument();
    });
  });
});
