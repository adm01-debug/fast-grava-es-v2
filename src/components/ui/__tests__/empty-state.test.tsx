import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState, EmptyStates } from '../empty-state';

// Mock framer-motion to render without animations
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} data-testid={props['data-testid']}>{children}</div>,
    h3: ({ children, className }: any) => <h3 className={className}>{children}</h3>,
    p: ({ children, className }: any) => <p className={className}>{children}</p>,
    circle: (props: any) => <circle {...props} />,
    path: (props: any) => <path {...props} />,
    line: (props: any) => <line {...props} />,
    text: ({ children, ...props }: any) => <text {...props}>{children}</text>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('EmptyState Component', () => {
  // ===== VARIANT RENDERING =====
  describe('Variant rendering', () => {
    it('renders default variant with correct title and description', () => {
      render(<EmptyState />);
      expect(screen.getByText('Nada aqui ainda')).toBeInTheDocument();
      expect(screen.getByText('Comece adicionando seu primeiro item.')).toBeInTheDocument();
    });

    it('renders search variant', () => {
      render(<EmptyState variant="search" />);
      expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument();
      expect(screen.getByText('Tente ajustar os filtros ou termos de busca.')).toBeInTheDocument();
    });

    it('renders no-data variant', () => {
      render(<EmptyState variant="no-data" />);
      expect(screen.getByText('Sem dados disponíveis')).toBeInTheDocument();
    });

    it('renders no-results variant', () => {
      render(<EmptyState variant="no-results" />);
      expect(screen.getByText('Sem resultados')).toBeInTheDocument();
    });

    it('renders no-access variant', () => {
      render(<EmptyState variant="no-access" />);
      expect(screen.getByText('Acesso restrito')).toBeInTheDocument();
    });

    it('renders empty-folder variant', () => {
      render(<EmptyState variant="empty-folder" />);
      expect(screen.getByText('Pasta vazia')).toBeInTheDocument();
    });

    it('renders no-users variant', () => {
      render(<EmptyState variant="no-users" />);
      expect(screen.getByText('Nenhum usuário')).toBeInTheDocument();
    });

    it('renders no-events variant', () => {
      render(<EmptyState variant="no-events" />);
      expect(screen.getByText('Sem eventos')).toBeInTheDocument();
    });

    it('renders error variant with illustration', () => {
      render(<EmptyState variant="error" />);
      expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    });

    it('renders success variant with illustration', () => {
      render(<EmptyState variant="success" />);
      expect(screen.getByText('Tudo certo!')).toBeInTheDocument();
    });

    it('renders maintenance variant', () => {
      render(<EmptyState variant="maintenance" />);
      expect(screen.getByText('Nenhuma manutenção')).toBeInTheDocument();
    });

    it('renders analytics variant', () => {
      render(<EmptyState variant="analytics" />);
      expect(screen.getByText('Dados insuficientes')).toBeInTheDocument();
    });

    it('renders notifications variant', () => {
      render(<EmptyState variant="notifications" />);
      expect(screen.getByText('Tudo em dia!')).toBeInTheDocument();
    });

    it('renders settings variant', () => {
      render(<EmptyState variant="settings" />);
      expect(screen.getByText('Nenhuma configuração')).toBeInTheDocument();
    });

    it('renders security variant', () => {
      render(<EmptyState variant="security" />);
      expect(screen.getByText('Sem alertas')).toBeInTheDocument();
    });

    it('renders performance variant', () => {
      render(<EmptyState variant="performance" />);
      expect(screen.getByText('Sem dados de performance')).toBeInTheDocument();
    });
  });

  // ===== CUSTOM OVERRIDES =====
  describe('Custom props override defaults', () => {
    it('overrides title', () => {
      render(<EmptyState variant="default" title="Título Custom" />);
      expect(screen.getByText('Título Custom')).toBeInTheDocument();
      expect(screen.queryByText('Nada aqui ainda')).not.toBeInTheDocument();
    });

    it('overrides description', () => {
      render(<EmptyState variant="default" description="Descrição custom" />);
      expect(screen.getByText('Descrição custom')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      const { container } = render(<EmptyState className="my-custom-class" />);
      expect(container.firstChild).toHaveClass('my-custom-class');
    });
  });

  // ===== SIZES =====
  describe('Size variants', () => {
    it('renders sm size with py-8', () => {
      const { container } = render(<EmptyState size="sm" />);
      expect(container.firstChild).toHaveClass('py-8');
    });

    it('renders md size (default) with py-12', () => {
      const { container } = render(<EmptyState size="md" />);
      expect(container.firstChild).toHaveClass('py-12');
    });

    it('renders lg size with py-16', () => {
      const { container } = render(<EmptyState size="lg" />);
      expect(container.firstChild).toHaveClass('py-16');
    });
  });

  // ===== ACTIONS =====
  describe('Actions', () => {
    it('renders primary action button', () => {
      const onClick = vi.fn();
      render(
        <EmptyState
          action={{ label: 'Criar Novo', onClick }}
        />
      );
      const btn = screen.getByText('Criar Novo');
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders secondary action button', () => {
      const primaryClick = vi.fn();
      const secondaryClick = vi.fn();
      render(
        <EmptyState
          action={{ label: 'Primário', onClick: primaryClick }}
          secondaryAction={{ label: 'Secundário', onClick: secondaryClick }}
        />
      );
      expect(screen.getByText('Primário')).toBeInTheDocument();
      expect(screen.getByText('Secundário')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Secundário'));
      expect(secondaryClick).toHaveBeenCalledTimes(1);
    });

    it('does not render actions when none provided', () => {
      render(<EmptyState />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  // ===== ILLUSTRATION =====
  describe('Illustrations', () => {
    it('shows SVG illustration when enabled and variant has one', () => {
      const { container } = render(<EmptyState variant="search" illustration={true} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('hides illustration when disabled', () => {
      const { container } = render(<EmptyState variant="search" illustration={false} />);
      // Should render icon fallback inside a rounded-2xl div instead
      const iconContainer = container.querySelector('.rounded-2xl');
      expect(iconContainer).toBeInTheDocument();
    });
  });
});

// ===== PRESET EMPTY STATES =====
describe('EmptyStates Presets', () => {
  it('NoJobs renders correctly', () => {
    render(<EmptyStates.NoJobs />);
    expect(screen.getByText('Nenhuma ordem de produção')).toBeInTheDocument();
    expect(screen.getByText('Nova Ordem')).toBeInTheDocument();
  });

  it('NoOperators renders correctly', () => {
    render(<EmptyStates.NoOperators />);
    expect(screen.getByText('Nenhum operador cadastrado')).toBeInTheDocument();
    expect(screen.getByText('Adicionar Operador')).toBeInTheDocument();
  });

  it('NoSearchResults renders with query', () => {
    render(<EmptyStates.NoSearchResults query="teste" />);
    expect(screen.getByText(/Não encontramos resultados para "teste"/)).toBeInTheDocument();
  });

  it('NoNotifications renders correctly', () => {
    render(<EmptyStates.NoNotifications />);
    expect(screen.getByText('Tudo em dia!')).toBeInTheDocument();
  });

  it('NoMachines renders correctly', () => {
    render(<EmptyStates.NoMachines />);
    expect(screen.getByText('Nenhuma máquina cadastrada')).toBeInTheDocument();
    expect(screen.getByText('Adicionar Máquina')).toBeInTheDocument();
  });
});
