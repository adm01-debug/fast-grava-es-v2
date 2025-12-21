import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DroppableColumn } from './DroppableColumn';

describe('DroppableColumn', () => {
  it('should render column with title', () => {
    render(<DroppableColumn id="pending" title="Pendentes"><div>Jobs</div></DroppableColumn>);
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
  });

  it('should render children', () => {
    render(<DroppableColumn id="pending" title="Pendentes"><div>Job Content</div></DroppableColumn>);
    expect(screen.getByText('Job Content')).toBeInTheDocument();
  });

  it('should show job count', () => {
    render(<DroppableColumn id="pending" title="Pendentes" count={5}><div>Jobs</div></DroppableColumn>);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should be a drop target', () => {
    render(<DroppableColumn id="pending" title="Pendentes"><div>Jobs</div></DroppableColumn>);
    expect(document.querySelector('[data-droppable]')).toBeInTheDocument();
  });
});
