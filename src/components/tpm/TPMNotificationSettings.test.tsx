import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TPMNotificationSettings } from './TPMNotificationSettings';

describe('TPMNotificationSettings', () => {
  it('should render settings', () => {
    render(<TPMNotificationSettings onSave={vi.fn()} />);
    expect(screen.getByText(/notificações|configurações/i)).toBeInTheDocument();
  });
  it('should have toggle options', () => {
    render(<TPMNotificationSettings onSave={vi.fn()} />);
    expect(screen.getAllByRole('switch').length).toBeGreaterThan(0);
  });
});
