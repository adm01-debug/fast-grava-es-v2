import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreateHandoverModal } from './CreateHandoverModal';

describe('CreateHandoverModal', () => {
  it('should render when open', () => {
    render(<CreateHandoverModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    expect(screen.getByText(/passagem|turno|handover/i)).toBeInTheDocument();
  });
  it('should have notes field', () => {
    render(<CreateHandoverModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    expect(screen.getByLabelText(/observações|notas/i)).toBeInTheDocument();
  });
});
