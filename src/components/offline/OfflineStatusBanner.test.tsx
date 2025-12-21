import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfflineStatusBanner } from './OfflineStatusBanner';

vi.mock('@/hooks/utils/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: false }),
}));

describe('OfflineStatusBanner', () => {
  it('should show offline banner when offline', () => {
    render(<OfflineStatusBanner />);
    expect(screen.getByText(/offline|sem conexão/i)).toBeInTheDocument();
  });

  it('should indicate pending changes', () => {
    render(<OfflineStatusBanner pendingChanges={5} />);
    expect(screen.getByText(/5|pendentes/)).toBeInTheDocument();
  });
});
