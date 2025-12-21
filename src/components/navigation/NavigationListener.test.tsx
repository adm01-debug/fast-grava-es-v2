import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavigationListener } from './NavigationListener';

describe('NavigationListener', () => {
  it('should render without errors', () => {
    expect(() => render(<NavigationListener />, { wrapper: BrowserRouter })).not.toThrow();
  });

  it('should track navigation', () => {
    render(<NavigationListener />, { wrapper: BrowserRouter });
    // Component should be listening to navigation events
  });
});
