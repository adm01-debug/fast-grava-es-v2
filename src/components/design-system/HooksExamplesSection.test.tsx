import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HooksExamplesSection } from './HooksExamplesSection';

describe('HooksExamplesSection', () => {
  it('renders section', () => {
    render(<HooksExamplesSection />);
    expect(screen.getByText(/hooks/i)).toBeInTheDocument();
  });
});
