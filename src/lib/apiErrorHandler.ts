import { toast } from 'sonner';

export interface APIError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

export function handleAPIError(error: unknown, context?: string): APIError {
  const prefix = context ? `[${context}] ` : '';
  
  if (error instanceof Response) {
    const apiError: APIError = {
      status: error.status,
      message: getErrorMessage(error.status),
      code: `HTTP_${error.status}`,
    };
    toast.error(`${prefix}${apiError.message}`);
    return apiError;
  }

  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const apiError: APIError = { status: 0, message: 'Sem conexão com o servidor', code: 'NETWORK_ERROR' };
      toast.error(`${prefix}Verifique sua conexão de internet`);
      return apiError;
    }
    
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      const apiError: APIError = { status: 408, message: 'Tempo de resposta excedido', code: 'TIMEOUT' };
      toast.error(`${prefix}Servidor demorou para responder`);
      return apiError;
    }

    const apiError: APIError = { status: 500, message: error.message, code: 'UNKNOWN_ERROR', details: error };
    toast.error(`${prefix}${error.message}`);
    return apiError;
  }

  const apiError: APIError = { status: 500, message: 'Erro desconhecido', code: 'UNKNOWN_ERROR', details: error };
  toast.error(`${prefix}Erro desconhecido`);
  return apiError;
}

function getErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Requisição inválida',
    401: 'Não autorizado - faça login novamente',
    403: 'Acesso negado',
    404: 'Recurso não encontrado',
    408: 'Tempo de resposta excedido',
    429: 'Muitas requisições - aguarde um momento',
    500: 'Erro interno do servidor',
    502: 'Servidor indisponível',
    503: 'Serviço temporariamente indisponível',
    504: 'Tempo de gateway excedido',
  };
  return messages[status] || `Erro ${status}`;
}

export function isRetryableError(error: APIError): boolean {
  return [408, 429, 500, 502, 503, 504].includes(error.status) || error.code === 'NETWORK_ERROR';
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const apiError = handleAPIError(error);
      if (!isRetryableError(apiError) || i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i)));
    }
  }
  throw lastError;
}
