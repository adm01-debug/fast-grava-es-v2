import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PushNotificationManager } from './PushNotificationManager';

describe('PushNotificationManager', () => {
  it('should render manager', () => {
    render(<PushNotificationManager />);
    expect(screen.getByText(/notificações|push/i)).toBeInTheDocument();
  });

  it('should have enable button', () => {
    render(<PushNotificationManager />);
    expect(screen.getByRole('button', { name: /ativar|enable/i })).toBeInTheDocument();
  });
});
