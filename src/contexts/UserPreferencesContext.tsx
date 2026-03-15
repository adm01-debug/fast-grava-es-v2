import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface UserPreferences {
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  dashboardLayout: string[];
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  compactMode: boolean;
}

const defaultPreferences: UserPreferences = {
  language: 'pt-BR',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: '24h',
  dashboardLayout: [],
  notificationsEnabled: true,
  soundEnabled: true,
  compactMode: false,
};

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resetPreferences: () => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem('user-preferences');
      return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  const updatePreference = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem('user-preferences', JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    try { localStorage.removeItem('user-preferences'); } catch { /* noop */ }
  }, []);

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreference, resetPreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  return ctx;
}
