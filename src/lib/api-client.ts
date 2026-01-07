import { supabase } from '@/integrations/supabase/client';

// Generic API response type
interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

// Request options
interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Default options
const defaultOptions: RequestOptions = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

// API client class
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Set auth token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Clear auth token
  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  // Generic request method with retry logic
  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const opts = { ...defaultOptions, ...options };
    const url = `${this.baseUrl}${endpoint}`;
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= (opts.retries || 0); attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

        const response = await fetch(url, {
          method,
          headers: { ...this.defaultHeaders, ...opts.headers },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < (opts.retries || 0)) {
          await new Promise(resolve => setTimeout(resolve, opts.retryDelay));
        }
      }
    }

    return { data: null, error: lastError, status: 0 };
  }

  // HTTP methods
  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  post<T>(endpoint: string, body: unknown, options?: RequestOptions) {
    return this.request<T>('POST', endpoint, body, options);
  }

  put<T>(endpoint: string, body: unknown, options?: RequestOptions) {
    return this.request<T>('PUT', endpoint, body, options);
  }

  patch<T>(endpoint: string, body: unknown, options?: RequestOptions) {
    return this.request<T>('PATCH', endpoint, body, options);
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }
}

// Create default client instance
export const apiClient = new ApiClient();

// Supabase Edge Function caller
export async function callEdgeFunction<T>(
  functionName: string,
  payload?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });

    if (error) {
      return { data: null, error: new Error(error.message), status: 500 };
    }

    return { data: data as T, error: null, status: 200 };
  } catch (error) {
    return { data: null, error: error as Error, status: 0 };
  }
}

// Query builder helpers - simplified version
export async function queryTable(
  table: string,
  options: {
    select?: string;
    filters?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  } = {}
) {
  let query = supabase.from(table as any).select(options.select || '*');

  if (options.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true,
    });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  return query;
}

// Batch operations helper
export async function batchOperation<T>(
  items: T[],
  operation: (item: T) => Promise<void>,
  batchSize = 10
): Promise<{ success: number; failed: number; errors: Error[] }> {
  const results = { success: 0, failed: 0, errors: [] as Error[] };

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (item) => {
        try {
          await operation(item);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(error as Error);
        }
      })
    );
  }

  return results;
}

// Retry helper
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError!;
}

// Debounced API call
export function createDebouncedApi<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  delay = 300
) {
  let timeoutId: NodeJS.Timeout;

  return (...args: Args): Promise<T> => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}
