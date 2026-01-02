import { toast } from 'sonner';

const BITRIX_WEBHOOK_URL = import.meta.env.VITE_BITRIX_WEBHOOK_URL || 'https://promobrindes.bitrix24.com.br/rest/1/ipkwbb32nhewia33';

export interface Bitrix24Response<T> {
  result: T;
  total?: number;
  next?: number;
  time?: { start: number; finish: number; duration: number };
}

export interface Bitrix24Error {
  error: string;
  error_description: string;
}

export async function bitrix24Call<T>(method: string, params: Record<string, unknown> = {}): Promise<Bitrix24Response<T>> {
  const url = `${BITRIX_WEBHOOK_URL}/${method}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if ('error' in data) {
      const error = data as Bitrix24Error;
      throw new Error(`${error.error}: ${error.error_description}`);
    }

    return data as Bitrix24Response<T>;
  } catch (error) {
    console.error(`Bitrix24 ${method} error:`, error);
    throw error;
  }
}

export async function bitrix24CallWithRetry<T>(method: string, params: Record<string, unknown> = {}, retries = 3): Promise<Bitrix24Response<T>> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await bitrix24Call<T>(method, params);
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

// SPA LALAMOVE - EntityTypeId=1690
export const LALAMOVE_ENTITY_ID = 1690;
export const LALAMOVE_FIELDS = {
  MOTORISTA: 'UF_CRM_276_1758741015',
  PLACA: 'UF_CRM_276_1728401486',
  MAPA: 'UF_CRM_276_1728401505',
  CONTATO: 'UF_CRM_276_1728401529',
  FOTOS: 'UF_CRM_276_1728401556',
  DATA_HORA: 'UF_CRM_276_1728401580',
  LOCAL: 'UF_CRM_276_1728401603',
};

// SPA EXPEDIÇÃO - EntityTypeId=1502
export const EXPEDICAO_ENTITY_ID = 1502;
export const EXPEDICAO_FIELDS = {
  MOTORISTA: 'UF_CRM_194_1760527413038',
  STATUS: 'UF_CRM_194_1728401412',
};

export interface LalamoveItem {
  id: number;
  motorista: string;
  placa: string;
  mapa: string;
  contato: string;
  fotos: string[];
  dataHora: string;
  local: string;
}

export async function fetchLalamoveItems(filter?: Record<string, unknown>): Promise<LalamoveItem[]> {
  const response = await bitrix24CallWithRetry<{ items: Record<string, unknown>[] }>('crm.item.list', {
    entityTypeId: LALAMOVE_ENTITY_ID,
    select: ['ID', ...Object.values(LALAMOVE_FIELDS)],
    filter: filter || {},
  });

  return response.result.items.map(item => ({
    id: Number(item.ID),
    motorista: String(item[LALAMOVE_FIELDS.MOTORISTA] || ''),
    placa: String(item[LALAMOVE_FIELDS.PLACA] || ''),
    mapa: String(item[LALAMOVE_FIELDS.MAPA] || ''),
    contato: String(item[LALAMOVE_FIELDS.CONTATO] || ''),
    fotos: Array.isArray(item[LALAMOVE_FIELDS.FOTOS]) ? item[LALAMOVE_FIELDS.FOTOS] as string[] : [],
    dataHora: String(item[LALAMOVE_FIELDS.DATA_HORA] || ''),
    local: String(item[LALAMOVE_FIELDS.LOCAL] || ''),
  }));
}
