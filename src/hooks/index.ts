// Barrel exports for hooks

// Utils - from utils/index file
export { 
  useLocalStorage,
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
  useDebouncedState,
  useDebounceWithLoading,
  useSearchDebounce,
  useArray,
  useAsync,
  useClipboard,
  useCounter,
  useEventListener,
  useFetch,
  useForm,
  useFullscreen,
  useGeolocation,
  useInterval,
  useMap,
  useNetworkStatus as useNetworkStatusSimple,
  usePagination,
  usePrevious,
  useQueue,
  useScrollPosition,
  useSessionStorage,
  useSet,
  useTimeout,
  useToggle,
  useUndo,
  useValidation,
  useWindowSize,
} from '@/hooks/utils';

// Feature hooks
export * from '@/hooks/useFormAutosave.tsx';
export * from '@/hooks/useSessionTimeout';
export * from '@/hooks/useNetworkStatus';
export * from '@/hooks/usePerformance';
export * from '@/hooks/useFeatureFlags';
export * from '@/hooks/useI18nUtils';
