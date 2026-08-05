import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  CalendarZoomLevel,
  CalendarGroupBy,
  CalendarOverlays,
  EMPTY_OVERLAYS,
} from '@/components/calendar/types';

interface CalendarPreferences {
  zoom: CalendarZoomLevel;
  groupBy: CalendarGroupBy;
  overlays: CalendarOverlays;
  onboardingDone: boolean;
}

const DEFAULT_PREFS: CalendarPreferences = {
  zoom: 60,
  groupBy: 'machine',
  overlays: EMPTY_OVERLAYS,
  onboardingDone: false,
};

/**
 * Persistent calendar UI preferences (zoom, grouping, overlays, onboarding).
 */
export function useCalendarPreferences(scope = 'global') {
  const [prefs, setPrefs] = useLocalStorage<CalendarPreferences>(
    `calendar-prefs-${scope}-v1`,
    DEFAULT_PREFS
  );

  const setZoom = useCallback(
    (zoom: CalendarZoomLevel) => setPrefs((p) => ({ ...p, zoom })),
    [setPrefs]
  );

  const setGroupBy = useCallback(
    (groupBy: CalendarGroupBy) => setPrefs((p) => ({ ...p, groupBy })),
    [setPrefs]
  );

  const toggleOverlay = useCallback(
    (key: keyof CalendarOverlays) =>
      setPrefs((p) => ({ ...p, overlays: { ...p.overlays, [key]: !p.overlays[key] } })),
    [setPrefs]
  );

  const completeOnboarding = useCallback(
    () => setPrefs((p) => ({ ...p, onboardingDone: true })),
    [setPrefs]
  );

  const resetOnboarding = useCallback(
    () => setPrefs((p) => ({ ...p, onboardingDone: false })),
    [setPrefs]
  );

  return {
    prefs,
    setZoom,
    setGroupBy,
    toggleOverlay,
    completeOnboarding,
    resetOnboarding,
  };
}
