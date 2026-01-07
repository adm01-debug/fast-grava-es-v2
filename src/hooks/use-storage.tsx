import { useState, useEffect, useCallback } from 'react';

// Hook para IndexedDB
export function useIndexedDB<T>(
  dbName: string,
  storeName: string,
  version: number = 1
) {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const request = indexedDB.open(dbName, version);

    request.onerror = () => setError(new Error('Failed to open IndexedDB'));
    
    request.onsuccess = () => {
      setDb(request.result);
      setIsReady(true);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    };

    return () => {
      if (db) db.close();
    };
  }, [dbName, storeName, version]);

  const add = useCallback(async (data: T): Promise<IDBValidKey> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(new Error('DB not ready'));
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db, storeName]);

  const get = useCallback(async (id: IDBValidKey): Promise<T | undefined> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(new Error('DB not ready'));
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db, storeName]);

  const getAll = useCallback(async (): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(new Error('DB not ready'));
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db, storeName]);

  const update = useCallback(async (data: T & { id: IDBValidKey }): Promise<IDBValidKey> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(new Error('DB not ready'));
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db, storeName]);

  const remove = useCallback(async (id: IDBValidKey): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(new Error('DB not ready'));
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db, storeName]);

  const clear = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(new Error('DB not ready'));
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db, storeName]);

  return { isReady, error, add, get, getAll, update, remove, clear };
}

// Hook para cache com expiração
interface CacheItem<T> {
  value: T;
  expiry: number;
}

export function useExpiringCache<T>(key: string, ttlMs: number = 5 * 60 * 1000) {
  const [value, setValue] = useState<T | null>(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      const parsed: CacheItem<T> = JSON.parse(item);
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.value;
    } catch {
      return null;
    }
  });

  const set = useCallback((newValue: T) => {
    const item: CacheItem<T> = {
      value: newValue,
      expiry: Date.now() + ttlMs
    };
    localStorage.setItem(key, JSON.stringify(item));
    setValue(newValue);
  }, [key, ttlMs]);

  const remove = useCallback(() => {
    localStorage.removeItem(key);
    setValue(null);
  }, [key]);

  const isExpired = useCallback(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return true;
      const parsed: CacheItem<T> = JSON.parse(item);
      return Date.now() > parsed.expiry;
    } catch {
      return true;
    }
  }, [key]);

  return { value, set, remove, isExpired };
}

// Hook para sincronização entre tabs
export function useCrossTabState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      localStorage.setItem(key, JSON.stringify(newValue));
      return newValue;
    });
  }, [key]);

  return [state, setValue] as const;
}

// Hook para download de arquivos
export function useFileDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const download = useCallback(async (url: string, filename: string) => {
    setIsDownloading(true);
    setProgress(0);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const chunks: BlobPart[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value as BlobPart);
        received += value.length;
        if (total) setProgress((received / total) * 100);
      }

      const blob = new Blob(chunks);
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      setProgress(100);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const downloadJSON = useCallback((data: object, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, filename);
  }, [downloadBlob]);

  const downloadCSV = useCallback((data: object[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify((row as Record<string, unknown>)[h] ?? '')).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, filename);
  }, [downloadBlob]);

  return { download, downloadBlob, downloadJSON, downloadCSV, isDownloading, progress, error };
}

// Hook para upload de arquivos
export function useFileUpload(options?: {
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((file: File): string | null => {
    if (options?.maxSize && file.size > options.maxSize) {
      return `Arquivo muito grande. Máximo: ${(options.maxSize / 1024 / 1024).toFixed(1)}MB`;
    }
    if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return `Tipo não permitido. Permitidos: ${options.allowedTypes.join(', ')}`;
    }
    return null;
  }, [options]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];
    
    for (const file of fileArray) {
      const validationError = validate(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      validFiles.push(file);
    }

    setError(null);
    
    if (options?.multiple) {
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      setFiles(validFiles.slice(0, 1));
    }

    // Generate previews for images
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, [validate, options?.multiple]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => {
    setFiles([]);
    setPreviews([]);
    setError(null);
  }, []);

  const toBase64 = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  return { files, previews, error, addFiles, removeFile, clear, toBase64 };
}

// Hook para comprimir imagens
export function useImageCompression() {
  const compress = useCallback(async (
    file: File,
    options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
  ): Promise<Blob> => {
    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  return { compress };
}
