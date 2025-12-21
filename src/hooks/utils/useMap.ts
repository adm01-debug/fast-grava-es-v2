import { useState, useCallback } from 'react';

export function useMap<K, V>(initialValue: Map<K, V> = new Map()) {
  const [map, setMap] = useState(initialValue);

  const set = useCallback((key: K, value: V) => setMap(m => new Map(m).set(key, value)), []);
  const remove = useCallback((key: K) => setMap(m => { const nm = new Map(m); nm.delete(key); return nm; }), []);
  const clear = useCallback(() => setMap(new Map()), []);
  const get = useCallback((key: K) => map.get(key), [map]);
  const has = useCallback((key: K) => map.has(key), [map]);

  return { map, set, remove, clear, get, has, size: map.size };
}
