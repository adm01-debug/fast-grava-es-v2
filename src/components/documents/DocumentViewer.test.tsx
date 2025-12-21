import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentViewer } from './DocumentViewer';

describe('DocumentViewer', () => {
  const mockDocument = { id: '1', name: 'Manual.pdf', url: '/docs/manual.pdf', type: 'pdf' };

  it('should render document viewer', () => {
    render(<DocumentViewer document={mockDocument} />);
    expect(screen.getByText('Manual.pdf')).toBeInTheDocument();
  });

  it('should show PDF viewer for PDF files', () => {
    render(<DocumentViewer document={mockDocument} />);
    expect(document.querySelector('iframe, embed, object')).toBeInTheDocument();
  });

  it('should show image for image files', () => {
    const imageDoc = { ...mockDocument, type: 'image', url: '/docs/image.png' };
    render(<DocumentViewer document={imageDoc} />);
    expect(document.querySelector('img')).toBeInTheDocument();
  });

  it('should have download button', () => {
    render(<DocumentViewer document={mockDocument} />);
    expect(screen.getByRole('link', { name: /download|baixar/i })).toBeInTheDocument();
  });
});
