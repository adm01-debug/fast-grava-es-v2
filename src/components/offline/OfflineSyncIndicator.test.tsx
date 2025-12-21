import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfflineSyncIndicator } from './OfflineSyncIndicator';

describe('OfflineSyncIndicator', () => {
  it('should show synced status', () => {
    render(<OfflineSyncIndicator status="synced" />);
    expect(screen.getByText(/sincronizado|synced/i)).toBeInTheDocument();
  });

  it('should show syncing status', () => {
    render(<OfflineSyncIndicator status="syncing" />);
    expect(screen.getByText(/sincronizando|syncing/i)).toBeInTheDocument();
  });

  it('should show error status', () => {
    render(<OfflineSyncIndicator status="error" />);
    expect(screen.getByText(/erro|error/i)).toBeInTheDocument();
  });

  it('should display last sync time', () => {
    render(<OfflineSyncIndicator status="synced" lastSync={new Date().toISOString()} />);
    expect(screen.getByText(/agora|há/i)).toBeInTheDocument();
  });
});
