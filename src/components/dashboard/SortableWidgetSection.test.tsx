import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SortableWidgetSection } from './SortableWidgetSection';

describe('SortableWidgetSection', () => {
  it('should render section with title', () => {
    render(<SortableWidgetSection title="Dashboard"><div>Content</div></SortableWidgetSection>);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render children', () => {
    render(<SortableWidgetSection title="Test"><div>Widget Content</div></SortableWidgetSection>);
    expect(screen.getByText('Widget Content')).toBeInTheDocument();
  });

  it('should have drag handle', () => {
    render(<SortableWidgetSection title="Test"><div>Content</div></SortableWidgetSection>);
    expect(document.querySelector('[data-drag-handle]')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<SortableWidgetSection title="Test" className="custom"><div>Content</div></SortableWidgetSection>);
    expect(document.querySelector('.custom')).toBeInTheDocument();
  });
});
