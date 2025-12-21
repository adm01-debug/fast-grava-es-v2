import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

const wrapper = ({ children }: any) => <BrowserRouter>{children}</BrowserRouter>;

describe('AppSidebar', () => {
  it('should render sidebar', () => {
    render(<AppSidebar />, { wrapper });
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should have navigation links', () => {
    render(<AppSidebar />, { wrapper });
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });

  it('should have logo or brand', () => {
    render(<AppSidebar />, { wrapper });
    expect(screen.getByText(/fast.*grava|logo/i)).toBeInTheDocument();
  });
});
