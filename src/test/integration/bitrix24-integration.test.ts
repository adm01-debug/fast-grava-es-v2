import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  functions: {
    invoke: vi.fn(),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

interface BitrixDeal {
  ID: string;
  TITLE: string;
  STAGE_ID: string;
  UF_CRM_TECHNIQUE?: string;
  UF_CRM_QUANTITY?: number;
  UF_CRM_CLIENT?: string;
  UF_CRM_PRODUCT?: string;
  UF_CRM_PRIORITY?: string;
  UF_CRM_SCHEDULED_DATE?: string;
  UF_CRM_PRODUCED_QUANTITY?: number;
  UF_CRM_LOST_PIECES?: number;
  UF_CRM_COMPLETED_AT?: string;
}

interface LocalJob {
  id: string;
  order_number: string;
  client: string;
  product: string;
  quantity: number;
  technique_id: string;
  status: string;
  priority: string;
  scheduled_date: string | null;
  produced_quantity: number | null;
  lost_pieces: number | null;
  actual_end_time: string | null;
}

describe('Bitrix24 Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Field Mapping', () => {
    const fieldMappings: Record<string, string> = {
      'UF_CRM_TECHNIQUE': 'technique_id',
      'UF_CRM_QUANTITY': 'quantity',
      'UF_CRM_CLIENT': 'client',
      'UF_CRM_PRODUCT': 'product',
      'UF_CRM_PRIORITY': 'priority',
      'UF_CRM_SCHEDULED_DATE': 'scheduled_date',
      'UF_CRM_PRODUCED_QUANTITY': 'produced_quantity',
      'UF_CRM_LOST_PIECES': 'lost_pieces',
      'UF_CRM_COMPLETED_AT': 'actual_end_time',
    };

    it('should map Bitrix24 fields to local fields', () => {
      const mapBitrixToLocal = (bitrixField: string): string | null => {
        return fieldMappings[bitrixField] || null;
      };

      expect(mapBitrixToLocal('UF_CRM_TECHNIQUE')).toBe('technique_id');
      expect(mapBitrixToLocal('UF_CRM_QUANTITY')).toBe('quantity');
      expect(mapBitrixToLocal('UF_CRM_CLIENT')).toBe('client');
      expect(mapBitrixToLocal('UF_CRM_UNKNOWN')).toBeNull();
    });

    it('should map local fields to Bitrix24 fields', () => {
      const reverseMapping = Object.fromEntries(
        Object.entries(fieldMappings).map(([k, v]) => [v, k])
      );

      const mapLocalToBitrix = (localField: string): string | null => {
        return reverseMapping[localField] || null;
      };

      expect(mapLocalToBitrix('technique_id')).toBe('UF_CRM_TECHNIQUE');
      expect(mapLocalToBitrix('quantity')).toBe('UF_CRM_QUANTITY');
      expect(mapLocalToBitrix('unknown_field')).toBeNull();
    });
  });

  describe('Technique Mapping', () => {
    const techniqueMappings: Record<string, string> = {
      'silk_textil': 'silk-textil',
      'silk_vinilico': 'silk-vinilico-uv-plano',
      'fiber_laser': 'laser-fiber',
      'laser_co2': 'laser-co2',
      'laser_uv': 'laser-uv',
      'tampografia': 'tampografia',
      'hot_stamping': 'hot-stamping',
      'dtf_textil': 'dtf-textil',
      'dtf_uv': 'dtf-uv',
      'prensa_termica': 'prensa-termica',
      'sublimacao': 'sublimacao-caneca',
      'decalque': 'decalque-forno',
      'corte_midia': 'corte-midia',
      'aplicacao_dtf': 'aplicacao-dtf-uv',
    };

    it('should map Bitrix24 technique to local technique_id', () => {
      const mapTechnique = (bitrixTechnique: string): string => {
        return techniqueMappings[bitrixTechnique] || 'unknown';
      };

      expect(mapTechnique('silk_textil')).toBe('silk-textil');
      expect(mapTechnique('fiber_laser')).toBe('laser-fiber');
      expect(mapTechnique('unknown_tech')).toBe('unknown');
    });

    it('should handle all 14 technique mappings', () => {
      expect(Object.keys(techniqueMappings)).toHaveLength(14);
    });
  });

  describe('Priority Mapping', () => {
    const priorityMappings: Record<string, string> = {
      'urgente': 'urgent',
      'alta': 'high',
      'media': 'medium',
      'baixa': 'low',
      'urgent': 'urgent',
      'high': 'high',
      'medium': 'medium',
      'low': 'low',
    };

    it('should map Bitrix24 priority to local priority', () => {
      const mapPriority = (bitrixPriority: string): string => {
        return priorityMappings[bitrixPriority.toLowerCase()] || 'medium';
      };

      expect(mapPriority('urgente')).toBe('urgent');
      expect(mapPriority('ALTA')).toBe('high');
      expect(mapPriority('Media')).toBe('medium');
      expect(mapPriority('unknown')).toBe('medium');
    });
  });

  describe('Stage Mapping', () => {
    const stageMappings: Record<string, string> = {
      'NEW': 'queue',
      'PREPARATION': 'queue',
      'C1:NEW': 'queue',
      'C1:PREPARATION': 'ready',
      'C1:IN_PROCESS': 'production',
      'WON': 'finished',
      'LOSE': 'cancelled',
      'SCHEDULED': 'scheduled',
      'PAUSED': 'paused',
      'DELAYED': 'delayed',
      'REWORK': 'rework',
    };

    it('should map Bitrix24 stage to local status', () => {
      const mapStage = (bitrixStage: string): string => {
        return stageMappings[bitrixStage] || 'queue';
      };

      expect(mapStage('NEW')).toBe('queue');
      expect(mapStage('C1:IN_PROCESS')).toBe('production');
      expect(mapStage('WON')).toBe('finished');
      expect(mapStage('LOSE')).toBe('cancelled');
      expect(mapStage('UNKNOWN_STAGE')).toBe('queue');
    });

    it('should map local status to Bitrix24 stage', () => {
      const reverseStageMap: Record<string, string> = {
        'queue': 'NEW',
        'ready': 'C1:PREPARATION',
        'scheduled': 'SCHEDULED',
        'production': 'C1:IN_PROCESS',
        'finished': 'WON',
        'cancelled': 'LOSE',
        'paused': 'PAUSED',
        'delayed': 'DELAYED',
        'rework': 'REWORK',
      };

      const mapStatusToStage = (status: string): string => {
        return reverseStageMap[status] || 'NEW';
      };

      expect(mapStatusToStage('production')).toBe('C1:IN_PROCESS');
      expect(mapStatusToStage('finished')).toBe('WON');
    });
  });
});

describe('Pull Sync (Bitrix24 → Local)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Deal to Job Conversion', () => {
    it('should convert Bitrix24 deal to local job', () => {
      const convertDealToJob = (deal: BitrixDeal): Partial<LocalJob> => {
        const techniqueMappings: Record<string, string> = {
          'silk_textil': 'silk-textil',
          'fiber_laser': 'laser-fiber',
        };

        const stageMappings: Record<string, string> = {
          'NEW': 'queue',
          'C1:IN_PROCESS': 'production',
          'WON': 'finished',
        };

        const priorityMappings: Record<string, string> = {
          'alta': 'high',
          'media': 'medium',
          'baixa': 'low',
        };

        return {
          order_number: deal.ID,
          client: deal.UF_CRM_CLIENT || 'Cliente não informado',
          product: deal.UF_CRM_PRODUCT || deal.TITLE,
          quantity: deal.UF_CRM_QUANTITY || 0,
          technique_id: techniqueMappings[deal.UF_CRM_TECHNIQUE || ''] || 'unknown',
          status: stageMappings[deal.STAGE_ID] || 'queue',
          priority: priorityMappings[(deal.UF_CRM_PRIORITY || 'media').toLowerCase()] || 'medium',
          scheduled_date: deal.UF_CRM_SCHEDULED_DATE || null,
        };
      };

      const deal: BitrixDeal = {
        ID: '12345',
        TITLE: 'Camisetas Personalizadas',
        STAGE_ID: 'C1:IN_PROCESS',
        UF_CRM_TECHNIQUE: 'silk_textil',
        UF_CRM_QUANTITY: 100,
        UF_CRM_CLIENT: 'Cliente Teste',
        UF_CRM_PRODUCT: 'Camiseta Algodão',
        UF_CRM_PRIORITY: 'alta',
        UF_CRM_SCHEDULED_DATE: '2024-12-20',
      };

      const job = convertDealToJob(deal);

      expect(job.order_number).toBe('12345');
      expect(job.client).toBe('Cliente Teste');
      expect(job.quantity).toBe(100);
      expect(job.technique_id).toBe('silk-textil');
      expect(job.status).toBe('production');
      expect(job.priority).toBe('high');
    });

    it('should handle missing optional fields', () => {
      const convertDealToJob = (deal: BitrixDeal): Partial<LocalJob> => {
        return {
          order_number: deal.ID,
          client: deal.UF_CRM_CLIENT || 'Cliente não informado',
          product: deal.UF_CRM_PRODUCT || deal.TITLE,
          quantity: deal.UF_CRM_QUANTITY || 0,
          scheduled_date: deal.UF_CRM_SCHEDULED_DATE || null,
        };
      };

      const minimalDeal: BitrixDeal = {
        ID: '99999',
        TITLE: 'Pedido Mínimo',
        STAGE_ID: 'NEW',
      };

      const job = convertDealToJob(minimalDeal);

      expect(job.client).toBe('Cliente não informado');
      expect(job.product).toBe('Pedido Mínimo');
      expect(job.quantity).toBe(0);
      expect(job.scheduled_date).toBeNull();
    });
  });

  describe('Sync Process', () => {
    it('should identify new deals to create', () => {
      const existingJobIds = ['100', '101', '102'];
      const incomingDeals: BitrixDeal[] = [
        { ID: '100', TITLE: 'Existing 1', STAGE_ID: 'NEW' },
        { ID: '103', TITLE: 'New Deal', STAGE_ID: 'NEW' },
        { ID: '104', TITLE: 'Another New', STAGE_ID: 'NEW' },
      ];

      const identifyNewDeals = (deals: BitrixDeal[], existingIds: string[]): BitrixDeal[] => {
        return deals.filter(deal => !existingIds.includes(deal.ID));
      };

      const newDeals = identifyNewDeals(incomingDeals, existingJobIds);
      expect(newDeals).toHaveLength(2);
      expect(newDeals.map(d => d.ID)).toEqual(['103', '104']);
    });

    it('should identify deals to update', () => {
      const existingJobIds = ['100', '101', '102'];
      const incomingDeals: BitrixDeal[] = [
        { ID: '100', TITLE: 'Updated 1', STAGE_ID: 'C1:IN_PROCESS' },
        { ID: '101', TITLE: 'Updated 2', STAGE_ID: 'WON' },
        { ID: '105', TITLE: 'New Deal', STAGE_ID: 'NEW' },
      ];

      const identifyUpdates = (deals: BitrixDeal[], existingIds: string[]): BitrixDeal[] => {
        return deals.filter(deal => existingIds.includes(deal.ID));
      };

      const updates = identifyUpdates(incomingDeals, existingJobIds);
      expect(updates).toHaveLength(2);
      expect(updates.map(d => d.ID)).toEqual(['100', '101']);
    });
  });
});

describe('Push Sync (Local → Bitrix24)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Job to Deal Conversion', () => {
    it('should convert local job to Bitrix24 update payload', () => {
      const convertJobToBitrixUpdate = (job: LocalJob): Record<string, unknown> => {
        const statusToStage: Record<string, string> = {
          'queue': 'NEW',
          'production': 'C1:IN_PROCESS',
          'finished': 'WON',
          'cancelled': 'LOSE',
        };

        const payload: Record<string, unknown> = {
          id: job.order_number,
          fields: {
            STAGE_ID: statusToStage[job.status] || 'NEW',
          },
        };

        if (job.produced_quantity !== null) {
          (payload.fields as Record<string, unknown>).UF_CRM_PRODUCED_QUANTITY = job.produced_quantity;
        }
        if (job.lost_pieces !== null) {
          (payload.fields as Record<string, unknown>).UF_CRM_LOST_PIECES = job.lost_pieces;
        }
        if (job.actual_end_time) {
          (payload.fields as Record<string, unknown>).UF_CRM_COMPLETED_AT = job.actual_end_time;
        }

        return payload;
      };

      const job: LocalJob = {
        id: 'uuid-123',
        order_number: '12345',
        client: 'Cliente',
        product: 'Produto',
        quantity: 100,
        technique_id: 'silk-textil',
        status: 'finished',
        priority: 'high',
        scheduled_date: '2024-12-20',
        produced_quantity: 95,
        lost_pieces: 5,
        actual_end_time: '2024-12-20T15:30:00Z',
      };

      const payload = convertJobToBitrixUpdate(job);

      expect(payload.id).toBe('12345');
      expect((payload.fields as Record<string, unknown>).STAGE_ID).toBe('WON');
      expect((payload.fields as Record<string, unknown>).UF_CRM_PRODUCED_QUANTITY).toBe(95);
      expect((payload.fields as Record<string, unknown>).UF_CRM_LOST_PIECES).toBe(5);
    });
  });

  describe('Status Change Push', () => {
    it('should trigger push sync on status change to finished', () => {
      const shouldPushTobitrix = (oldStatus: string, newStatus: string): boolean => {
        const pushTriggerStatuses = ['finished', 'cancelled', 'production'];
        return pushTriggerStatuses.includes(newStatus) && oldStatus !== newStatus;
      };

      expect(shouldPushTobitrix('production', 'finished')).toBe(true);
      expect(shouldPushTobitrix('scheduled', 'production')).toBe(true);
      expect(shouldPushTobitrix('production', 'cancelled')).toBe(true);
      expect(shouldPushTobitrix('queue', 'ready')).toBe(false);
      expect(shouldPushTobitrix('finished', 'finished')).toBe(false);
    });

    it('should include production data on finish', () => {
      const buildFinishPayload = (job: {
        order_number: string;
        produced_quantity: number;
        lost_pieces: number;
        actual_end_time: string;
      }) => {
        return {
          id: job.order_number,
          fields: {
            STAGE_ID: 'WON',
            UF_CRM_PRODUCED_QUANTITY: job.produced_quantity,
            UF_CRM_LOST_PIECES: job.lost_pieces,
            UF_CRM_COMPLETED_AT: job.actual_end_time,
          },
        };
      };

      const payload = buildFinishPayload({
        order_number: '12345',
        produced_quantity: 95,
        lost_pieces: 5,
        actual_end_time: '2024-12-20T15:30:00Z',
      });

      expect(payload.fields.UF_CRM_PRODUCED_QUANTITY).toBe(95);
      expect(payload.fields.UF_CRM_LOST_PIECES).toBe(5);
      expect(payload.fields.STAGE_ID).toBe('WON');
    });
  });
});

describe('Webhook Handling', () => {
  describe('Event Processing', () => {
    it('should handle ONCRMDEALUPDATE event', () => {
      const processWebhook = (event: { event: string; data: { FIELDS: { ID: string } } }) => {
        const handlers: Record<string, (data: { FIELDS: { ID: string } }) => { action: string; dealId: string }> = {
          'ONCRMDEALUPDATE': (data) => ({ action: 'update', dealId: data.FIELDS.ID }),
          'ONCRMDEALADD': (data) => ({ action: 'create', dealId: data.FIELDS.ID }),
          'ONCRMDEALDEL': (data) => ({ action: 'delete', dealId: data.FIELDS.ID }),
        };

        const handler = handlers[event.event];
        if (!handler) return { action: 'unknown', dealId: '' };
        return handler(event.data);
      };

      const updateEvent = {
        event: 'ONCRMDEALUPDATE',
        data: { FIELDS: { ID: '12345' } },
      };

      const result = processWebhook(updateEvent);
      expect(result.action).toBe('update');
      expect(result.dealId).toBe('12345');
    });

    it('should handle ONCRMDEALADD event', () => {
      const processWebhook = (event: { event: string; data: { FIELDS: { ID: string } } }) => {
        if (event.event === 'ONCRMDEALADD') {
          return { action: 'create', dealId: event.data.FIELDS.ID };
        }
        return { action: 'unknown', dealId: '' };
      };

      const addEvent = {
        event: 'ONCRMDEALADD',
        data: { FIELDS: { ID: '99999' } },
      };

      const result = processWebhook(addEvent);
      expect(result.action).toBe('create');
      expect(result.dealId).toBe('99999');
    });

    it('should validate webhook payload', () => {
      const validateWebhook = (payload: unknown): { valid: boolean; error?: string } => {
        if (!payload || typeof payload !== 'object') {
          return { valid: false, error: 'Invalid payload format' };
        }

        const p = payload as Record<string, unknown>;
        if (!p.event || typeof p.event !== 'string') {
          return { valid: false, error: 'Missing event type' };
        }

        if (!p.data || typeof p.data !== 'object') {
          return { valid: false, error: 'Missing data object' };
        }

        const data = p.data as Record<string, unknown>;
        if (!data.FIELDS || typeof data.FIELDS !== 'object') {
          return { valid: false, error: 'Missing FIELDS in data' };
        }

        return { valid: true };
      };

      expect(validateWebhook({ event: 'ONCRMDEALUPDATE', data: { FIELDS: { ID: '123' } } }).valid).toBe(true);
      expect(validateWebhook(null).valid).toBe(false);
      expect(validateWebhook({}).error).toBe('Missing event type');
      expect(validateWebhook({ event: 'TEST' }).error).toBe('Missing data object');
    });
  });
});

describe('Sync History', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('History Recording', () => {
    it('should create sync history record', () => {
      const createSyncRecord = (params: {
        sync_type: string;
        triggered_by: string;
      }) => {
        return {
          id: 'sync-uuid',
          sync_type: params.sync_type,
          triggered_by: params.triggered_by,
          status: 'running',
          started_at: new Date().toISOString(),
          jobs_synced: 0,
          jobs_failed: 0,
          details: {},
        };
      };

      const record = createSyncRecord({
        sync_type: 'pull',
        triggered_by: 'manual',
      });

      expect(record.sync_type).toBe('pull');
      expect(record.status).toBe('running');
      expect(record.jobs_synced).toBe(0);
    });

    it('should update sync record on completion', () => {
      const completeSyncRecord = (
        record: { status: string; jobs_synced: number; jobs_failed: number; completed_at: string | null },
        results: { synced: number; failed: number }
      ) => {
        return {
          ...record,
          status: results.failed > 0 ? 'partial' : 'completed',
          jobs_synced: results.synced,
          jobs_failed: results.failed,
          completed_at: new Date().toISOString(),
        };
      };

      const initialRecord = {
        status: 'running',
        jobs_synced: 0,
        jobs_failed: 0,
        completed_at: null,
      };

      const completed = completeSyncRecord(initialRecord, { synced: 10, failed: 0 });
      expect(completed.status).toBe('completed');
      expect(completed.jobs_synced).toBe(10);

      const partial = completeSyncRecord(initialRecord, { synced: 8, failed: 2 });
      expect(partial.status).toBe('partial');
      expect(partial.jobs_failed).toBe(2);
    });

    it('should record error on sync failure', () => {
      const failSyncRecord = (
        record: { status: string; error_message: string | null },
        error: string
      ) => {
        return {
          ...record,
          status: 'failed',
          error_message: error,
          completed_at: new Date().toISOString(),
        };
      };

      const failed = failSyncRecord(
        { status: 'running', error_message: null },
        'Connection timeout'
      );

      expect(failed.status).toBe('failed');
      expect(failed.error_message).toBe('Connection timeout');
    });
  });

  describe('Sync Types', () => {
    it('should categorize sync by trigger type', () => {
      const getSyncCategory = (triggeredBy: string): string => {
        const categories: Record<string, string> = {
          'manual': 'user_initiated',
          'auto': 'scheduled',
          'cron': 'scheduled',
          'bitrix24': 'webhook',
          'status_change': 'event_driven',
        };
        return categories[triggeredBy] || 'unknown';
      };

      expect(getSyncCategory('manual')).toBe('user_initiated');
      expect(getSyncCategory('cron')).toBe('scheduled');
      expect(getSyncCategory('bitrix24')).toBe('webhook');
      expect(getSyncCategory('status_change')).toBe('event_driven');
    });
  });
});

describe('Error Handling', () => {
  describe('API Errors', () => {
    it('should handle authentication errors', () => {
      const handleApiError = (status: number, message: string): { retry: boolean; action: string } => {
        if (status === 401 || status === 403) {
          return { retry: false, action: 'refresh_token' };
        }
        if (status === 429) {
          return { retry: true, action: 'rate_limit_wait' };
        }
        if (status >= 500) {
          return { retry: true, action: 'server_error_retry' };
        }
        return { retry: false, action: 'log_error' };
      };

      expect(handleApiError(401, 'Unauthorized')).toEqual({ retry: false, action: 'refresh_token' });
      expect(handleApiError(429, 'Rate limited')).toEqual({ retry: true, action: 'rate_limit_wait' });
      expect(handleApiError(500, 'Server error')).toEqual({ retry: true, action: 'server_error_retry' });
      expect(handleApiError(400, 'Bad request')).toEqual({ retry: false, action: 'log_error' });
    });

    it('should implement exponential backoff', () => {
      const calculateBackoff = (attempt: number, baseMs: number = 1000, maxMs: number = 30000): number => {
        const backoff = Math.min(baseMs * Math.pow(2, attempt), maxMs);
        const jitter = Math.random() * 0.1 * backoff;
        return Math.floor(backoff + jitter);
      };

      const attempt0 = calculateBackoff(0, 1000, 30000);
      const attempt1 = calculateBackoff(1, 1000, 30000);
      const attempt2 = calculateBackoff(2, 1000, 30000);
      const attempt5 = calculateBackoff(5, 1000, 30000);

      expect(attempt0).toBeGreaterThanOrEqual(1000);
      expect(attempt0).toBeLessThan(1200);
      expect(attempt1).toBeGreaterThanOrEqual(2000);
      expect(attempt2).toBeGreaterThanOrEqual(4000);
      expect(attempt5).toBeLessThanOrEqual(33000); // max + jitter
    });
  });

  describe('Data Validation Errors', () => {
    it('should validate required fields before sync', () => {
      const validateDealForSync = (deal: Partial<BitrixDeal>): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!deal.ID) errors.push('Missing deal ID');
        if (!deal.TITLE) errors.push('Missing deal title');
        if (!deal.STAGE_ID) errors.push('Missing stage ID');

        return { valid: errors.length === 0, errors };
      };

      const validDeal = { ID: '123', TITLE: 'Test', STAGE_ID: 'NEW' };
      expect(validateDealForSync(validDeal).valid).toBe(true);

      const invalidDeal = { TITLE: 'No ID' };
      const result = validateDealForSync(invalidDeal);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing deal ID');
      expect(result.errors).toContain('Missing stage ID');
    });
  });
});

describe('OAuth Token Management', () => {
  describe('Token Refresh', () => {
    it('should detect expired token', () => {
      const isTokenExpired = (expiresAt: string, bufferSeconds: number = 300): boolean => {
        const expiryTime = new Date(expiresAt).getTime();
        const now = Date.now();
        return now >= expiryTime - bufferSeconds * 1000;
      };

      // Expired
      const pastDate = new Date(Date.now() - 3600000).toISOString();
      expect(isTokenExpired(pastDate)).toBe(true);

      // Valid with buffer
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      expect(isTokenExpired(futureDate)).toBe(false);

      // Within buffer period
      const nearExpiry = new Date(Date.now() + 200000).toISOString();
      expect(isTokenExpired(nearExpiry, 300)).toBe(true);
    });

    it('should update stored tokens after refresh', () => {
      const updateTokens = (newTokens: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }) => {
        const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();
        
        return {
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        };
      };

      const tokens = updateTokens({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      });

      expect(tokens.access_token).toBe('new-access-token');
      expect(new Date(tokens.expires_at).getTime()).toBeGreaterThan(Date.now());
    });
  });
});

describe('Batch Processing', () => {
  it('should process deals in batches', () => {
    const processBatch = <T>(items: T[], batchSize: number): T[][] => {
      const batches: T[][] = [];
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
      }
      return batches;
    };

    const deals = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
    const batches = processBatch(deals, 10);

    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(10);
    expect(batches[1]).toHaveLength(10);
    expect(batches[2]).toHaveLength(5);
  });

  it('should aggregate batch results', () => {
    const aggregateResults = (batchResults: Array<{ synced: number; failed: number }>) => {
      return batchResults.reduce(
        (acc, batch) => ({
          synced: acc.synced + batch.synced,
          failed: acc.failed + batch.failed,
        }),
        { synced: 0, failed: 0 }
      );
    };

    const results = [
      { synced: 10, failed: 0 },
      { synced: 9, failed: 1 },
      { synced: 5, failed: 0 },
    ];

    const totals = aggregateResults(results);
    expect(totals.synced).toBe(24);
    expect(totals.failed).toBe(1);
  });
});
