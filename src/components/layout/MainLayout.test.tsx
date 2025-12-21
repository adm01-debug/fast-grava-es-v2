import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MainLayout } from './MainLayout';

const wrapper = ({ children }: any) => <BrowserRouter>{children}</BrowserRouter>;

describe('MainLayout', () => {
  it('should render layout with children', () => {
    render(<MainLayout><div>Content</div></MainLayout>, { wrapper });
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should have main content area', () => {
    render(<MainLayout><div>Content</div></MainLayout>, { wrapper });
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
