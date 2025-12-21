import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentUploadModal } from './DocumentUploadModal';

describe('DocumentUploadModal', () => {
  const mockOnUpload = vi.fn();
  const mockOnClose = vi.fn();

  it('should render when open', () => {
    render(<DocumentUploadModal isOpen={true} onClose={mockOnClose} onUpload={mockOnUpload} />);
    expect(screen.getByText(/upload|enviar|documento/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<DocumentUploadModal isOpen={false} onClose={mockOnClose} onUpload={mockOnUpload} />);
    expect(screen.queryByText(/upload/i)).not.toBeInTheDocument();
  });

  it('should have file input', () => {
    render(<DocumentUploadModal isOpen={true} onClose={mockOnClose} onUpload={mockOnUpload} />);
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it('should call onClose when clicking cancel', async () => {
    render(<DocumentUploadModal isOpen={true} onClose={mockOnClose} onUpload={mockOnUpload} />);
    const cancelBtn = screen.getByRole('button', { name: /cancelar|fechar/i });
    await userEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
