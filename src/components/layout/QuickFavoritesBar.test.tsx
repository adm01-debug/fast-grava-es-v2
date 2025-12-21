import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickFavoritesBar } from './QuickFavoritesBar';

vi.mock('@/hooks/useQuickFavorites', () => ({
  useQuickFavorites: () => ({
    favorites: [
      { id: '1', label: 'Dashboard', path: '/dashboard' },
      { id: '2', label: 'Kanban', path: '/kanban' },
    ],
  }),
}));

describe('QuickFavoritesBar', () => {
  it('should render favorites', () => {
    render(<QuickFavoritesBar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should show all favorites', () => {
    render(<QuickFavoritesBar />);
    expect(screen.getByText('Kanban')).toBeInTheDocument();
  });
});
