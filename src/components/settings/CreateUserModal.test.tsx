import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreateUserModal } from './CreateUserModal';

describe('CreateUserModal', () => {
  const mockOnCreate = vi.fn();
  const mockOnClose = vi.fn();
  it('should render when open', () => {
    render(<CreateUserModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
    expect(screen.getByText(/novo usuário|criar usuário/i)).toBeInTheDocument();
  });
  it('should have form fields', () => {
    render(<CreateUserModal isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});
