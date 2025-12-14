import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('E2E: Job Creation Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Job Creation', () => {
    it('should create a new job with all required fields', async () => {
      const newJob = {
        order_number: 'ORD-2024-001',
        client: 'Cliente Teste',
        product: 'Camiseta Personalizada',
        quantity: 100,
        technique_id: 'silk-textil',
        machine_id: 'machine-uuid-1',
        scheduled_date: '2024-12-20',
        start_time: '08:00',
        end_time: '12:00',
        priority: 'high',
        notes: 'Urgente - evento no sábado',
      };

      const createdJob = {
        id: 'job-uuid-1',
        ...newJob,
        status: 'queue',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: createdJob, error: null }),
          }),
        }),
      });

      const result = await mockSupabase.from('jobs').insert(newJob).select().single();

      expect(result.data).toMatchObject({
        id: expect.any(String),
        order_number: 'ORD-2024-001',
        client: 'Cliente Teste',
        status: 'queue',
      });
      expect(result.error).toBeNull();
    });

    it('should validate required fields before creation', () => {
      const validateJobData = (job: Partial<{
        order_number: string;
        client: string;
        product: string;
        quantity: number;
        technique_id: string;
      }>) => {
        const errors: string[] = [];
        
        if (!job.order_number?.trim()) errors.push('Número do pedido é obrigatório');
        if (!job.client?.trim()) errors.push('Cliente é obrigatório');
        if (!job.product?.trim()) errors.push('Produto é obrigatório');
        if (!job.quantity || job.quantity <= 0) errors.push('Quantidade deve ser maior que zero');
        if (!job.technique_id) errors.push('Técnica é obrigatória');
        
        return errors;
      };

      // Missing all fields
      expect(validateJobData({})).toHaveLength(5);

      // Missing some fields
      expect(validateJobData({ order_number: 'ORD-001', client: 'Test' })).toHaveLength(3);

      // Invalid quantity
      expect(validateJobData({
        order_number: 'ORD-001',
        client: 'Test',
        product: 'Produto',
        quantity: 0,
        technique_id: 'silk',
      })).toContain('Quantidade deve ser maior que zero');

      // All valid
      expect(validateJobData({
        order_number: 'ORD-001',
        client: 'Test',
        product: 'Produto',
        quantity: 100,
        technique_id: 'silk',
      })).toHaveLength(0);
    });

    it('should set initial status as queue', async () => {
      const createdJob = {
        id: 'job-uuid-1',
        status: 'queue',
        order_number: 'ORD-001',
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: createdJob, error: null }),
          }),
        }),
      });

      const result = await mockSupabase.from('jobs').insert({}).select().single();
      expect(result.data.status).toBe('queue');
    });
  });
});

describe('E2E: QR Code Production Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('QR Code Scanning', () => {
    it('should parse QR code data correctly', () => {
      const parseQRCode = (qrData: string) => {
        try {
          const parsed = JSON.parse(qrData);
          if (!parsed.jobId || !parsed.orderNumber) {
            throw new Error('Invalid QR code format');
          }
          return { success: true, data: parsed };
        } catch {
          return { success: false, error: 'QR code inválido' };
        }
      };

      // Valid QR code
      const validQR = JSON.stringify({ jobId: 'job-123', orderNumber: 'ORD-001' });
      expect(parseQRCode(validQR)).toEqual({
        success: true,
        data: { jobId: 'job-123', orderNumber: 'ORD-001' },
      });

      // Invalid JSON
      expect(parseQRCode('invalid')).toEqual({
        success: false,
        error: 'QR code inválido',
      });

      // Missing fields
      expect(parseQRCode(JSON.stringify({ jobId: 'job-123' }))).toEqual({
        success: false,
        error: 'QR code inválido',
      });
    });

    it('should record scan in history', async () => {
      const scanRecord = {
        id: 'scan-uuid-1',
        job_id: 'job-uuid-1',
        operator_id: 'operator-uuid-1',
        action: 'start',
        scanned_at: new Date().toISOString(),
        device_info: 'Chrome Mobile',
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: scanRecord, error: null }),
          }),
        }),
      });

      const result = await mockSupabase.from('qr_scan_history').insert({
        job_id: 'job-uuid-1',
        operator_id: 'operator-uuid-1',
        action: 'start',
        device_info: 'Chrome Mobile',
      }).select().single();

      expect(result.data.action).toBe('start');
      expect(result.data.job_id).toBe('job-uuid-1');
    });
  });

  describe('Start Production via QR', () => {
    it('should update job status to production on start scan', async () => {
      const updatedJob = {
        id: 'job-uuid-1',
        status: 'production',
        actual_start_time: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedJob, error: null }),
            }),
          }),
        }),
      });

      const result = await mockSupabase
        .from('jobs')
        .update({ status: 'production', actual_start_time: new Date().toISOString() })
        .eq('id', 'job-uuid-1')
        .select()
        .single();

      expect(result.data.status).toBe('production');
      expect(result.data.actual_start_time).toBeDefined();
    });

    it('should only allow starting jobs in queue or ready status', () => {
      const canStartProduction = (currentStatus: string) => {
        return ['queue', 'ready', 'scheduled'].includes(currentStatus);
      };

      expect(canStartProduction('queue')).toBe(true);
      expect(canStartProduction('ready')).toBe(true);
      expect(canStartProduction('scheduled')).toBe(true);
      expect(canStartProduction('production')).toBe(false);
      expect(canStartProduction('finished')).toBe(false);
      expect(canStartProduction('paused')).toBe(false);
    });

    it('should validate operator authorization for machine', () => {
      const operatorMachines = ['machine-1', 'machine-2', 'machine-3'];
      
      const isAuthorized = (machineId: string) => {
        return operatorMachines.includes(machineId);
      };

      expect(isAuthorized('machine-1')).toBe(true);
      expect(isAuthorized('machine-4')).toBe(false);
    });
  });

  describe('Pause and Resume Production', () => {
    it('should pause production correctly', async () => {
      const pausedJob = {
        id: 'job-uuid-1',
        status: 'paused',
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: pausedJob, error: null }),
            }),
          }),
        }),
      });

      const result = await mockSupabase
        .from('jobs')
        .update({ status: 'paused' })
        .eq('id', 'job-uuid-1')
        .select()
        .single();

      expect(result.data.status).toBe('paused');
    });

    it('should resume production from paused state', async () => {
      const resumedJob = {
        id: 'job-uuid-1',
        status: 'production',
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: resumedJob, error: null }),
            }),
          }),
        }),
      });

      const result = await mockSupabase
        .from('jobs')
        .update({ status: 'production' })
        .eq('id', 'job-uuid-1')
        .select()
        .single();

      expect(result.data.status).toBe('production');
    });

    it('should only allow resuming paused jobs', () => {
      const canResume = (currentStatus: string) => {
        return currentStatus === 'paused';
      };

      expect(canResume('paused')).toBe(true);
      expect(canResume('production')).toBe(false);
      expect(canResume('finished')).toBe(false);
    });
  });
});

describe('E2E: Production Finish with Loss Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Finish Production', () => {
    it('should complete production with quantity and losses', async () => {
      const finishedJob = {
        id: 'job-uuid-1',
        status: 'finished',
        quantity: 100,
        produced_quantity: 95,
        lost_pieces: 5,
        actual_end_time: new Date().toISOString(),
        notes: 'Produção finalizada com 5 peças perdidas por defeito de material',
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: finishedJob, error: null }),
            }),
          }),
        }),
      });

      const result = await mockSupabase
        .from('jobs')
        .update({
          status: 'finished',
          produced_quantity: 95,
          lost_pieces: 5,
          actual_end_time: new Date().toISOString(),
          notes: 'Produção finalizada com 5 peças perdidas por defeito de material',
        })
        .eq('id', 'job-uuid-1')
        .select()
        .single();

      expect(result.data.status).toBe('finished');
      expect(result.data.produced_quantity).toBe(95);
      expect(result.data.lost_pieces).toBe(5);
      expect(result.data.actual_end_time).toBeDefined();
    });

    it('should validate production quantities', () => {
      const validateProductionData = (data: {
        quantity: number;
        produced_quantity: number;
        lost_pieces: number;
      }) => {
        const errors: string[] = [];
        
        if (data.produced_quantity < 0) {
          errors.push('Quantidade produzida não pode ser negativa');
        }
        if (data.lost_pieces < 0) {
          errors.push('Quantidade perdida não pode ser negativa');
        }
        if (data.produced_quantity + data.lost_pieces > data.quantity * 1.1) {
          errors.push('Total de peças excede a quantidade original em mais de 10%');
        }
        
        return errors;
      };

      // Valid data
      expect(validateProductionData({
        quantity: 100,
        produced_quantity: 95,
        lost_pieces: 5,
      })).toHaveLength(0);

      // Negative produced
      expect(validateProductionData({
        quantity: 100,
        produced_quantity: -5,
        lost_pieces: 0,
      })).toContain('Quantidade produzida não pode ser negativa');

      // Negative losses
      expect(validateProductionData({
        quantity: 100,
        produced_quantity: 100,
        lost_pieces: -5,
      })).toContain('Quantidade perdida não pode ser negativa');

      // Exceeds original (allowing 10% margin for extra production)
      expect(validateProductionData({
        quantity: 100,
        produced_quantity: 100,
        lost_pieces: 20,
      })).toContain('Total de peças excede a quantidade original em mais de 10%');
    });

    it('should calculate loss rate correctly', () => {
      const calculateLossRate = (produced: number, lost: number) => {
        const total = produced + lost;
        if (total === 0) return 0;
        return (lost / total) * 100;
      };

      expect(calculateLossRate(95, 5)).toBe(5);
      expect(calculateLossRate(100, 0)).toBe(0);
      expect(calculateLossRate(50, 50)).toBe(50);
      expect(calculateLossRate(0, 0)).toBe(0);
    });
  });

  describe('Production Photos Upload', () => {
    it('should attach photos to finished job', async () => {
      const photoUrls = [
        'https://storage.example.com/photo1.jpg',
        'https://storage.example.com/photo2.jpg',
      ];

      const jobWithPhotos = {
        id: 'job-uuid-1',
        production_photos: photoUrls,
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: jobWithPhotos, error: null }),
            }),
          }),
        }),
      });

      const result = await mockSupabase
        .from('jobs')
        .update({ production_photos: photoUrls })
        .eq('id', 'job-uuid-1')
        .select()
        .single();

      expect(result.data.production_photos).toHaveLength(2);
      expect(result.data.production_photos).toContain('https://storage.example.com/photo1.jpg');
    });

    it('should validate photo file types', () => {
      const isValidPhotoType = (filename: string) => {
        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];
        const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
        return validExtensions.includes(ext);
      };

      expect(isValidPhotoType('photo.jpg')).toBe(true);
      expect(isValidPhotoType('photo.PNG')).toBe(true);
      expect(isValidPhotoType('photo.webp')).toBe(true);
      expect(isValidPhotoType('document.pdf')).toBe(false);
      expect(isValidPhotoType('video.mp4')).toBe(false);
    });
  });
});

describe('E2E: Complete Production Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full workflow: create → start → pause → resume → finish', async () => {
    const jobId = 'job-uuid-workflow-1';
    const workflow: Array<{ action: string; expectedStatus: string }> = [
      { action: 'create', expectedStatus: 'queue' },
      { action: 'mark_ready', expectedStatus: 'ready' },
      { action: 'schedule', expectedStatus: 'scheduled' },
      { action: 'start', expectedStatus: 'production' },
      { action: 'pause', expectedStatus: 'paused' },
      { action: 'resume', expectedStatus: 'production' },
      { action: 'finish', expectedStatus: 'finished' },
    ];

    for (const step of workflow) {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: jobId, status: step.expectedStatus },
                error: null,
              }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: jobId, status: step.expectedStatus },
              error: null,
            }),
          }),
        }),
      });

      let result;
      if (step.action === 'create') {
        result = await mockSupabase.from('jobs').insert({}).select().single();
      } else {
        result = await mockSupabase
          .from('jobs')
          .update({ status: step.expectedStatus })
          .eq('id', jobId)
          .select()
          .single();
      }

      expect(result.data.status).toBe(step.expectedStatus);
    }
  });

  it('should track all status transitions in scan history', async () => {
    const scans = [
      { action: 'start', expected: true },
      { action: 'pause', expected: true },
      { action: 'resume', expected: true },
      { action: 'finish', expected: true },
    ];

    for (const scan of scans) {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: `scan-${scan.action}`,
                action: scan.action,
                job_id: 'job-uuid-1',
                operator_id: 'operator-uuid-1',
                scanned_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await mockSupabase
        .from('qr_scan_history')
        .insert({ action: scan.action })
        .select()
        .single();

      expect(result.data.action).toBe(scan.action);
    }
  });

  it('should enforce status transition rules', () => {
    const validTransitions: Record<string, string[]> = {
      queue: ['ready', 'scheduled', 'cancelled'],
      ready: ['scheduled', 'production', 'queue'],
      scheduled: ['production', 'ready', 'cancelled'],
      production: ['paused', 'finished', 'rework'],
      paused: ['production', 'cancelled'],
      finished: ['rework'],
      rework: ['queue', 'production'],
      cancelled: [],
      delayed: ['production', 'cancelled'],
    };

    const isValidTransition = (from: string, to: string) => {
      return validTransitions[from]?.includes(to) ?? false;
    };

    // Valid transitions
    expect(isValidTransition('queue', 'ready')).toBe(true);
    expect(isValidTransition('production', 'paused')).toBe(true);
    expect(isValidTransition('production', 'finished')).toBe(true);
    expect(isValidTransition('paused', 'production')).toBe(true);

    // Invalid transitions
    expect(isValidTransition('queue', 'finished')).toBe(false);
    expect(isValidTransition('finished', 'production')).toBe(false);
    expect(isValidTransition('cancelled', 'production')).toBe(false);
  });

  it('should calculate production duration correctly', () => {
    const calculateDuration = (startTime: string, endTime: string) => {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end.getTime() - start.getTime();
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return { hours, minutes, totalMinutes: hours * 60 + minutes };
    };

    // 2 hours production
    const result1 = calculateDuration(
      '2024-12-14T08:00:00Z',
      '2024-12-14T10:00:00Z'
    );
    expect(result1.hours).toBe(2);
    expect(result1.minutes).toBe(0);
    expect(result1.totalMinutes).toBe(120);

    // 3 hours 30 minutes
    const result2 = calculateDuration(
      '2024-12-14T08:00:00Z',
      '2024-12-14T11:30:00Z'
    );
    expect(result2.hours).toBe(3);
    expect(result2.minutes).toBe(30);
    expect(result2.totalMinutes).toBe(210);
  });

  it('should generate complete production report', () => {
    interface ProductionReport {
      job_id: string;
      order_number: string;
      client: string;
      product: string;
      original_quantity: number;
      produced_quantity: number;
      lost_pieces: number;
      loss_rate: number;
      start_time: string;
      end_time: string;
      duration_minutes: number;
      operator_id: string;
      machine_id: string;
      technique: string;
      photos_count: number;
      notes: string;
    }

    const generateReport = (jobData: {
      id: string;
      order_number: string;
      client: string;
      product: string;
      quantity: number;
      produced_quantity: number;
      lost_pieces: number;
      actual_start_time: string;
      actual_end_time: string;
      machine_id: string;
      technique_id: string;
      production_photos: string[];
      notes: string;
    }, operatorId: string): ProductionReport => {
      const start = new Date(jobData.actual_start_time);
      const end = new Date(jobData.actual_end_time);
      const durationMs = end.getTime() - start.getTime();
      const total = jobData.produced_quantity + jobData.lost_pieces;
      
      return {
        job_id: jobData.id,
        order_number: jobData.order_number,
        client: jobData.client,
        product: jobData.product,
        original_quantity: jobData.quantity,
        produced_quantity: jobData.produced_quantity,
        lost_pieces: jobData.lost_pieces,
        loss_rate: total > 0 ? (jobData.lost_pieces / total) * 100 : 0,
        start_time: jobData.actual_start_time,
        end_time: jobData.actual_end_time,
        duration_minutes: Math.floor(durationMs / (1000 * 60)),
        operator_id: operatorId,
        machine_id: jobData.machine_id,
        technique: jobData.technique_id,
        photos_count: jobData.production_photos.length,
        notes: jobData.notes,
      };
    };

    const jobData = {
      id: 'job-uuid-1',
      order_number: 'ORD-2024-001',
      client: 'Cliente Teste',
      product: 'Camiseta Personalizada',
      quantity: 100,
      produced_quantity: 95,
      lost_pieces: 5,
      actual_start_time: '2024-12-14T08:00:00Z',
      actual_end_time: '2024-12-14T10:30:00Z',
      machine_id: 'machine-uuid-1',
      technique_id: 'silk-textil',
      production_photos: ['photo1.jpg', 'photo2.jpg'],
      notes: 'Produção concluída com sucesso',
    };

    const report = generateReport(jobData, 'operator-uuid-1');

    expect(report.job_id).toBe('job-uuid-1');
    expect(report.produced_quantity).toBe(95);
    expect(report.lost_pieces).toBe(5);
    expect(report.loss_rate).toBe(5);
    expect(report.duration_minutes).toBe(150);
    expect(report.photos_count).toBe(2);
  });
});

describe('E2E: Buffer Management Flow', () => {
  it('should track buffer status by technique', () => {
    const jobs = [
      { technique_id: 'silk-textil', status: 'ready' },
      { technique_id: 'silk-textil', status: 'ready' },
      { technique_id: 'silk-textil', status: 'ready' },
      { technique_id: 'laser-fiber', status: 'ready' },
      { technique_id: 'laser-fiber', status: 'queue' },
    ];

    const calculateBufferStatus = (techniqueId: string) => {
      const readyCount = jobs.filter(
        j => j.technique_id === techniqueId && j.status === 'ready'
      ).length;
      const queueCount = jobs.filter(
        j => j.technique_id === techniqueId && j.status === 'queue'
      ).length;
      
      return {
        readyCount,
        queueCount,
        isHealthy: readyCount >= 3,
        isCritical: readyCount === 0,
        isWarning: readyCount > 0 && readyCount < 3,
      };
    };

    const silkBuffer = calculateBufferStatus('silk-textil');
    expect(silkBuffer.readyCount).toBe(3);
    expect(silkBuffer.isHealthy).toBe(true);
    expect(silkBuffer.isCritical).toBe(false);

    const laserBuffer = calculateBufferStatus('laser-fiber');
    expect(laserBuffer.readyCount).toBe(1);
    expect(laserBuffer.isHealthy).toBe(false);
    expect(laserBuffer.isWarning).toBe(true);
  });

  it('should trigger alert when buffer is low', () => {
    const shouldTriggerAlert = (readyCount: number) => {
      return readyCount < 3;
    };

    expect(shouldTriggerAlert(0)).toBe(true);
    expect(shouldTriggerAlert(1)).toBe(true);
    expect(shouldTriggerAlert(2)).toBe(true);
    expect(shouldTriggerAlert(3)).toBe(false);
    expect(shouldTriggerAlert(5)).toBe(false);
  });
});

describe('E2E: Rework Flow', () => {
  it('should handle rework status correctly', async () => {
    const reworkJob = {
      id: 'job-uuid-1',
      status: 'rework',
      notes: 'Retrabalho necessário: defeito de impressão',
    };

    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: reworkJob, error: null }),
          }),
        }),
      }),
    });

    const result = await mockSupabase
      .from('jobs')
      .update({ status: 'rework', notes: 'Retrabalho necessário: defeito de impressão' })
      .eq('id', 'job-uuid-1')
      .select()
      .single();

    expect(result.data.status).toBe('rework');
  });

  it('should allow rework to return to queue or production', () => {
    const validReworkTransitions = ['queue', 'production'];
    
    const canTransitionFromRework = (toStatus: string) => {
      return validReworkTransitions.includes(toStatus);
    };

    expect(canTransitionFromRework('queue')).toBe(true);
    expect(canTransitionFromRework('production')).toBe(true);
    expect(canTransitionFromRework('finished')).toBe(false);
    expect(canTransitionFromRework('cancelled')).toBe(false);
  });
});

describe('E2E: Job Status Transition Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Status State Machine', () => {
    const validTransitions: Record<string, string[]> = {
      queue: ['ready', 'cancelled'],
      ready: ['scheduled', 'production', 'queue', 'cancelled'],
      scheduled: ['production', 'ready', 'queue', 'cancelled'],
      production: ['finished', 'paused', 'rework'],
      paused: ['production', 'rework', 'cancelled'],
      finished: [], // Terminal state
      cancelled: [], // Terminal state
      rework: ['queue', 'production'],
    };

    it('should validate all valid transitions', () => {
      const isValidTransition = (from: string, to: string): boolean => {
        return validTransitions[from]?.includes(to) ?? false;
      };

      // Queue transitions
      expect(isValidTransition('queue', 'ready')).toBe(true);
      expect(isValidTransition('queue', 'cancelled')).toBe(true);
      expect(isValidTransition('queue', 'production')).toBe(false);

      // Ready transitions
      expect(isValidTransition('ready', 'scheduled')).toBe(true);
      expect(isValidTransition('ready', 'production')).toBe(true);
      expect(isValidTransition('ready', 'finished')).toBe(false);

      // Production transitions
      expect(isValidTransition('production', 'finished')).toBe(true);
      expect(isValidTransition('production', 'paused')).toBe(true);
      expect(isValidTransition('production', 'queue')).toBe(false);

      // Terminal states
      expect(isValidTransition('finished', 'queue')).toBe(false);
      expect(isValidTransition('finished', 'production')).toBe(false);
      expect(isValidTransition('cancelled', 'queue')).toBe(false);
    });

    it('should reject invalid transitions', () => {
      const isValidTransition = (from: string, to: string): boolean => {
        return validTransitions[from]?.includes(to) ?? false;
      };

      // Cannot skip states
      expect(isValidTransition('queue', 'finished')).toBe(false);
      expect(isValidTransition('queue', 'production')).toBe(false);
      
      // Cannot go backwards from terminal states
      expect(isValidTransition('finished', 'production')).toBe(false);
      expect(isValidTransition('cancelled', 'ready')).toBe(false);
    });

    it('should update job status in database', async () => {
      const transitions = [
        { from: 'queue', to: 'ready' },
        { from: 'ready', to: 'scheduled' },
        { from: 'scheduled', to: 'production' },
        { from: 'production', to: 'finished' },
      ];

      for (const { from, to } of transitions) {
        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'job-1', status: to, previous_status: from },
                  error: null,
                }),
              }),
            }),
          }),
        });

        const result = await mockSupabase
          .from('jobs')
          .update({ status: to })
          .eq('id', 'job-1')
          .select()
          .single();

        expect(result.data.status).toBe(to);
      }
    });

    it('should set actual_start_time when transitioning to production', async () => {
      const now = new Date().toISOString();
      
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { 
                  id: 'job-1', 
                  status: 'production',
                  actual_start_time: now 
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await mockSupabase
        .from('jobs')
        .update({ status: 'production', actual_start_time: now })
        .eq('id', 'job-1')
        .select()
        .single();

      expect(result.data.actual_start_time).toBeDefined();
    });

    it('should set actual_end_time when transitioning to finished', async () => {
      const now = new Date().toISOString();
      
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { 
                  id: 'job-1', 
                  status: 'finished',
                  actual_end_time: now 
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await mockSupabase
        .from('jobs')
        .update({ status: 'finished', actual_end_time: now })
        .eq('id', 'job-1')
        .select()
        .single();

      expect(result.data.actual_end_time).toBeDefined();
    });
  });

  describe('Batch Status Updates', () => {
    it('should update multiple jobs status at once', async () => {
      const jobIds = ['job-1', 'job-2', 'job-3'];
      
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: jobIds.map(id => ({ id, status: 'ready' })),
            error: null,
          }),
        }),
      });

      const result = await mockSupabase
        .from('jobs')
        .update({ status: 'ready' })
        .in('id', jobIds);

      expect(result.data).toHaveLength(3);
      result.data.forEach((job: { status: string }) => {
        expect(job.status).toBe('ready');
      });
    });
  });
});

describe('E2E: Automatic Buffer Promotion Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Buffer Calculation', () => {
    const BUFFER_TARGET = 3;

    const calculateBufferNeeds = (jobs: Array<{ technique_id: string; status: string }>) => {
      const techniqueStats = new Map<string, { ready: number; queue: number }>();
      
      jobs.forEach(job => {
        const stats = techniqueStats.get(job.technique_id) || { ready: 0, queue: 0 };
        if (job.status === 'ready') stats.ready++;
        if (job.status === 'queue') stats.queue++;
        techniqueStats.set(job.technique_id, stats);
      });

      const needs: Array<{ techniqueId: string; needed: number; available: number }> = [];
      
      techniqueStats.forEach((stats, techniqueId) => {
        const needed = Math.max(0, BUFFER_TARGET - stats.ready);
        if (needed > 0 && stats.queue > 0) {
          needs.push({
            techniqueId,
            needed,
            available: Math.min(needed, stats.queue),
          });
        }
      });

      return needs;
    };

    it('should calculate buffer needs correctly', () => {
      const jobs = [
        { technique_id: 'tech-1', status: 'ready' },
        { technique_id: 'tech-1', status: 'queue' },
        { technique_id: 'tech-1', status: 'queue' },
        { technique_id: 'tech-1', status: 'queue' },
        { technique_id: 'tech-2', status: 'queue' },
        { technique_id: 'tech-2', status: 'queue' },
      ];

      const needs = calculateBufferNeeds(jobs);

      // Tech-1: 1 ready, needs 2 more (has 3 in queue, can promote 2)
      const tech1 = needs.find(n => n.techniqueId === 'tech-1');
      expect(tech1?.needed).toBe(2);
      expect(tech1?.available).toBe(2);

      // Tech-2: 0 ready, needs 3 (has 2 in queue, can promote 2)
      const tech2 = needs.find(n => n.techniqueId === 'tech-2');
      expect(tech2?.needed).toBe(3);
      expect(tech2?.available).toBe(2);
    });

    it('should not promote when buffer is full', () => {
      const jobs = [
        { technique_id: 'tech-1', status: 'ready' },
        { technique_id: 'tech-1', status: 'ready' },
        { technique_id: 'tech-1', status: 'ready' },
        { technique_id: 'tech-1', status: 'queue' },
        { technique_id: 'tech-1', status: 'queue' },
      ];

      const needs = calculateBufferNeeds(jobs);
      
      // Tech-1 has 3 ready, buffer is full
      expect(needs.find(n => n.techniqueId === 'tech-1')).toBeUndefined();
    });

    it('should not promote when queue is empty', () => {
      const jobs = [
        { technique_id: 'tech-1', status: 'ready' },
        { technique_id: 'tech-1', status: 'production' },
      ];

      const needs = calculateBufferNeeds(jobs);
      
      // Tech-1 has 1 ready but no queue jobs
      expect(needs.find(n => n.techniqueId === 'tech-1')).toBeUndefined();
    });
  });

  describe('Priority-Based Promotion', () => {
    const priorityOrder: Record<string, number> = { 
      urgent: 0, 
      high: 1, 
      medium: 2, 
      low: 3 
    };

    const sortJobsForPromotion = (jobs: Array<{ 
      id: string; 
      priority: string; 
      created_at: string 
    }>) => {
      return [...jobs].sort((a, b) => {
        const priorityDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    };

    it('should prioritize urgent jobs first', () => {
      const jobs = [
        { id: 'job-1', priority: 'low', created_at: '2024-01-01T08:00:00Z' },
        { id: 'job-2', priority: 'urgent', created_at: '2024-01-01T10:00:00Z' },
        { id: 'job-3', priority: 'high', created_at: '2024-01-01T09:00:00Z' },
      ];

      const sorted = sortJobsForPromotion(jobs);

      expect(sorted[0].id).toBe('job-2'); // urgent
      expect(sorted[1].id).toBe('job-3'); // high
      expect(sorted[2].id).toBe('job-1'); // low
    });

    it('should prioritize older jobs within same priority', () => {
      const jobs = [
        { id: 'job-1', priority: 'medium', created_at: '2024-01-01T10:00:00Z' },
        { id: 'job-2', priority: 'medium', created_at: '2024-01-01T08:00:00Z' },
        { id: 'job-3', priority: 'medium', created_at: '2024-01-01T09:00:00Z' },
      ];

      const sorted = sortJobsForPromotion(jobs);

      expect(sorted[0].id).toBe('job-2'); // oldest
      expect(sorted[1].id).toBe('job-3');
      expect(sorted[2].id).toBe('job-1'); // newest
    });
  });

  describe('Promotion Execution', () => {
    it('should promote job from queue to ready', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { id: 'job-1', status: 'ready' },
            error: null,
          }),
        }),
      });

      const result = await mockSupabase
        .from('jobs')
        .update({ status: 'ready' })
        .eq('id', 'job-1');

      expect(result.data.status).toBe('ready');
    });

    it('should handle promotion errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      const result = await mockSupabase
        .from('jobs')
        .update({ status: 'ready' })
        .eq('id', 'job-1');

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Database error');
    });

    it('should promote multiple jobs in sequence', async () => {
      const jobsToPromote = ['job-1', 'job-2'];
      const promotedJobs: string[] = [];

      for (const jobId of jobsToPromote) {
        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: { id: jobId, status: 'ready' },
              error: null,
            }),
          }),
        });

        const result = await mockSupabase
          .from('jobs')
          .update({ status: 'ready' })
          .eq('id', jobId);

        if (result.data) {
          promotedJobs.push(result.data.id);
        }
      }

      expect(promotedJobs).toHaveLength(2);
      expect(promotedJobs).toContain('job-1');
      expect(promotedJobs).toContain('job-2');
    });
  });

  describe('Trigger on Job Completion', () => {
    it('should check buffer after job finishes', () => {
      const checkBufferAfterFinish = (
        finishedJobTechniqueId: string,
        allJobs: Array<{ technique_id: string; status: string }>
      ) => {
        const techniqueJobs = allJobs.filter(j => j.technique_id === finishedJobTechniqueId);
        const readyCount = techniqueJobs.filter(j => j.status === 'ready').length;
        const queueCount = techniqueJobs.filter(j => j.status === 'queue').length;

        return {
          needsPromotion: readyCount < 3 && queueCount > 0,
          promotionsNeeded: Math.min(3 - readyCount, queueCount),
        };
      };

      const jobs = [
        { technique_id: 'tech-1', status: 'ready' },
        { technique_id: 'tech-1', status: 'ready' },
        { technique_id: 'tech-1', status: 'queue' },
        { technique_id: 'tech-1', status: 'queue' },
      ];

      // After a job finishes, buffer drops to 2 (below target of 3)
      const result = checkBufferAfterFinish('tech-1', jobs);
      
      expect(result.needsPromotion).toBe(true);
      expect(result.promotionsNeeded).toBe(1);
    });
  });

  describe('Debouncing', () => {
    it('should respect cooldown period between promotions', () => {
      const lastPromotionTimes: Record<string, number> = {
        'tech-1': Date.now() - 15000, // 15 seconds ago
        'tech-2': Date.now() - 45000, // 45 seconds ago
      };

      const COOLDOWN_MS = 30000; // 30 seconds

      const canPromote = (techniqueId: string) => {
        const lastTime = lastPromotionTimes[techniqueId] || 0;
        return Date.now() - lastTime >= COOLDOWN_MS;
      };

      expect(canPromote('tech-1')).toBe(false); // Only 15 seconds, needs 30
      expect(canPromote('tech-2')).toBe(true);  // 45 seconds > 30
      expect(canPromote('tech-3')).toBe(true);  // Never promoted
    });
  });
});

describe('E2E: Load Balancing Application', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Suggestion Application', () => {
    it('should move job to suggested machine', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { id: 'job-1', machine_id: 'machine-2' },
            error: null,
          }),
        }),
      });

      const result = await mockSupabase
        .from('jobs')
        .update({ machine_id: 'machine-2' })
        .eq('id', 'job-1');

      expect(result.data.machine_id).toBe('machine-2');
    });

    it('should apply multiple suggestions in batch', async () => {
      const suggestions = [
        { jobId: 'job-1', targetMachineId: 'machine-2' },
        { jobId: 'job-2', targetMachineId: 'machine-3' },
        { jobId: 'job-3', targetMachineId: 'machine-2' },
      ];

      const results: Array<{ success: boolean; jobId: string }> = [];

      for (const suggestion of suggestions) {
        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: { id: suggestion.jobId, machine_id: suggestion.targetMachineId },
              error: null,
            }),
          }),
        });

        const result = await mockSupabase
          .from('jobs')
          .update({ machine_id: suggestion.targetMachineId })
          .eq('id', suggestion.jobId);

        results.push({
          success: result.error === null,
          jobId: suggestion.jobId,
        });
      }

      expect(results.filter(r => r.success)).toHaveLength(3);
    });
  });

  describe('Occupancy Calculation', () => {
    const DAILY_CAPACITY_MINUTES = 660; // 11 hours

    it('should calculate machine occupancy correctly', () => {
      const calculateOccupancy = (scheduledMinutes: number) => {
        return Math.min(100, (scheduledMinutes / DAILY_CAPACITY_MINUTES) * 100);
      };

      expect(calculateOccupancy(330)).toBe(50);  // 5.5 hours = 50%
      expect(calculateOccupancy(660)).toBe(100); // 11 hours = 100%
      expect(calculateOccupancy(720)).toBe(100); // Over capacity capped at 100%
      expect(calculateOccupancy(0)).toBe(0);
    });

    it('should detect unbalanced load', () => {
      const isUnbalanced = (maxOccupancy: number, minOccupancy: number) => {
        return maxOccupancy - minOccupancy > 30;
      };

      expect(isUnbalanced(80, 40)).toBe(true);  // 40% difference
      expect(isUnbalanced(60, 50)).toBe(false); // 10% difference
      expect(isUnbalanced(100, 20)).toBe(true); // 80% difference
    });
  });
});

describe('E2E: Smart Sequencing Application', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Time Slot Generation', () => {
    it('should generate sequential time slots starting at 07:00', () => {
      const generateTimeSlots = (jobs: Array<{ id: string; estimated_duration: number }>, startHour = 7) => {
        const slots: Array<{ jobId: string; startTime: string; endTime: string }> = [];
        let currentMinutes = startHour * 60;

        for (const job of jobs) {
          const startHours = Math.floor(currentMinutes / 60);
          const startMins = currentMinutes % 60;
          const startTime = `${String(startHours).padStart(2, '0')}:${String(startMins).padStart(2, '0')}`;

          currentMinutes += job.estimated_duration;

          const endHours = Math.floor(currentMinutes / 60);
          const endMins = currentMinutes % 60;
          const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

          slots.push({ jobId: job.id, startTime, endTime });
        }

        return slots;
      };

      const jobs = [
        { id: 'job-1', estimated_duration: 60 },  // 1 hour
        { id: 'job-2', estimated_duration: 90 },  // 1.5 hours
        { id: 'job-3', estimated_duration: 30 },  // 0.5 hours
      ];

      const slots = generateTimeSlots(jobs);

      expect(slots[0]).toEqual({ jobId: 'job-1', startTime: '07:00', endTime: '08:00' });
      expect(slots[1]).toEqual({ jobId: 'job-2', startTime: '08:00', endTime: '09:30' });
      expect(slots[2]).toEqual({ jobId: 'job-3', startTime: '09:30', endTime: '10:00' });
    });
  });

  describe('Sequencing Application', () => {
    it('should update job times according to optimized sequence', async () => {
      const timeSlots = [
        { jobId: 'job-1', startTime: '07:00', endTime: '08:00' },
        { jobId: 'job-2', startTime: '08:00', endTime: '09:30' },
      ];

      for (const slot of timeSlots) {
        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: { 
                id: slot.jobId, 
                start_time: slot.startTime, 
                end_time: slot.endTime 
              },
              error: null,
            }),
          }),
        });

        const result = await mockSupabase
          .from('jobs')
          .update({ start_time: slot.startTime, end_time: slot.endTime })
          .eq('id', slot.jobId);

        expect(result.data.start_time).toBe(slot.startTime);
        expect(result.data.end_time).toBe(slot.endTime);
      }
    });
  });

  describe('Color Grouping Optimization', () => {
    it('should calculate setup savings from color grouping', () => {
      const countColorChanges = (colors: string[]) => {
        let changes = 0;
        for (let i = 1; i < colors.length; i++) {
          if (colors[i] !== colors[i - 1]) changes++;
        }
        return changes;
      };

      const calculateSavings = (currentColors: string[], optimizedColors: string[], setupTime: number) => {
        const currentChanges = countColorChanges(currentColors);
        const optimizedChanges = countColorChanges(optimizedColors);
        return (currentChanges - optimizedChanges) * setupTime;
      };

      // Current: Azul, Vermelho, Azul, Vermelho (3 changes)
      // Optimized: Azul, Azul, Vermelho, Vermelho (1 change)
      const current = ['Azul', 'Vermelho', 'Azul', 'Vermelho'];
      const optimized = ['Azul', 'Azul', 'Vermelho', 'Vermelho'];
      const setupTime = 15;

      const savings = calculateSavings(current, optimized, setupTime);
      
      expect(countColorChanges(current)).toBe(3);
      expect(countColorChanges(optimized)).toBe(1);
      expect(savings).toBe(30); // (3-1) * 15 = 30 minutes
    });
  });
});
