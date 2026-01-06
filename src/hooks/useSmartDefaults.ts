import { useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Types for smart defaults
interface UserPreferences {
  lastUsedClient?: string;
  lastUsedTechnique?: string;
  lastUsedMachine?: string;
  lastUsedPriority?: string;
  defaultQuantity?: number;
  preferredDateFormat?: string;
  recentClients: string[];
  recentProducts: string[];
  recentTechniques: string[];
  frequentValues: Record<string, Record<string, number>>;
}

interface SmartSuggestion<T> {
  value: T;
  confidence: number;
  reason: string;
  source: 'recent' | 'frequent' | 'pattern' | 'default';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  recentClients: [],
  recentProducts: [],
  recentTechniques: [],
  frequentValues: {},
};

const MAX_RECENT_ITEMS = 10;

export function useSmartDefaults() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'smart-defaults-preferences',
    DEFAULT_PREFERENCES
  );

  // Track usage of a field value
  const trackUsage = useCallback((field: string, value: string) => {
    setPreferences(prev => {
      const frequentValues = { ...prev.frequentValues };
      if (!frequentValues[field]) {
        frequentValues[field] = {};
      }
      frequentValues[field][value] = (frequentValues[field][value] || 0) + 1;

      // Update recent lists based on field type
      let recentClients = [...prev.recentClients];
      let recentProducts = [...prev.recentProducts];
      let recentTechniques = [...prev.recentTechniques];

      if (field === 'client') {
        recentClients = [value, ...recentClients.filter(c => c !== value)].slice(0, MAX_RECENT_ITEMS);
      } else if (field === 'product') {
        recentProducts = [value, ...recentProducts.filter(p => p !== value)].slice(0, MAX_RECENT_ITEMS);
      } else if (field === 'technique') {
        recentTechniques = [value, ...recentTechniques.filter(t => t !== value)].slice(0, MAX_RECENT_ITEMS);
      }

      return {
        ...prev,
        frequentValues,
        recentClients,
        recentProducts,
        recentTechniques,
        [`lastUsed${field.charAt(0).toUpperCase() + field.slice(1)}`]: value,
      };
    });
  }, [setPreferences]);

  // Get smart suggestions for a field
  const getSuggestions = useCallback(<T extends string>(
    field: string,
    availableValues: T[],
    context?: Record<string, unknown>
  ): SmartSuggestion<T>[] => {
    const suggestions: SmartSuggestion<T>[] = [];
    const fieldFrequency = preferences.frequentValues[field] || {};
    
    // Get the most frequent values
    const sortedByFrequency = Object.entries(fieldFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Add frequent suggestions
    sortedByFrequency.forEach(([value, count], index) => {
      if (availableValues.includes(value as T)) {
        suggestions.push({
          value: value as T,
          confidence: Math.min(0.9, 0.5 + (count / 10) * 0.1),
          reason: `Usado ${count} vezes`,
          source: 'frequent',
        });
      }
    });

    // Add recent suggestions
    const recentField = field === 'client' ? 'recentClients' 
      : field === 'product' ? 'recentProducts' 
      : field === 'technique' ? 'recentTechniques' 
      : null;

    if (recentField && preferences[recentField]) {
      (preferences[recentField] as string[]).slice(0, 3).forEach((value, index) => {
        if (availableValues.includes(value as T) && !suggestions.find(s => s.value === value)) {
          suggestions.push({
            value: value as T,
            confidence: 0.7 - (index * 0.1),
            reason: 'Usado recentemente',
            source: 'recent',
          });
        }
      });
    }

    // Sort by confidence
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }, [preferences]);

  // Get the best default value for a field
  const getDefaultValue = useCallback(<T extends string>(
    field: string,
    availableValues: T[],
    fallback?: T
  ): T | undefined => {
    const suggestions = getSuggestions(field, availableValues);
    if (suggestions.length > 0 && suggestions[0].confidence > 0.5) {
      return suggestions[0].value;
    }
    return fallback;
  }, [getSuggestions]);

  // Auto-fill form based on patterns
  const getAutoFillSuggestions = useCallback((
    formType: 'job' | 'maintenance' | 'lot',
    partialData: Record<string, unknown>
  ): Record<string, SmartSuggestion<string>> => {
    const suggestions: Record<string, SmartSuggestion<string>> = {};

    if (formType === 'job') {
      // If client is selected, suggest their most common technique
      if (partialData.client) {
        const clientTechniqueKey = `${partialData.client}_technique`;
        const clientFrequency = preferences.frequentValues[clientTechniqueKey] || {};
        const topTechnique = Object.entries(clientFrequency)
          .sort(([, a], [, b]) => b - a)[0];
        
        if (topTechnique) {
          suggestions.technique = {
            value: topTechnique[0],
            confidence: 0.8,
            reason: `Técnica mais usada para ${partialData.client}`,
            source: 'pattern',
          };
        }
      }

      // Suggest default priority based on time of day
      const hour = new Date().getHours();
      if (hour < 12) {
        suggestions.priority = {
          value: 'normal',
          confidence: 0.6,
          reason: 'Padrão para manhã',
          source: 'pattern',
        };
      } else if (hour >= 17) {
        suggestions.priority = {
          value: 'high',
          confidence: 0.6,
          reason: 'Fim do dia - prioridade maior',
          source: 'pattern',
        };
      }

      // Suggest default quantity based on past patterns
      if (preferences.defaultQuantity) {
        suggestions.quantity = {
          value: String(preferences.defaultQuantity),
          confidence: 0.5,
          reason: 'Quantidade padrão',
          source: 'default',
        };
      }
    }

    return suggestions;
  }, [preferences]);

  // Reset preferences
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, [setPreferences]);

  return {
    preferences,
    trackUsage,
    getSuggestions,
    getDefaultValue,
    getAutoFillSuggestions,
    resetPreferences,
  };
}

// Hook for smart form field with auto-suggestions
export function useSmartFormField<T extends string>(
  fieldName: string,
  availableValues: T[],
  options?: {
    trackOnChange?: boolean;
    showTopSuggestions?: number;
  }
) {
  const { trackUsage, getSuggestions, getDefaultValue } = useSmartDefaults();
  const { trackOnChange = true, showTopSuggestions = 3 } = options || {};

  const suggestions = useMemo(() => 
    getSuggestions(fieldName, availableValues).slice(0, showTopSuggestions),
    [fieldName, availableValues, getSuggestions, showTopSuggestions]
  );

  const defaultValue = useMemo(() => 
    getDefaultValue(fieldName, availableValues),
    [fieldName, availableValues, getDefaultValue]
  );

  const handleChange = useCallback((value: T) => {
    if (trackOnChange) {
      trackUsage(fieldName, value);
    }
  }, [fieldName, trackOnChange, trackUsage]);

  return {
    suggestions,
    defaultValue,
    onValueChange: handleChange,
  };
}

// Component wrapper for smart inputs
export function useSmartInput(fieldName: string) {
  const { trackUsage, preferences } = useSmartDefaults();

  const lastUsedValue = useMemo(() => {
    const key = `lastUsed${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}` as keyof UserPreferences;
    return preferences[key] as string | undefined;
  }, [fieldName, preferences]);

  const handleBlur = useCallback((value: string) => {
    if (value) {
      trackUsage(fieldName, value);
    }
  }, [fieldName, trackUsage]);

  return {
    lastUsedValue,
    onBlur: handleBlur,
  };
}
