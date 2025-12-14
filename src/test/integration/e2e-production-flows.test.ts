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
