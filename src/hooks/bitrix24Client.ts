/**
 * Bitrix24 Client - Full Implementation
 * 
 * @module hooks/bitrix24Client
 * @description Complete Bitrix24 API client with retry logic and caching
 */

export interface Bitrix24Config {
  webhookUrl?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface Bitrix24Response<T> {
  result: T;
  total?: number;
  next?: number;
}

export interface LalamoveItem {
  id: number;
  title: string;
  stage: string;
  createdTime: string;
  updatedTime: string;
  [key: string]: unknown;
}

// Entity IDs
export const LALAMOVE_ENTITY_ID = 1040;
export const EXPEDICAO_ENTITY_ID = 1041;

// Field mappings for Lalamove
export const LALAMOVE_FIELDS = {
  ID: 'id',
  TITLE: 'title',
  STAGE_ID: 'stageId',
  CREATED_TIME: 'createdTime',
  UPDATED_TIME: 'updatedTime',
  ASSIGNED_BY_ID: 'assignedById',
};

// Cache for webhook URL
let cachedWebhookUrl: string | null = null;

/**
 * Get Bitrix24 webhook URL from environment or configuration
 */
export function getWebhookUrl(): string {
  if (cachedWebhookUrl) return cachedWebhookUrl;
  
  // Try to get from environment (would be set via edge function secrets)
  const envUrl = typeof window !== 'undefined' 
    ? (window as unknown as Record<string, string>).__BITRIX24_WEBHOOK_URL__
    : undefined;
  
  if (envUrl) {
    cachedWebhookUrl = envUrl;
    return envUrl;
  }
  
  console.warn('Bitrix24 webhook URL not configured');
  return '';
}

/**
 * Bitrix24 API call with retry logic
 */
export async function bitrix24CallWithRetry<T>(
  method: string,
  params: Record<string, unknown> = {},
  maxRetries = 3,
  retryDelay = 1000
): Promise<Bitrix24Response<T>> {
  const webhookUrl = getWebhookUrl();
  
  if (!webhookUrl) {
    throw new Error('Bitrix24 not configured. Please set webhook URL.');
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${webhookUrl}/${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error_description || data.error);
      }

      return data as Bitrix24Response<T>;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on certain errors
      if (lastError.message.includes('not configured')) {
        throw lastError;
      }

      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error('Failed after max retries');
}

/**
 * Fetch Lalamove items from Bitrix24
 */
export async function fetchLalamoveItems(
  filter?: Record<string, unknown>
): Promise<LalamoveItem[]> {
  const response = await bitrix24CallWithRetry<{ items: LalamoveItem[] }>(
    'crm.item.list',
    {
      entityTypeId: LALAMOVE_ENTITY_ID,
      select: Object.keys(LALAMOVE_FIELDS),
      filter: filter || {},
    }
  );

  return response.result.items || [];
}

/**
 * Create Bitrix24 client instance
 */
export interface Bitrix24Client {
  isConfigured: boolean;
  call: <T = unknown>(method: string, params?: Record<string, unknown>) => Promise<Bitrix24Response<T>>;
  fetchLalamove: (filter?: Record<string, unknown>) => Promise<LalamoveItem[]>;
}

export function createBitrix24Client(_config?: Bitrix24Config): Bitrix24Client {
  const webhookUrl = getWebhookUrl();
  
  return {
    isConfigured: !!webhookUrl,
    call: async <T>(method: string, params?: Record<string, unknown>): Promise<Bitrix24Response<T>> => {
      return bitrix24CallWithRetry<T>(method, params);
    },
    fetchLalamove: fetchLalamoveItems,
  };
}

export default createBitrix24Client;
