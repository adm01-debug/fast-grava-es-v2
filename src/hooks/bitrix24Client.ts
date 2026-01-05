/**
 * Bitrix24 Client Stub
 * 
 * @module hooks/bitrix24Client
 * @description Placeholder for Bitrix24 API client
 */

export interface Bitrix24Config {
  webhookUrl?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface Bitrix24Client {
  isConfigured: boolean;
  call: <T = unknown>(method: string, params?: Record<string, unknown>) => Promise<T>;
}

export function createBitrix24Client(_config?: Bitrix24Config): Bitrix24Client {
  return {
    isConfigured: false,
    call: async <T>(_method: string, _params?: Record<string, unknown>): Promise<T> => {
      console.warn('Bitrix24 client not configured');
      throw new Error('Bitrix24 client not configured');
    },
  };
}

export default createBitrix24Client;
