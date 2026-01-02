import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SidebarProvider, useSidebar } from './SidebarContext';
import React from 'react';

const TestComponent = () => {
  const { isOpen, toggle, open, close } = useSidebar();
  return (
    <div>
      <span data-testid="state">{isOpen ? 'open' : 'closed'}</span>
      <button onClick={toggle}>Toggle</button>
      <button onClick={open}>Open</button>
      <button onClick={close}>Close</button>
    </div>
  );
};

describe('SidebarContext', () => {
  it('provides sidebar context', () => {
    render(<SidebarProvider><TestComponent /></SidebarProvider>);
    expect(screen.getByTestId('state')).toBeInTheDocument();
  });

  it('toggles sidebar', () => {
    render(<SidebarProvider><TestComponent /></SidebarProvider>);
    const initial = screen.getByTestId('state').textContent;
    act(() => screen.getByText('Toggle').click());
    expect(screen.getByTestId('state').textContent).not.toBe(initial);
  });
});
