import { createContext, useContext, ReactNode } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

interface ThemeContextType {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  resolvedTheme: string | undefined;
  systemTheme: string | undefined;
  themes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const nextTheme = useNextTheme();

  const value: ThemeContextType = {
    theme: nextTheme.theme,
    setTheme: nextTheme.setTheme,
    resolvedTheme: nextTheme.resolvedTheme,
    systemTheme: nextTheme.systemTheme,
    themes: nextTheme.themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeContextProvider');
  return ctx;
}
