// Array utility functions

// Chunk array into smaller arrays
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Group array by key
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

// Remove duplicates
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// Remove duplicates by key
export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Shuffle array (Fisher-Yates)
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Sample random elements
export function sample<T>(array: T[], count: number): T[] {
  return shuffle(array).slice(0, count);
}

// Get random element
export function randomElement<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

// Flatten nested arrays
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.flat() as T[];
}

// Deep flatten
export function flattenDeep<T>(array: unknown[]): T[] {
  return array.flat(Infinity) as T[];
}

// Partition array by predicate
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  
  array.forEach((item) => {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  });
  
  return [truthy, falsy];
}

// Zip arrays together
export function zip<T, U>(a: T[], b: U[]): [T, U][] {
  return a.map((item, i) => [item, b[i]]);
}

// Range generator
export function range(start: number, end?: number, step = 1): number[] {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  
  const result: number[] = [];
  for (let i = start; step > 0 ? i < end : i > end; i += step) {
    result.push(i);
  }
  return result;
}

// Move item in array
export function move<T>(array: T[], from: number, to: number): T[] {
  const result = [...array];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

// Insert item at index
export function insert<T>(array: T[], index: number, item: T): T[] {
  const result = [...array];
  result.splice(index, 0, item);
  return result;
}

// Remove item at index
export function removeAt<T>(array: T[], index: number): T[] {
  return array.filter((_, i) => i !== index);
}

// Update item at index
export function updateAt<T>(array: T[], index: number, item: T): T[] {
  return array.map((existing, i) => (i === index ? item : existing));
}

// Find and remove
export function removeItem<T>(array: T[], item: T): T[] {
  return array.filter((i) => i !== item);
}

// Count occurrences
export function countBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, number> {
  return array.reduce((counts, item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {} as Record<K, number>);
}

// Get first N items
export function take<T>(array: T[], count: number): T[] {
  return array.slice(0, count);
}

// Get last N items
export function takeLast<T>(array: T[], count: number): T[] {
  return array.slice(-count);
}

// Skip first N items
export function skip<T>(array: T[], count: number): T[] {
  return array.slice(count);
}

// Find index by predicate
export function findIndexBy<T>(
  array: T[],
  predicate: (item: T) => boolean
): number {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) return i;
  }
  return -1;
}

// Find last index by predicate
export function findLastIndex<T>(
  array: T[],
  predicate: (item: T) => boolean
): number {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) return i;
  }
  return -1;
}

// Interleave arrays
export function interleave<T>(...arrays: T[][]): T[] {
  const maxLength = Math.max(...arrays.map((a) => a.length));
  const result: T[] = [];
  
  for (let i = 0; i < maxLength; i++) {
    for (const array of arrays) {
      if (i < array.length) {
        result.push(array[i]);
      }
    }
  }
  
  return result;
}

// Difference between arrays
export function difference<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter((item) => !setB.has(item));
}

// Intersection of arrays
export function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
}

// Union of arrays
export function union<T>(...arrays: T[][]): T[] {
  return unique(arrays.flat());
}

// Sort by multiple keys
export function sortBy<T>(
  array: T[],
  ...keyFns: ((item: T) => string | number)[]
): T[] {
  return [...array].sort((a, b) => {
    for (const keyFn of keyFns) {
      const aVal = keyFn(a);
      const bVal = keyFn(b);
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

// Object to array of entries
export function toArray<T>(obj: Record<string, T>): { key: string; value: T }[] {
  return Object.entries(obj).map(([key, value]) => ({ key, value }));
}

// Array to object
export function toObject<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T> {
  return array.reduce((obj, item) => {
    obj[keyFn(item)] = item;
    return obj;
  }, {} as Record<K, T>);
}
