/**
 * Cache Manager - In-memory caching with TTL
 * 
 * @module hooks/cacheManager
 * @description Simple in-memory cache manager with automatic expiration
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTTL),
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

export const cacheManager = new CacheManager();

/**
 * Wrapper function to cache async operations
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000
): Promise<T> {
  // Check cache first
  const cached = cacheManager.get<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // Execute function and cache result
  const result = await fn();
  cacheManager.set(key, result, ttlMs);
  
  return result;
}

/**
 * Create a cached version of an async function
 */
export function createCachedFunction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyGenerator: (...args: TArgs) => string,
  ttlMs: number = 5 * 60 * 1000
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const key = keyGenerator(...args);
    return withCache(key, () => fn(...args), ttlMs);
  };
}

export default cacheManager;
