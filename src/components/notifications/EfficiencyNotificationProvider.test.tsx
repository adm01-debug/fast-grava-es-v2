import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EfficiencyNotificationProvider } from './EfficiencyNotificationProvider';

describe('EfficiencyNotificationProvider', () => {
  it('should render children', () => {
    render(<EfficiencyNotificationProvider><div>Content</div></EfficiencyNotificationProvider>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
