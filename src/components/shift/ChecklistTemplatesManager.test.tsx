import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChecklistTemplatesManager } from './ChecklistTemplatesManager';

describe('ChecklistTemplatesManager', () => {
  it('should render manager', () => {
    render(<ChecklistTemplatesManager />);
    expect(screen.getByText(/templates|checklist/i)).toBeInTheDocument();
  });
  it('should have create button', () => {
    render(<ChecklistTemplatesManager />);
    expect(screen.getByRole('button', { name: /novo|criar/i })).toBeInTheDocument();
  });
});
