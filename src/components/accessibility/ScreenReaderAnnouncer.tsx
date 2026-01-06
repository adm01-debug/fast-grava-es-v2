import React, { createContext, useContext, useCallback, useRef, useEffect, ReactNode } from 'react';

// Types for announcements
type AnnouncementPriority = 'polite' | 'assertive';

interface Announcement {
  message: string;
  priority: AnnouncementPriority;
  id: string;
}

interface ScreenReaderContextType {
  announce: (message: string, priority?: AnnouncementPriority) => void;
  announcePolite: (message: string) => void;
  announceAssertive: (message: string) => void;
  clearAnnouncements: () => void;
}

const ScreenReaderContext = createContext<ScreenReaderContextType | null>(null);

// Provider component
export function ScreenReaderProvider({ children }: { children: ReactNode }) {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback((message: string, priority: AnnouncementPriority = 'polite') => {
    const container = priority === 'assertive' ? assertiveRef.current : politeRef.current;
    if (!container) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Clear and set new message (this triggers screen reader)
    container.textContent = '';
    
    // Use requestAnimationFrame to ensure the clear happens first
    requestAnimationFrame(() => {
      container.textContent = message;
    });

    // Clear after a delay
    timeoutRef.current = setTimeout(() => {
      container.textContent = '';
    }, 5000);
  }, []);

  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);

  const clearAnnouncements = useCallback(() => {
    if (politeRef.current) politeRef.current.textContent = '';
    if (assertiveRef.current) assertiveRef.current.textContent = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <ScreenReaderContext.Provider
      value={{ announce, announcePolite, announceAssertive, clearAnnouncements }}
    >
      {children}
      
      {/* Live regions for screen readers */}
      <div
        ref={politeRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
      <div
        ref={assertiveRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      />
    </ScreenReaderContext.Provider>
  );
}

// Hook to use screen reader announcements
export function useScreenReader() {
  const context = useContext(ScreenReaderContext);
  
  if (!context) {
    // Return no-op functions if not within provider
    return {
      announce: () => {},
      announcePolite: () => {},
      announceAssertive: () => {},
      clearAnnouncements: () => {},
    };
  }
  
  return context;
}

// Utility component for inline announcements
interface AnnounceProps {
  message: string;
  priority?: AnnouncementPriority;
  when?: boolean;
}

export function Announce({ message, priority = 'polite', when = true }: AnnounceProps) {
  const { announce } = useScreenReader();

  useEffect(() => {
    if (when && message) {
      announce(message, priority);
    }
  }, [when, message, priority, announce]);

  return null;
}

// Preset announcement messages for common actions
export const announcements = {
  // Loading states
  loading: 'Carregando...',
  loadingComplete: 'Carregamento concluído',
  
  // Form states
  formSubmitting: 'Enviando formulário...',
  formSuccess: 'Formulário enviado com sucesso',
  formError: 'Erro ao enviar formulário',
  validationError: (count: number) => `${count} ${count === 1 ? 'erro' : 'erros'} de validação encontrado${count === 1 ? '' : 's'}`,
  
  // Navigation
  pageChanged: (page: string) => `Navegou para ${page}`,
  modalOpened: (title: string) => `Modal ${title} aberto`,
  modalClosed: 'Modal fechado',
  menuOpened: 'Menu aberto',
  menuClosed: 'Menu fechado',
  
  // Actions
  itemAdded: (item: string) => `${item} adicionado`,
  itemRemoved: (item: string) => `${item} removido`,
  itemUpdated: (item: string) => `${item} atualizado`,
  itemSelected: (item: string) => `${item} selecionado`,
  itemDeselected: (item: string) => `${item} desmarcado`,
  
  // Lists
  listUpdated: (count: number) => `Lista atualizada com ${count} ${count === 1 ? 'item' : 'itens'}`,
  noResults: 'Nenhum resultado encontrado',
  resultsFound: (count: number) => `${count} ${count === 1 ? 'resultado encontrado' : 'resultados encontrados'}`,
  
  // Filters/Search
  filterApplied: 'Filtro aplicado',
  filterCleared: 'Filtro removido',
  searchResults: (count: number, query: string) => 
    `${count} ${count === 1 ? 'resultado' : 'resultados'} para "${query}"`,
  
  // Progress
  progress: (percent: number) => `Progresso: ${percent}%`,
  uploadProgress: (percent: number) => `Upload: ${percent}%`,
  
  // Notifications
  newNotification: 'Nova notificação recebida',
  notificationsCleared: 'Notificações limpas',
  
  // Errors
  errorOccurred: 'Ocorreu um erro',
  networkError: 'Erro de conexão',
  sessionExpired: 'Sessão expirada',
  
  // Success
  actionComplete: 'Ação concluída com sucesso',
  saved: 'Salvo com sucesso',
  copied: 'Copiado para a área de transferência',
  
  // Jobs specific
  jobStarted: (order: string) => `Job ${order} iniciado`,
  jobCompleted: (order: string) => `Job ${order} concluído`,
  jobPaused: (order: string) => `Job ${order} pausado`,
  
  // Operators
  operatorLoggedIn: (name: string) => `Operador ${name} logado`,
  operatorLoggedOut: (name: string) => `Operador ${name} deslogado`,
};

// Higher-order hook for common patterns
export function useAnnouncedAction<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  options: {
    loadingMessage?: string;
    successMessage?: string | ((result: R) => string);
    errorMessage?: string | ((error: unknown) => string);
  } = {}
) {
  const { announce } = useScreenReader();
  const {
    loadingMessage = announcements.loading,
    successMessage = announcements.actionComplete,
    errorMessage = announcements.errorOccurred,
  } = options;

  return useCallback(
    async (...args: T): Promise<R> => {
      announce(loadingMessage, 'polite');
      
      try {
        const result = await action(...args);
        const message = typeof successMessage === 'function' 
          ? successMessage(result) 
          : successMessage;
        announce(message, 'polite');
        return result;
      } catch (error) {
        const message = typeof errorMessage === 'function'
          ? errorMessage(error)
          : errorMessage;
        announce(message, 'assertive');
        throw error;
      }
    },
    [action, announce, loadingMessage, successMessage, errorMessage]
  );
}

// Visually hidden but accessible text
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

// Accessible icon wrapper
interface AccessibleIconProps {
  icon: React.ElementType;
  label: string;
  className?: string;
}

export function AccessibleIcon({ icon: Icon, label, className }: AccessibleIconProps) {
  return (
    <>
      <Icon className={className} aria-hidden="true" />
      <VisuallyHidden>{label}</VisuallyHidden>
    </>
  );
}
