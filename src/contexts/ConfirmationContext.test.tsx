import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ConfirmationProvider, useConfirmation } from './ConfirmationContext';
import React from 'react';

const TestComponent = () => {
  const { confirm, isOpen } = useConfirmation();
  return (
    <div>
      <span data-testid="open">{isOpen ? 'open' : 'closed'}</span>
      <button onClick={() => confirm({ title: 'Test', message: 'Are you sure?' })}>Open</button>
    </div>
  );
};

describe('ConfirmationContext', () => {
  it('provides confirmation context', () => {
    render(<ConfirmationProvider><TestComponent /></ConfirmationProvider>);
    expect(screen.getByTestId('open').textContent).toBe('closed');
  });

  it('opens confirmation dialog', async () => {
    render(<ConfirmationProvider><TestComponent /></ConfirmationProvider>);
    act(() => screen.getByText('Open').click());
    await waitFor(() => expect(screen.getByTestId('open').textContent).toBe('open'));
  });
});
