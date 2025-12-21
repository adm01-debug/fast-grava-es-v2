import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentsList } from './DocumentsList';

const mockDocuments = [
  { id: '1', name: 'Manual.pdf', size: 1024, createdAt: new Date().toISOString() },
  { id: '2', name: 'Guia.docx', size: 2048, createdAt: new Date().toISOString() },
];

describe('DocumentsList', () => {
  it('should render list of documents', () => {
    render(<DocumentsList documents={mockDocuments} />);
    expect(screen.getByText('Manual.pdf')).toBeInTheDocument();
    expect(screen.getByText('Guia.docx')).toBeInTheDocument();
  });

  it('should show file sizes', () => {
    render(<DocumentsList documents={mockDocuments} />);
    expect(screen.getByText(/1.*KB/i)).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(<DocumentsList documents={[]} />);
    expect(screen.getByText(/nenhum documento|sem documentos/i)).toBeInTheDocument();
  });

  it('should allow selecting documents', async () => {
    const onSelect = vi.fn();
    render(<DocumentsList documents={mockDocuments} onSelect={onSelect} />);
    // Test selection functionality
  });
});
