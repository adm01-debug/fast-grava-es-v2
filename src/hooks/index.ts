// Barrel exports for hooks

// Utils - from index file
export { 
  useSessionStorage,
  useDebounce,
  useClipboard,
  useFullscreen,
  useNetworkStatus as useNetworkStatusSimple,
  usePrevious,
  useInterval,
  useTimeout,
  useWindowSize,
  useScrollPosition,
  useEventListener,
  useFetch,
  useAsync,
  useToggle,
  useCounter,
  useArray,
  useMap,
  useSet,
  useQueue,
  useUndo,
  useForm,
  useValidation,
  usePagination,
  useGeolocation,
} from '@/hooks/utils';

// Standalone hooks
export { useLocalStorage } from '@/hooks/useLocalStorage';

// Feature hooks
export * from '@/hooks/useFormAutosave';
export * from '@/hooks/useSessionTimeout';
export * from '@/hooks/useNetworkStatus';
export * from '@/hooks/usePerformance';
export * from '@/hooks/useFeatureFlags';
export * from '@/hooks/useI18nUtils';
