// ============= LIVE REGION - ACCESSIBILITY ANNOUNCEMENTS =============

import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

// ============= TYPES =============

type Politeness = 'polite' | 'assertive' | 'off';

interface Announcement {
  id: string;
  message: string;
  politeness: Politeness;
}

interface LiveRegionContextType {
  announce: (message: string, politeness?: Politeness) => void;
  announcePolite: (message: string) => void;
  announceAssertive: (message: string) => void;
}

// ============= CONTEXT =============

const LiveRegionContext = createContext<LiveRegionContextType | null>(null);

export function useLiveAnnouncer() {
  const context = useContext(LiveRegionContext);
  if (!context) {
    throw new Error('useLiveAnnouncer must be used within LiveRegionProvider');
  }
  return context;
}

// ============= PROVIDER =============

interface LiveRegionProviderProps {
  children: React.ReactNode;
}

export function LiveRegionProvider({ children }: LiveRegionProviderProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const announce = useCallback((message: string, politeness: Politeness = 'polite') => {
    const id = `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setAnnouncements(prev => [...prev, { id, message, politeness }]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  }, []);

  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);

  return (
    <LiveRegionContext.Provider value={{ announce, announcePolite, announceAssertive }}>
      {children}
      
      {/* Polite Live Region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter(a => a.politeness === 'polite')
          .map(a => (
            <span key={a.id}>{a.message}</span>
          ))}
      </div>
      
      {/* Assertive Live Region */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter(a => a.politeness === 'assertive')
          .map(a => (
            <span key={a.id}>{a.message}</span>
          ))}
      </div>
    </LiveRegionContext.Provider>
  );
}

// ============= STANDALONE LIVE REGION =============

interface LiveRegionProps {
  message?: string;
  politeness?: Politeness;
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
  children?: React.ReactNode;
}

export function LiveRegion({
  message,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions',
  className,
  children,
}: LiveRegionProps) {
  return (
    <div
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn('sr-only', className)}
    >
      {message || children}
    </div>
  );
}

// ============= STATUS ANNOUNCER =============

interface StatusAnnouncerProps {
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  loadingMessage?: string;
}

export function StatusAnnouncer({
  loading,
  error,
  success,
  loadingMessage = 'Carregando...',
}: StatusAnnouncerProps) {
  const [announcement, setAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    if (loading) {
      setAnnouncement(loadingMessage);
    } else if (error) {
      setAnnouncement(`Erro: ${error}`);
    } else if (success) {
      setAnnouncement(success);
    } else {
      setAnnouncement(null);
    }
  }, [loading, error, success, loadingMessage]);

  if (!announcement) return null;

  return (
    <LiveRegion
      message={announcement}
      politeness={error ? 'assertive' : 'polite'}
    />
  );
}

// ============= ROUTE ANNOUNCER =============

interface RouteAnnouncerProps {
  title: string;
  prefix?: string;
}

export function RouteAnnouncer({ title, prefix = 'Navegou para' }: RouteAnnouncerProps) {
  const [announced, setAnnounced] = useState(false);

  useEffect(() => {
    setAnnounced(false);
    const timer = setTimeout(() => setAnnounced(true), 100);
    return () => clearTimeout(timer);
  }, [title]);

  if (!announced) return null;

  return (
    <LiveRegion
      message={`${prefix}: ${title}`}
      politeness="polite"
    />
  );
}

// ============= FORM ERROR ANNOUNCER =============

interface FormErrorAnnouncerProps {
  errors: Record<string, string | undefined>;
  fieldLabels?: Record<string, string>;
}

export function FormErrorAnnouncer({ errors, fieldLabels = {} }: FormErrorAnnouncerProps) {
  const [announcement, setAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    const errorEntries = Object.entries(errors).filter(([_, value]) => value);
    
    if (errorEntries.length > 0) {
      const errorMessages = errorEntries.map(([field, message]) => {
        const label = fieldLabels[field] || field;
        return `${label}: ${message}`;
      });
      
      setAnnouncement(`Erros no formulário: ${errorMessages.join('. ')}`);
    } else {
      setAnnouncement(null);
    }
  }, [errors, fieldLabels]);

  if (!announcement) return null;

  return (
    <LiveRegion
      message={announcement}
      politeness="assertive"
    />
  );
}

// ============= EXPORTS =============

export default {
  LiveRegion,
  LiveRegionProvider,
  useLiveAnnouncer,
  StatusAnnouncer,
  RouteAnnouncer,
  FormErrorAnnouncer,
};
