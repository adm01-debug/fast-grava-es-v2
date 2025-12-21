import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FeatureFlags {
  newDashboard: boolean;
  aiPredictions: boolean;
  darkMode: boolean;
  pushNotifications: boolean;
  offlineMode: boolean;
  advancedReports: boolean;
  bitrix24Integration: boolean;
}

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
  setFlag: (flag: keyof FeatureFlags, enabled: boolean) => void;
}

const defaultFlags: FeatureFlags = {
  newDashboard: true,
  aiPredictions: true,
  darkMode: true,
  pushNotifications: true,
  offlineMode: true,
  advancedReports: true,
  bitrix24Integration: true,
};

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);

  const isEnabled = (flag: keyof FeatureFlags) => flags[flag];

  const setFlag = (flag: keyof FeatureFlags, enabled: boolean) => {
    setFlags(prev => ({ ...prev, [flag]: enabled }));
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, isEnabled, setFlag }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  return context;
}
