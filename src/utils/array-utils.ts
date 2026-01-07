// Utilitários avançados para manipulação de arrays

// Agrupar array por chave
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

// Ordenar por múltiplas chaves
export function sortBy<T>(
  array: T[],
  ...keys: (keyof T | ((item: T) => unknown))[]
): T[] {
  return [...array].sort((a, b) => {
    for (const key of keys) {
      const aVal = typeof key === 'function' ? key(a) : a[key];
      const bVal = typeof key === 'function' ? key(b) : b[key];
      
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

// Ordenar com direção
export function sortByWithDirection<T>(
  array: T[],
  key: keyof T | ((item: T) => unknown),
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  const sorted = sortBy(array, key);
  return direction === 'desc' ? sorted.reverse() : sorted;
}

// Remover duplicatas por chave
export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Dividir array em chunks
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Achatar array aninhado
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((acc, item) => {
    if (Array.isArray(item)) {
      return [...acc, ...flatten(item)];
    }
    return [...acc, item];
  }, []);
}

// Achatar profundamente
export function flattenDeep(array: unknown[]): unknown[] {
  const result: unknown[] = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      result.push(...flattenDeep(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

// Interseção de arrays
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  return arrays.reduce((acc, array) => acc.filter(item => array.includes(item)));
}

// Diferença de arrays
export function difference<T>(array: T[], ...excludeArrays: T[][]): T[] {
  const excludeSet = new Set(excludeArrays.flat());
  return array.filter(item => !excludeSet.has(item));
}

// União de arrays (sem duplicatas)
export function union<T>(...arrays: T[][]): T[] {
  return [...new Set(arrays.flat())];
}

// Encontrar por chave
export function findBy<T>(
  array: T[],
  key: keyof T,
  value: unknown
): T | undefined {
  return array.find(item => item[key] === value);
}

// Encontrar índice por chave
export function findIndexBy<T>(
  array: T[],
  key: keyof T,
  value: unknown
): number {
  return array.findIndex(item => item[key] === value);
}

// Filtrar por múltiplos critérios
export function filterBy<T>(
  array: T[],
  criteria: Partial<T>
): T[] {
  return array.filter(item =>
    Object.entries(criteria).every(([key, value]) => item[key as keyof T] === value)
  );
}

// Contar ocorrências
export function countBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, number> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<K, number>);
}

// Somar por chave
export function sumBy<T>(array: T[], keyFn: (item: T) => number): number {
  return array.reduce((sum, item) => sum + keyFn(item), 0);
}

// Média por chave
export function averageBy<T>(array: T[], keyFn: (item: T) => number): number {
  if (array.length === 0) return 0;
  return sumBy(array, keyFn) / array.length;
}

// Mínimo/Máximo por chave
export function minBy<T>(array: T[], keyFn: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;
  return array.reduce((min, item) => keyFn(item) < keyFn(min) ? item : min);
}

export function maxBy<T>(array: T[], keyFn: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;
  return array.reduce((max, item) => keyFn(item) > keyFn(max) ? item : max);
}

// Embaralhar array
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Amostra aleatória
export function sample<T>(array: T[], count: number = 1): T[] {
  return shuffle(array).slice(0, count);
}

// Primeiro/Último N elementos
export function first<T>(array: T[], count: number = 1): T[] {
  return array.slice(0, count);
}

export function last<T>(array: T[], count: number = 1): T[] {
  return array.slice(-count);
}

// Particionar por condição
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  
  for (const item of array) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  
  return [truthy, falsy];
}

// Zip arrays
export function zip<T, U>(array1: T[], array2: U[]): [T, U][] {
  const length = Math.min(array1.length, array2.length);
  const result: [T, U][] = [];
  
  for (let i = 0; i < length; i++) {
    result.push([array1[i], array2[i]]);
  }
  
  return result;
}

// Unzip array de tuplas
export function unzip<T, U>(array: [T, U][]): [T[], U[]] {
  return array.reduce<[T[], U[]]>(
    (acc, [a, b]) => {
      acc[0].push(a);
      acc[1].push(b);
      return acc;
    },
    [[], []]
  );
}

// Mover item no array
export function moveItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array];
  const [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}

// Inserir item em posição específica
export function insertAt<T>(array: T[], index: number, item: T): T[] {
  const result = [...array];
  result.splice(index, 0, item);
  return result;
}

// Remover item por índice
export function removeAt<T>(array: T[], index: number): T[] {
  return array.filter((_, i) => i !== index);
}

// Atualizar item por índice
export function updateAt<T>(array: T[], index: number, updater: (item: T) => T): T[] {
  return array.map((item, i) => i === index ? updater(item) : item);
}

// Range de números
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

// Criar array com valor inicial
export function fill<T>(length: number, value: T | ((index: number) => T)): T[] {
  return Array.from({ length }, (_, i) => 
    typeof value === 'function' ? (value as (index: number) => T)(i) : value
  );
}

// Verificar se todos/alguns passam
export function all<T>(array: T[], predicate: (item: T) => boolean): boolean {
  return array.every(predicate);
}

export function any<T>(array: T[], predicate: (item: T) => boolean): boolean {
  return array.some(predicate);
}

export function none<T>(array: T[], predicate: (item: T) => boolean): boolean {
  return !array.some(predicate);
}

// Criar lookup map
export function keyBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T> {
  return array.reduce((acc, item) => {
    acc[keyFn(item)] = item;
    return acc;
  }, {} as Record<K, T>);
}

// Inverter array
export function reverse<T>(array: T[]): T[] {
  return [...array].reverse();
}

// Rotacionar array
export function rotate<T>(array: T[], positions: number): T[] {
  if (array.length === 0) return [];
  const normalizedPositions = ((positions % array.length) + array.length) % array.length;
  return [...array.slice(normalizedPositions), ...array.slice(0, normalizedPositions)];
}

// Comparar arrays
export function isEqual<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) return false;
  return array1.every((item, index) => item === array2[index]);
}

// Deep compare arrays
export function isDeepEqual<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) return false;
  return array1.every((item, index) => 
    JSON.stringify(item) === JSON.stringify(array2[index])
  );
}
