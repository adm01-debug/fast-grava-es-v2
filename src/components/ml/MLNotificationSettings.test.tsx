import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MLNotificationSettings } from './MLNotificationSettings';

describe('MLNotificationSettings', () => {
  const mockOnSave = vi.fn();

  it('should render settings form', () => {
    render(<MLNotificationSettings onSave={mockOnSave} />);
    expect(screen.getByText(/notificações|configurações/i)).toBeInTheDocument();
  });

  it('should have threshold settings', () => {
    render(<MLNotificationSettings onSave={mockOnSave} />);
    expect(screen.getByLabelText(/limite|threshold/i)).toBeInTheDocument();
  });

  it('should have toggle for notifications', () => {
    render(<MLNotificationSettings onSave={mockOnSave} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('should save settings', async () => {
    render(<MLNotificationSettings onSave={mockOnSave} />);
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
    expect(mockOnSave).toHaveBeenCalled();
  });
});
