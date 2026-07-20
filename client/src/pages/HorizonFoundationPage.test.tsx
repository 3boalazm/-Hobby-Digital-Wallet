import { describe, it, expect } from 'vitest';
import { render, screen } from '../../tests/helpers/render';
import HorizonFoundationPage from './HorizonFoundationPage';

describe('HorizonFoundationPage', () => {
  it('renders the Horizon shell without crashing', () => {
    render(<HorizonFoundationPage />, { initialEntries: ['/horizon-foundation'] });

    expect(screen.getByText('Horizon dashboard foundation')).toBeInTheDocument();
  });
});
