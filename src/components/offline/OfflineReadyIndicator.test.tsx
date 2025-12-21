import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfflineReadyIndicator } from './OfflineReadyIndicator';

describe('OfflineReadyIndicator', () => {
  it('should show ready when data is cached', () => {
    render(<OfflineReadyIndicator isReady={true} />);
    expect(screen.getByText(/pronto|ready|offline/i)).toBeInTheDocument();
  });

  it('should show not ready when data is not cached', () => {
    render(<OfflineReadyIndicator isReady={false} />);
    expect(screen.getByText(/sincronizando|syncing|não pronto/i)).toBeInTheDocument();
  });

  it('should display sync progress', () => {
    render(<OfflineReadyIndicator isReady={false} progress={50} />);
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });
});
