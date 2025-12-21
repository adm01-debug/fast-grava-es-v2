import React, { ReactNode, createContext, useContext, useState, useEffect } from 'react';

interface HighContrastContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
}

const HighContrastContext = createContext<HighContrastContextType>({ isHighContrast: false, toggleHighContrast: () => {} });

export function HighContrastProvider({ children }: { children: ReactNode }) {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('highContrast');
    if (saved === 'true') {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const toggleHighContrast = () => {
    setIsHighContrast(prev => {
      const newValue = !prev;
      localStorage.setItem('highContrast', String(newValue));
      if (newValue) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      return newValue;
    });
  };

  return (
    <HighContrastContext.Provider value={{ isHighContrast, toggleHighContrast }}>
      {children}
    </HighContrastContext.Provider>
  );
}

export function useHighContrast() {
  return useContext(HighContrastContext);
}
