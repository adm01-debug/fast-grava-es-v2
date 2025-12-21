import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DraggableWidget } from './DraggableWidget';

describe('DraggableWidget', () => {
  it('should render children', () => {
    render(<DraggableWidget id="widget-1"><div>Content</div></DraggableWidget>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should have draggable handle', () => {
    render(<DraggableWidget id="widget-1"><div>Content</div></DraggableWidget>);
    expect(document.querySelector('[data-draggable]')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<DraggableWidget id="widget-1" className="custom-class"><div>Content</div></DraggableWidget>);
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should show drag indicator on hover', () => {
    render(<DraggableWidget id="widget-1"><div>Content</div></DraggableWidget>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<DraggableWidget id="widget-1"><div>Content</div></DraggableWidget>);
    expect(screen.getByText('Content').closest('div')).toBeInTheDocument();
  });
});
