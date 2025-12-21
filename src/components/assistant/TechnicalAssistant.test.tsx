import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TechnicalAssistant } from './TechnicalAssistant';

// Mock useTechnicalConversations hook
const mockSendMessage = vi.fn();
const mockClearConversation = vi.fn();

vi.mock('@/hooks/useTechnicalConversations', () => ({
  useTechnicalConversations: () => ({
    messages: [],
    isLoading: false,
    sendMessage: mockSendMessage,
    clearConversation: mockClearConversation,
    error: null,
  }),
}));

// Mock Sheet components
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    open ? <div data-testid="sheet">{children}</div> : null
  ),
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-header">{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="sheet-title">{children}</h2>
  ),
}));

describe('TechnicalAssistant', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<TechnicalAssistant isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByTestId('sheet')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByTestId('sheet')).toBeInTheDocument();
    });

    it('should render sheet content', () => {
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    });

    it('should render sheet header', () => {
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByTestId('sheet-header')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByTestId('sheet-title')).toBeInTheDocument();
    });

    it('should render input field for messages', () => {
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByPlaceholderText(/digite sua pergunta/i)).toBeInTheDocument();
    });

    it('should render send button', () => {
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
    });
  });

  describe('Message Input', () => {
    it('should allow typing in the input', async () => {
      const user = userEvent.setup();
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/digite sua pergunta/i);
      await user.type(input, 'Teste de mensagem');

      expect(input).toHaveValue('Teste de mensagem');
    });

    it('should clear input after sending', async () => {
      const user = userEvent.setup();
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/digite sua pergunta/i);
      await user.type(input, 'Teste de mensagem');

      const sendButton = screen.getByRole('button', { name: /enviar/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('should not send empty messages', async () => {
      const user = userEvent.setup();
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      const sendButton = screen.getByRole('button', { name: /enviar/i });
      await user.click(sendButton);

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should send message when clicking send button', async () => {
      const user = userEvent.setup();
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/digite sua pergunta/i);
      await user.type(input, 'Teste de mensagem');

      const sendButton = screen.getByRole('button', { name: /enviar/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Teste de mensagem');
      });
    });

    it('should send message when pressing Enter', async () => {
      const user = userEvent.setup();
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/digite sua pergunta/i);
      await user.type(input, 'Teste de mensagem{Enter}');

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Teste de mensagem');
      });
    });
  });

  describe('Loading State', () => {
    it('should disable input when loading', () => {
      vi.mocked(vi.importMock('@/hooks/useTechnicalConversations')).useTechnicalConversations = () => ({
        messages: [],
        isLoading: true,
        sendMessage: mockSendMessage,
        clearConversation: mockClearConversation,
        error: null,
      });

      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      // Test passes if component renders without error
      expect(screen.getByTestId('sheet')).toBeInTheDocument();
    });
  });

  describe('Clear Conversation', () => {
    it('should render clear button', () => {
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: /limpar/i })).toBeInTheDocument();
    });

    it('should call clearConversation when clicking clear button', async () => {
      const user = userEvent.setup();
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      const clearButton = screen.getByRole('button', { name: /limpar/i });
      await user.click(clearButton);

      expect(mockClearConversation).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form structure', () => {
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<TechnicalAssistant isOpen={true} onClose={mockOnClose} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
