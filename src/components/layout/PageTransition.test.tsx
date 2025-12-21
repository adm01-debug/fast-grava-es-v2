import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageTransition } from './PageTransition';

describe('PageTransition', () => {
  it('should render children', () => {
    render(<PageTransition><div>Page Content</div></PageTransition>);
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('should apply transition classes', () => {
    render(<PageTransition><div>Content</div></PageTransition>);
    expect(document.querySelector('.transition, .animate')).toBeInTheDocument();
  });
});
