import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BreadcrumbProvider, useBreadcrumbs } from './BreadcrumbContext';
import React from 'react';

const TestComponent = () => {
  const { breadcrumbs, setBreadcrumbs, addBreadcrumb, clearBreadcrumbs } = useBreadcrumbs();
  return (
    <div>
      <span data-testid="count">{breadcrumbs.length}</span>
      <button onClick={() => setBreadcrumbs([{ label: 'Home' }])}>Set</button>
      <button onClick={() => addBreadcrumb({ label: 'Page' })}>Add</button>
      <button onClick={clearBreadcrumbs}>Clear</button>
    </div>
  );
};

describe('BreadcrumbContext', () => {
  it('provides breadcrumb context', () => {
    render(<BreadcrumbProvider><TestComponent /></BreadcrumbProvider>);
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('sets breadcrumbs', () => {
    render(<BreadcrumbProvider><TestComponent /></BreadcrumbProvider>);
    act(() => screen.getByText('Set').click());
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('adds breadcrumb', () => {
    render(<BreadcrumbProvider><TestComponent /></BreadcrumbProvider>);
    act(() => screen.getByText('Set').click());
    act(() => screen.getByText('Add').click());
    expect(screen.getByTestId('count').textContent).toBe('2');
  });

  it('clears breadcrumbs', () => {
    render(<BreadcrumbProvider><TestComponent /></BreadcrumbProvider>);
    act(() => screen.getByText('Set').click());
    act(() => screen.getByText('Clear').click());
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
});
