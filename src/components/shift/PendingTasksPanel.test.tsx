import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PendingTasksPanel } from './PendingTasksPanel';

const mockTasks = [
  { id: '1', title: 'Verificar estoque', priority: 'high', dueDate: new Date().toISOString() },
];

describe('PendingTasksPanel', () => {
  it('should render tasks', () => {
    render(<PendingTasksPanel tasks={mockTasks} />);
    expect(screen.getByText(/pendentes|tarefas/i)).toBeInTheDocument();
  });
  it('should show task titles', () => {
    render(<PendingTasksPanel tasks={mockTasks} />);
    expect(screen.getByText('Verificar estoque')).toBeInTheDocument();
  });
});
