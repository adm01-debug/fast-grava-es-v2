import * as React from "react";

interface LiveRegionContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const LiveRegionContext = React.createContext<LiveRegionContextType | null>(null);

export function useLiveAnnounce(): (message: string, priority?: 'polite' | 'assertive') => void {
  const context = React.useContext(LiveRegionContext);
  if (!context) {
    return () => {};
  }
  return context.announce;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps): JSX.Element {
  const [politeMessage, setPoliteMessage] = React.useState('');
  const [assertiveMessage, setAssertiveMessage] = React.useState('');
  const politeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const assertiveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      if (assertiveTimeoutRef.current) clearTimeout(assertiveTimeoutRef.current);
      setAssertiveMessage(message);
      assertiveTimeoutRef.current = setTimeout(() => setAssertiveMessage(''), 1000);
    } else {
      if (politeTimeoutRef.current) clearTimeout(politeTimeoutRef.current);
      setPoliteMessage(message);
      politeTimeoutRef.current = setTimeout(() => setPoliteMessage(''), 1000);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (politeTimeoutRef.current) clearTimeout(politeTimeoutRef.current);
      if (assertiveTimeoutRef.current) clearTimeout(assertiveTimeoutRef.current);
    };
  }, []);

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {politeMessage}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  );
}
