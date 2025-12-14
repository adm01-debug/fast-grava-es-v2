import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { defaultQueryOptions, calculateRetryDelay, RETRY_CONFIG } from '@/lib/queryConfig';
import { createAppError, showErrorToast, type AppError } from '@/lib/errorHandling';

interface UseRetryableQueryOptions<TData> extends Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'> {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  showErrorToast?: boolean;
  customErrorMessage?: string;
  onRetry?: (attemptIndex: number, error: Error) => void;
  onMaxRetriesReached?: (error: AppError) => void;
}

/**
 * Enhanced useQuery hook with built-in retry mechanisms, error handling, and manual retry support
 */
export function useRetryableQuery<TData>({
  queryKey,
  queryFn,
  showErrorToast: showToast = false,
  customErrorMessage,
  onRetry,
  onMaxRetriesReached,
  ...options
}: UseRetryableQueryOptions<TData>) {
  const [manualRetryCount, setManualRetryCount] = useState(0);
  const [lastError, setLastError] = useState<AppError | null>(null);

  const query = useQuery({
    queryKey: [...queryKey, manualRetryCount], // Include manual retry in key to force refetch
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        const appError = createAppError(error);
        setLastError(appError);
        
        if (showToast) {
          showErrorToast(error, customErrorMessage);
        }
        
        throw error;
      }
    },
    ...defaultQueryOptions,
    retry: (failureCount, error) => {
      const shouldRetry = defaultQueryOptions.retry(failureCount, error);
      
      if (shouldRetry && onRetry) {
        onRetry(failureCount, error as Error);
      }
      
      if (!shouldRetry && failureCount >= RETRY_CONFIG.maxRetries && onMaxRetriesReached) {
        onMaxRetriesReached(createAppError(error));
      }
      
      return shouldRetry;
    },
    retryDelay: calculateRetryDelay,
    ...options,
  });

  // Manual retry that bypasses the automatic retry logic
  const manualRetry = useCallback(() => {
    setLastError(null);
    setManualRetryCount(c => c + 1);
  }, []);

  // Force refetch with error clearing
  const forceRefetch = useCallback(async () => {
    setLastError(null);
    return query.refetch();
  }, [query]);

  return {
    ...query,
    // Enhanced error info
    appError: query.error ? createAppError(query.error) : lastError,
    isRetryable: lastError?.retryable ?? false,
    
    // Manual controls
    manualRetry,
    forceRefetch,
    manualRetryCount,
    
    // Convenience flags
    isNetworkError: lastError?.code === 'NETWORK_ERROR',
    isAuthError: lastError?.code === 'UNAUTHORIZED' || lastError?.code === 'SESSION_EXPIRED',
  };
}

/**
 * Hook for handling mutation retries with exponential backoff
 */
export function useRetryableMutation() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = useCallback(async <T>(
    fn: () => Promise<T>,
    options?: {
      maxRetries?: number;
      onRetry?: (attempt: number, error: Error) => void;
      shouldRetry?: (error: unknown) => boolean;
    }
  ): Promise<T> => {
    const maxRetries = options?.maxRetries ?? RETRY_CONFIG.maxRetries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        if (attempt > 0) {
          setIsRetrying(true);
        }
        
        const result = await fn();
        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        const shouldRetry = options?.shouldRetry 
          ? options.shouldRetry(error) 
          : defaultQueryOptions.retry(attempt, error);
        
        if (!shouldRetry || attempt >= maxRetries) {
          setIsRetrying(false);
          setRetryCount(0);
          throw lastError;
        }
        
        if (options?.onRetry) {
          options.onRetry(attempt + 1, lastError);
        }
        
        // Wait before retrying
        const delay = calculateRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }, []);

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
  };
}
