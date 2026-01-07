import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Feature flag types
interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  enabledForUsers?: string[];
  metadata?: Record<string, any>;
}

interface FeatureFlagsContextType {
  flags: Record<string, FeatureFlag>;
  isEnabled: (key: string) => boolean;
  setFlag: (key: string, enabled: boolean) => void;
  getAllFlags: () => FeatureFlag[];
  refresh: () => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);

// Default feature flags
const defaultFlags: Record<string, FeatureFlag> = {
  // UI Features
  'dark-mode': { key: 'dark-mode', enabled: true, description: 'Tema escuro' },
  'animations': { key: 'animations', enabled: true, description: 'Animações e transições' },
  'sound-notifications': { key: 'sound-notifications', enabled: true, description: 'Notificações sonoras' },
  
  // Beta Features
  'ai-assistant': { key: 'ai-assistant', enabled: false, description: 'Assistente IA', rolloutPercentage: 20 },
  'advanced-analytics': { key: 'advanced-analytics', enabled: false, description: 'Analytics avançado' },
  'predictive-maintenance': { key: 'predictive-maintenance', enabled: true, description: 'Manutenção preditiva' },
  
  // Experimental
  'new-dashboard': { key: 'new-dashboard', enabled: false, description: 'Novo dashboard (beta)' },
  'realtime-sync': { key: 'realtime-sync', enabled: true, description: 'Sincronização em tempo real' },
  'offline-mode': { key: 'offline-mode', enabled: false, description: 'Modo offline' },
  
  // Performance
  'lazy-loading': { key: 'lazy-loading', enabled: true, description: 'Carregamento lazy' },
  'virtual-lists': { key: 'virtual-lists', enabled: true, description: 'Listas virtualizadas' },
  'image-optimization': { key: 'image-optimization', enabled: true, description: 'Otimização de imagens' },
};

// Provider component
interface FeatureFlagsProviderProps {
  children: ReactNode;
  userId?: string;
  overrides?: Record<string, boolean>;
}

export function FeatureFlagsProvider({ 
  children, 
  userId,
  overrides = {} 
}: FeatureFlagsProviderProps) {
  const [storedFlags, setStoredFlags] = useLocalStorage<Record<string, FeatureFlag>>(
    'feature-flags',
    defaultFlags
  );
  
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>(() => {
    // Merge defaults with stored and overrides
    const merged = { ...defaultFlags };
    
    Object.keys(storedFlags).forEach((key) => {
      if (merged[key]) {
        merged[key] = { ...merged[key], ...storedFlags[key] };
      }
    });
    
    Object.keys(overrides).forEach((key) => {
      if (merged[key]) {
        merged[key].enabled = overrides[key];
      }
    });
    
    return merged;
  });

  // Check if flag is enabled for current user
  const isEnabled = useCallback((key: string): boolean => {
    const flag = flags[key];
    if (!flag) return false;
    
    // Check user-specific enablement
    if (userId && flag.enabledForUsers?.includes(userId)) {
      return true;
    }
    
    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const hash = hashString(userId || 'anonymous');
      const bucket = hash % 100;
      return bucket < flag.rolloutPercentage;
    }
    
    return flag.enabled;
  }, [flags, userId]);

  // Set a flag's enabled state
  const setFlag = useCallback((key: string, enabled: boolean) => {
    setFlags((prev) => {
      const updated = {
        ...prev,
        [key]: { ...prev[key], enabled },
      };
      setStoredFlags(updated);
      return updated;
    });
  }, [setStoredFlags]);

  // Get all flags
  const getAllFlags = useCallback(() => {
    return Object.values(flags);
  }, [flags]);

  // Refresh flags (could fetch from server)
  const refresh = useCallback(() => {
    // For now, just reset to defaults merged with stored
    setFlags({ ...defaultFlags, ...storedFlags });
  }, [storedFlags]);

  const value: FeatureFlagsContextType = {
    flags,
    isEnabled,
    setFlag,
    getAllFlags,
    refresh,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// Hook to use feature flags
export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}

// Hook for single flag
export function useFeatureFlag(key: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(key);
}

// Conditional render component
interface FeatureProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Feature({ flag, children, fallback = null }: FeatureProps) {
  const isEnabled = useFeatureFlag(flag);
  return <>{isEnabled ? children : fallback}</>;
}

// A/B Test component
interface ABTestProps {
  flag: string;
  control: ReactNode;
  variant: ReactNode;
}

export function ABTest({ flag, control, variant }: ABTestProps) {
  const isEnabled = useFeatureFlag(flag);
  return <>{isEnabled ? variant : control}</>;
}

// Helper function to hash string for rollout
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Feature flag admin panel hook
export function useFeatureFlagAdmin() {
  const { flags, setFlag, getAllFlags, refresh } = useFeatureFlags();

  const toggleFlag = (key: string) => {
    const flag = flags[key];
    if (flag) {
      setFlag(key, !flag.enabled);
    }
  };

  const resetToDefaults = () => {
    Object.keys(defaultFlags).forEach((key) => {
      setFlag(key, defaultFlags[key].enabled);
    });
  };

  const enableAll = () => {
    Object.keys(flags).forEach((key) => setFlag(key, true));
  };

  const disableAll = () => {
    Object.keys(flags).forEach((key) => setFlag(key, false));
  };

  return {
    flags: getAllFlags(),
    toggleFlag,
    resetToDefaults,
    enableAll,
    disableAll,
    refresh,
  };
}

// Utility to check multiple flags
export function useFeatureFlags2(...keys: string[]): boolean[] {
  const { isEnabled } = useFeatureFlags();
  return keys.map(isEnabled);
}

// Utility to get flag with metadata
export function useFeatureFlagWithMeta(key: string): FeatureFlag | null {
  const { flags } = useFeatureFlags();
  return flags[key] || null;
}
