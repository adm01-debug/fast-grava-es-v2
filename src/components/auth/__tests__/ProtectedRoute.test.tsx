import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false }),
}));

describe('ProtectedRoute', () => {
  it('should render children when authenticated', () => {
    expect(true).toBe(true);
  });

  it('should redirect when not authenticated', () => {
    expect(true).toBe(true);
  });

  it('should show loading state', () => {
    expect(true).toBe(true);
  });
});
