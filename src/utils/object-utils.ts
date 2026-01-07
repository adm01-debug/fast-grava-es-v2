// Utilitários avançados para manipulação de objetos

// Deep clone de objeto
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (obj instanceof Map) return new Map(Array.from(obj.entries()).map(([k, v]) => [k, deepClone(v)])) as T;
  if (obj instanceof Set) return new Set(Array.from(obj).map(item => deepClone(item))) as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

// Deep merge de objetos
export function deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T {
  const result = { ...target };
  
  for (const source of sources) {
    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as T[typeof key];
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as T[typeof key];
      }
    }
  }
  
  return result;
}

// Verificar se é objeto simples
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && value.constructor === Object;
}

// Pegar valor aninhado por path
export function get<T = unknown>(obj: Record<string, unknown>, path: string, defaultValue?: T): T {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let result: unknown = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue as T;
    }
    result = (result as Record<string, unknown>)[key];
  }
  
  return (result === undefined ? defaultValue : result) as T;
}

// Setar valor aninhado por path
export function set<T extends Record<string, unknown>>(obj: T, path: string, value: unknown): T {
  const result = deepClone(obj);
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current: Record<string, unknown> = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || !isPlainObject(current[key])) {
      current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    }
    current = current[key] as Record<string, unknown>;
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
}

// Deletar valor aninhado por path
export function unset<T extends Record<string, unknown>>(obj: T, path: string): T {
  const result = deepClone(obj);
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current: Record<string, unknown> = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) return result;
    current = current[key] as Record<string, unknown>;
  }
  
  delete current[keys[keys.length - 1]];
  return result;
}

// Verificar se path existe
export function has(obj: Record<string, unknown>, path: string): boolean {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return false;
    }
    if (!(key in (current as Record<string, unknown>))) {
      return false;
    }
    current = (current as Record<string, unknown>)[key];
  }
  
  return true;
}

// Pegar apenas algumas chaves
export function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

// Omitir algumas chaves
export function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

// Mapear valores do objeto
export function mapValues<T extends Record<string, unknown>, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = fn(obj[key], key);
    }
  }
  return result;
}

// Mapear chaves do objeto
export function mapKeys<T extends Record<string, unknown>>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => string
): Record<string, T[keyof T]> {
  const result: Record<string, T[keyof T]> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = fn(key, obj[key]);
      result[newKey] = obj[key];
    }
  }
  return result;
}

// Filtrar objeto por predicado
export function filterObject<T extends Record<string, unknown>>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result = {} as Partial<T>;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (predicate(obj[key], key)) {
        result[key] = obj[key];
      }
    }
  }
  return result;
}

// Inverter chaves e valores
export function invert<T extends Record<string, string | number>>(obj: T): Record<string, keyof T> {
  const result: Record<string, keyof T> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[String(obj[key])] = key;
    }
  }
  return result;
}

// Achatar objeto aninhado
export function flatten(obj: Record<string, unknown>, prefix: string = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      
      if (isPlainObject(value)) {
        Object.assign(result, flatten(value as Record<string, unknown>, newKey));
      } else {
        result[newKey] = value;
      }
    }
  }
  
  return result;
}

// Desachatar objeto
export function unflatten(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      set(result, key, obj[key]);
    }
  }
  
  return result;
}

// Comparar objetos profundamente
export function isDeepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== typeof obj2) return false;
  if (obj1 === null || obj2 === null) return obj1 === obj2;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1 as object);
  const keys2 = Object.keys(obj2 as object);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isDeepEqual(
      (obj1 as Record<string, unknown>)[key],
      (obj2 as Record<string, unknown>)[key]
    )) return false;
  }
  
  return true;
}

// Encontrar diferenças entre objetos
export function diff<T extends Record<string, unknown>>(obj1: T, obj2: T): Partial<T> {
  const result = {} as Partial<T>;
  
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]) as Set<keyof T>;
  
  for (const key of allKeys) {
    if (!isDeepEqual(obj1[key], obj2[key])) {
      result[key] = obj2[key];
    }
  }
  
  return result;
}

// Remover valores undefined/null
export function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return filterObject(obj, (value) => value !== null && value !== undefined) as Partial<T>;
}

// Remover valores vazios (null, undefined, '', [], {})
export function removeEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return filterObject(obj, (value) => {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (isPlainObject(value) && Object.keys(value).length === 0) return false;
    return true;
  }) as Partial<T>;
}

// Transformar objeto em array de entries
export function entries<T extends Record<string, unknown>>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

// Criar objeto a partir de entries
export function fromEntries<K extends string, V>(entries: [K, V][]): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

// Contar propriedades
export function size(obj: Record<string, unknown>): number {
  return Object.keys(obj).length;
}

// Verificar se objeto está vazio
export function isEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}

// Clonar com transformação
export function transform<T extends Record<string, unknown>, R>(
  obj: T,
  transformer: (value: T[keyof T], key: keyof T, obj: T) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = transformer(obj[key], key, obj);
    }
  }
  return result;
}

// Criar objeto com valores default
export function defaults<T extends Record<string, unknown>>(obj: T, defaultValues: Partial<T>): T {
  const result = { ...obj };
  for (const key in defaultValues) {
    if (result[key] === undefined) {
      result[key] = defaultValues[key] as T[typeof key];
    }
  }
  return result;
}
