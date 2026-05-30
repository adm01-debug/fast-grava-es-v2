import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

type FeatureFlags = Record<string, boolean>;

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  isEnabled: (flag: string) => boolean;
  setFlag: (flag: string, enabled: boolean) => void;
  setFlags: (flags: FeatureFlags) => void;
}

const defaultFlags: FeatureFlags = {
  gamification: true,
  mlPredictions: true,
  energyDashboard: true,
  spcDashboard: true,
  offlineMode: true,
  pushNotifications: true,
  voiceCommands: true,
  qrScanner: true,
};

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children, initial }: { children: ReactNode; initial?: FeatureFlags }) {
  const [flags, setFlagsState] = useState<FeatureFlags>({ ...defaultFlags, ...initial });

  const isEnabled = useCallback((flag: string) => flags[flag] ?? false, [flags]);

  const setFlag = useCallback((flag: string, enabled: boolean) => {
    setFlagsState((prev) => ({ ...prev, [flag]: enabled }));
  }, []);

  const setFlags = useCallback((newFlags: FeatureFlags) => {
    setFlagsState((prev) => ({ ...prev, ...newFlags }));
  }, []);

  const value = useMemo(
    () => ({ flags, isEnabled, setFlag, setFlags }),
    [flags, isEnabled, setFlag, setFlags],
  );

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  return ctx;
}
