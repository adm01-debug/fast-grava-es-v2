// Utilitários para manipulação de URLs

// Parse query string para objeto
export function parseQueryString(queryString: string): Record<string, string | string[]> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string | string[]> = {};

  params.forEach((value, key) => {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        (result[key] as string[]).push(value);
      } else {
        result[key] = [result[key] as string, value];
      }
    } else {
      result[key] = value;
    }
  });

  return result;
}

// Objeto para query string
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

// Adicionar/atualizar parâmetros na URL atual
export function updateUrlParams(
  params: Record<string, any>,
  options: { replace?: boolean } = {}
): void {
  const url = new URL(window.location.href);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  });

  if (options.replace) {
    window.history.replaceState({}, '', url.toString());
  } else {
    window.history.pushState({}, '', url.toString());
  }
}

// Remover parâmetros da URL
export function removeUrlParams(keys: string[]): void {
  const url = new URL(window.location.href);
  keys.forEach((key) => url.searchParams.delete(key));
  window.history.replaceState({}, '', url.toString());
}

// Obter parâmetro específico da URL
export function getUrlParam(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

// Obter todos os parâmetros como objeto tipado
export function getUrlParams<T extends Record<string, string>>(): Partial<T> {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result as Partial<T>;
}

// Criar URL com base path e parâmetros
export function createUrl(basePath: string, params?: Record<string, any>): string {
  const url = new URL(basePath, window.location.origin);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

// Validar se é uma URL válida
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Extrair domínio de uma URL
export function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// Extrair path de uma URL
export function extractPath(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

// Normalizar URL (remover trailing slash, etc)
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove trailing slash
    parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/';
    // Sort query params
    parsed.searchParams.sort();
    return parsed.toString();
  } catch {
    return url;
  }
}

// Criar slug a partir de texto
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens no início e fim
}

// Juntar paths de URL de forma segura
export function joinPaths(...paths: string[]): string {
  return paths
    .map((path, index) => {
      if (index === 0) {
        return path.replace(/\/+$/, '');
      }
      return path.replace(/^\/+|\/+$/g, '');
    })
    .filter(Boolean)
    .join('/');
}

// Resolver URL relativa
export function resolveUrl(base: string, relative: string): string {
  return new URL(relative, base).toString();
}

// Criar hash de URL (para cache keys, etc)
export function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Deep link builder para aplicativos
export function buildDeepLink(
  scheme: string,
  path: string,
  params?: Record<string, any>
): string {
  let url = `${scheme}://${path}`;
  if (params) {
    const queryString = buildQueryString(params);
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  return url;
}

// Extrair parâmetros de template de URL (e.g., /users/:id)
export function extractUrlTemplateParams(
  template: string,
  url: string
): Record<string, string> | null {
  const templateParts = template.split('/');
  const urlParts = url.split('/');

  if (templateParts.length !== urlParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < templateParts.length; i++) {
    const templatePart = templateParts[i];
    const urlPart = urlParts[i];

    if (templatePart.startsWith(':')) {
      params[templatePart.slice(1)] = urlPart;
    } else if (templatePart !== urlPart) {
      return null;
    }
  }

  return params;
}

// Preencher template de URL com parâmetros
export function fillUrlTemplate(
  template: string,
  params: Record<string, any>
): string {
  let result = template;
  
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, encodeURIComponent(String(value)));
  });

  return result;
}

// Hook para sincronizar estado com URL
import { useState, useEffect, useCallback } from 'react';

export function useUrlState<T extends Record<string, any>>(
  initialState: T,
  options: { 
    prefix?: string;
    serialize?: (value: any) => string;
    deserialize?: (value: string) => any;
  } = {}
): [T, (updates: Partial<T>) => void] {
  const { prefix = '', serialize = JSON.stringify, deserialize = JSON.parse } = options;

  const getStateFromUrl = useCallback((): T => {
    const params = new URLSearchParams(window.location.search);
    const result: Record<string, any> = { ...initialState };

    Object.keys(initialState).forEach((key) => {
      const urlKey = prefix ? `${prefix}_${key}` : key;
      const value = params.get(urlKey);
      
      if (value !== null) {
        try {
          result[key] = deserialize(value);
        } catch {
          result[key] = value;
        }
      }
    });

    return result as T;
  }, [initialState, prefix, deserialize]);

  const [state, setState] = useState<T>(getStateFromUrl);

  const updateState = useCallback((updates: Partial<T>) => {
    const newState = { ...state, ...updates };
    setState(newState);

    const params = new URLSearchParams(window.location.search);
    
    Object.entries(updates).forEach(([key, value]) => {
      const urlKey = prefix ? `${prefix}_${key}` : key;
      
      if (value === null || value === undefined || value === initialState[key]) {
        params.delete(urlKey);
      } else {
        try {
          params.set(urlKey, serialize(value));
        } catch {
          params.set(urlKey, String(value));
        }
      }
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [state, prefix, serialize, initialState]);

  // Sincronizar com navegação do browser
  useEffect(() => {
    const handlePopState = () => {
      setState(getStateFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getStateFromUrl]);

  return [state, updateState];
}

// Utilitário para compartilhamento
export function createShareUrl(params: {
  title?: string;
  text?: string;
  url?: string;
}): string {
  const shareUrl = params.url || window.location.href;
  
  // Tenta usar Web Share API
  if (navigator.share) {
    navigator.share({
      title: params.title,
      text: params.text,
      url: shareUrl,
    }).catch(() => {});
  }

  return shareUrl;
}

// Social share URLs
export const socialShareUrls = {
  twitter: (url: string, text?: string) => 
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}${text ? `&text=${encodeURIComponent(text)}` : ''}`,
  
  facebook: (url: string) => 
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  
  linkedin: (url: string, title?: string) => 
    `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}${title ? `&title=${encodeURIComponent(title)}` : ''}`,
  
  whatsapp: (url: string, text?: string) => 
    `https://wa.me/?text=${encodeURIComponent(text ? `${text} ${url}` : url)}`,
  
  telegram: (url: string, text?: string) => 
    `https://t.me/share/url?url=${encodeURIComponent(url)}${text ? `&text=${encodeURIComponent(text)}` : ''}`,
  
  email: (url: string, subject?: string, body?: string) => 
    `mailto:?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body ? `${body}\n\n${url}` : url)}`,
};
