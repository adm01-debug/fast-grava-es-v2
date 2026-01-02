import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureFlagsProvider, useFeatureFlags } from './FeatureFlagsContext';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => Promise.resolve({ data: [], error: null })) })) },
}));

const TestComponent = () => {
  const { flags, isEnabled } = useFeatureFlags();
  return <div data-testid="count">{Object.keys(flags).length}</div>;
};

describe('FeatureFlagsContext', () => {
  it('provides feature flags context', () => {
    render(<FeatureFlagsProvider><TestComponent /></FeatureFlagsProvider>);
    expect(screen.getByTestId('count')).toBeInTheDocument();
  });
});
