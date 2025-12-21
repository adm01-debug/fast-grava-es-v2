import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssistantButton } from './AssistantButton';

// Mock TechnicalAssistant component
vi.mock('./TechnicalAssistant', () => ({
  TechnicalAssistant: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? (
      <div data-testid="technical-assistant" role="dialog">
        <button onClick={onClose} data-testid="close-assistant">Close</button>
      </div>
    ) : null
  ),
}));

describe('AssistantButton', () => {
  describe('Rendering', () => {
    it('should render the floating button', () => {
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render with correct positioning classes', () => {
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('fixed');
      expect(button).toHaveClass('bottom-6');
      expect(button).toHaveClass('right-6');
    });

    it('should render with rounded full style', () => {
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-full');
    });

    it('should render with z-index for overlay', () => {
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('z-40');
    });

    it('should render Bot icon', () => {
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should not render TechnicalAssistant initially', () => {
      render(<AssistantButton />);

      expect(screen.queryByTestId('technical-assistant')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should open TechnicalAssistant when clicked', async () => {
      const user = userEvent.setup();
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('technical-assistant')).toBeInTheDocument();
      });
    });

    it('should close TechnicalAssistant when onClose is called', async () => {
      const user = userEvent.setup();
      render(<AssistantButton />);

      // Open assistant
      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByTestId('technical-assistant')).toBeInTheDocument();

      // Close assistant
      const closeButton = screen.getByTestId('close-assistant');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('technical-assistant')).not.toBeInTheDocument();
      });
    });

    it('should toggle assistant visibility correctly', async () => {
      const user = userEvent.setup();
      render(<AssistantButton />);

      const button = screen.getByRole('button');

      // Open
      await user.click(button);
      expect(screen.getByTestId('technical-assistant')).toBeInTheDocument();

      // Close
      const closeButton = screen.getByTestId('close-assistant');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('technical-assistant')).not.toBeInTheDocument();
      });

      // Open again
      await user.click(button);
      expect(screen.getByTestId('technical-assistant')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByText('Assistente Técnico IA')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      const user = userEvent.setup();
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByText('Assistente Técnico IA')).toBeInTheDocument();
      });

      await user.unhover(button);

      await waitFor(() => {
        expect(screen.queryByText('Assistente Técnico IA')).not.toBeInTheDocument();
      });
    });
  });

  describe('Styling', () => {
    it('should have gradient background', () => {
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-to-br');
      expect(button).toHaveClass('from-primary');
      expect(button).toHaveClass('to-purple-600');
    });

    it('should have shadow', () => {
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('shadow-lg');
    });

    it('should have correct size', () => {
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-14');
      expect(button).toHaveClass('w-14');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByTestId('technical-assistant')).toBeInTheDocument();
      });
    });

    it('should be focusable', () => {
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });

    it('should open dialog when space is pressed', async () => {
      const user = userEvent.setup();
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByTestId('technical-assistant')).toBeInTheDocument();
      });
    });
  });

  describe('State Management', () => {
    it('should start with closed state', () => {
      render(<AssistantButton />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should pass isOpen prop correctly to TechnicalAssistant', async () => {
      const user = userEvent.setup();
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      await user.click(button);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should pass onClose prop correctly to TechnicalAssistant', async () => {
      const user = userEvent.setup();
      render(<AssistantButton />);

      const button = screen.getByRole('button');
      await user.click(button);

      const closeButton = screen.getByTestId('close-assistant');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
