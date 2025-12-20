import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { 
  useTechnicalSheets, 
  useTechnicalSheetDetails,
  useTechnicalSheetMutations,
  TechnicalSheet,
  TechnicalSheetStep,
  TechnicalSheetMaterial,
  TechnicalSheetTip,
} from './useTechnicalSheets';

// Mock data
const mockSupabaseSelect = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseDelete = vi.fn();
const mockSupabaseChannel = vi.fn();
const mockSupabaseRemoveChannel = vi.fn();
const mockGetUser = vi.fn();
const mockToast = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => ({
      select: (fields?: string) => ({
        eq: (field: string, value: any) => ({
          order: (col: string, opts?: any) => mockSupabaseSelect(table, 'list-ordered'),
          maybeSingle: () => mockSupabaseSelect(table, 'single'),
        }),
        order: (col: string, opts?: any) => mockSupabaseSelect(table, 'list'),
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => mockSupabaseInsert(table, data),
        }),
      }),
      update: (data: any) => ({
        eq: (field: string, value: any) => mockSupabaseUpdate(table, data),
      }),
      delete: () => ({
        eq: (field: string, value: any) => mockSupabaseDelete(table),
      }),
    }),
    channel: (name: string) => ({
      on: (event: string, config: any, callback: any) => ({
        subscribe: () => {
          mockSupabaseChannel(name);
          return { unsubscribe: vi.fn() };
        },
      }),
    }),
    removeChannel: mockSupabaseRemoveChannel,
    auth: {
      getUser: mockGetUser,
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/errorHandling', () => ({
  showErrorToast: vi.fn(),
  createAppError: vi.fn((error) => error),
}));

vi.mock('@/lib/queryConfig', () => ({
  defaultQueryOptions: {},
  STALE_TIMES: { STATIC: 300000, DYNAMIC: 30000 },
}));

// Wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Factories
const createMockSheet = (overrides: Partial<TechnicalSheet> = {}): TechnicalSheet => ({
  id: 'sheet-1',
  technique_id: 'tech-1',
  product_category_id: 'cat-1',
  material_id: 'mat-1',
  title: 'Gravação Laser em Caneca',
  description: 'Procedimento padrão',
  estimated_time_minutes: 30,
  recommended_machine_id: 'machine-1',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  techniques: { id: 'tech-1', name: 'Laser', color: '#FF0000', short_name: 'LSR' },
  product_categories: { id: 'cat-1', name: 'Canecas' },
  materials: { id: 'mat-1', name: 'Cerâmica' },
  machines: { id: 'machine-1', name: 'Laser 01', code: 'LSR-01' },
  ...overrides,
});

const createMockStep = (overrides: Partial<TechnicalSheetStep> = {}): TechnicalSheetStep => ({
  id: 'step-1',
  technical_sheet_id: 'sheet-1',
  step_number: 1,
  title: 'Preparação da Superfície',
  description: 'Limpar a caneca com álcool isopropílico',
  tips: 'Use pano sem fiapos',
  warnings: 'Evitar superfícies molhadas',
  ...overrides,
});

const createMockMaterial = (overrides: Partial<TechnicalSheetMaterial> = {}): TechnicalSheetMaterial => ({
  id: 'mat-1',
  technical_sheet_id: 'sheet-1',
  name: 'Álcool Isopropílico',
  specification: '70%',
  quantity: '50ml',
  notes: 'Para limpeza prévia',
  ...overrides,
});

const createMockTip = (overrides: Partial<TechnicalSheetTip> = {}): TechnicalSheetTip => ({
  id: 'tip-1',
  technical_sheet_id: 'sheet-1',
  tip_type: 'tip',
  content: 'Sempre verificar o foco do laser antes de iniciar',
  ...overrides,
});

describe('useTechnicalSheets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseChannel.mockReturnValue({ unsubscribe: vi.fn() });
  });

  describe('Fetching Technical Sheets', () => {
    it('should return empty array initially', async () => {
      mockSupabaseSelect.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useTechnicalSheets(), {
        wrapper: createWrapper(),
      });

      expect(result.current.sheets).toEqual([]);
      expect(result.current.isLoadingSheets).toBe(true);
    });

    it('should fetch and return sheets with relations', async () => {
      const mockSheets = [
        createMockSheet({ id: 'sheet-1', title: 'Gravação Laser' }),
        createMockSheet({ id: 'sheet-2', title: 'Serigrafia' }),
      ];

      mockSupabaseSelect.mockResolvedValue({ data: mockSheets, error: null });

      const { result } = renderHook(() => useTechnicalSheets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.sheets.length).toBe(2);
        expect(result.current.sheets[0].techniques).toBeDefined();
      });
    });

    it('should fetch product categories', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Canecas', description: 'Canecas cerâmicas' },
        { id: 'cat-2', name: 'Copos', description: 'Copos de vidro' },
      ];

      mockSupabaseSelect.mockImplementation((table) => {
        if (table === 'product_categories') {
          return Promise.resolve({ data: mockCategories, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useTechnicalSheets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.categories.length).toBe(2);
      });
    });

    it('should fetch materials list', async () => {
      const mockMaterials = [
        { id: 'mat-1', name: 'Cerâmica', description: null },
        { id: 'mat-2', name: 'Vidro', description: null },
        { id: 'mat-3', name: 'Metal', description: 'Aço inox' },
      ];

      mockSupabaseSelect.mockImplementation((table) => {
        if (table === 'materials') {
          return Promise.resolve({ data: mockMaterials, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useTechnicalSheets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.materials.length).toBe(3);
      });
    });

    it('should handle fetch error gracefully', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      });

      const { result } = renderHook(() => useTechnicalSheets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.sheets).toEqual([]);
      });
    });
  });

  describe('Realtime Subscription', () => {
    it('should subscribe to sheet changes', async () => {
      mockSupabaseSelect.mockResolvedValue({ data: [], error: null });

      renderHook(() => useTechnicalSheets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSupabaseChannel).toHaveBeenCalledWith('technical-sheets-changes');
      });
    });

    it('should cleanup subscription on unmount', async () => {
      mockSupabaseSelect.mockResolvedValue({ data: [], error: null });

      const { unmount } = renderHook(() => useTechnicalSheets(), {
        wrapper: createWrapper(),
      });

      unmount();

      expect(mockSupabaseRemoveChannel).toHaveBeenCalled();
    });
  });

  describe('refetchSheets', () => {
    it('should provide refetch function', async () => {
      mockSupabaseSelect.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useTechnicalSheets(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refetchSheets).toBe('function');
    });
  });
});

describe('useTechnicalSheetDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Without Sheet ID', () => {
    it('should return undefined sheet when no id', () => {
      const { result } = renderHook(() => useTechnicalSheetDetails(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.sheet).toBeUndefined();
      expect(result.current.steps).toEqual([]);
      expect(result.current.sheetMaterials).toEqual([]);
      expect(result.current.tips).toEqual([]);
    });
  });

  describe('With Sheet ID', () => {
    it('should fetch sheet details', async () => {
      const mockSheet = createMockSheet();

      mockSupabaseSelect.mockImplementation((table, type) => {
        if (table === 'technical_sheets' && type === 'single') {
          return Promise.resolve({ data: mockSheet, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useTechnicalSheetDetails('sheet-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.sheet).toBeDefined();
        expect(result.current.sheet?.id).toBe('sheet-1');
        expect(result.current.sheet?.title).toBe('Gravação Laser em Caneca');
      });
    });

    it('should fetch steps ordered by step_number', async () => {
      const mockSteps = [
        createMockStep({ id: 'step-1', step_number: 1, title: 'Preparação' }),
        createMockStep({ id: 'step-2', step_number: 2, title: 'Posicionamento' }),
        createMockStep({ id: 'step-3', step_number: 3, title: 'Gravação' }),
      ];

      mockSupabaseSelect.mockImplementation((table) => {
        if (table === 'technical_sheet_steps') {
          return Promise.resolve({ data: mockSteps, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });

      const { result } = renderHook(() => useTechnicalSheetDetails('sheet-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.steps.length).toBe(3);
        expect(result.current.steps[0].step_number).toBe(1);
      });
    });

    it('should fetch sheet materials', async () => {
      const mockMaterials = [
        createMockMaterial({ id: 'mat-1', name: 'Álcool' }),
        createMockMaterial({ id: 'mat-2', name: 'Pano de limpeza' }),
      ];

      mockSupabaseSelect.mockImplementation((table) => {
        if (table === 'technical_sheet_materials') {
          return Promise.resolve({ data: mockMaterials, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });

      const { result } = renderHook(() => useTechnicalSheetDetails('sheet-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.sheetMaterials.length).toBe(2);
      });
    });

    it('should fetch tips by type', async () => {
      const mockTips = [
        createMockTip({ id: 'tip-1', tip_type: 'tip', content: 'Dica útil' }),
        createMockTip({ id: 'tip-2', tip_type: 'warning', content: 'Atenção!' }),
        createMockTip({ id: 'tip-3', tip_type: 'important', content: 'Importante!' }),
      ];

      mockSupabaseSelect.mockImplementation((table) => {
        if (table === 'technical_sheet_tips') {
          return Promise.resolve({ data: mockTips, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });

      const { result } = renderHook(() => useTechnicalSheetDetails('sheet-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.tips.length).toBe(3);
        expect(result.current.tips.find(t => t.tip_type === 'warning')).toBeDefined();
      });
    });

    it('should return null for non-existent sheet', async () => {
      mockSupabaseSelect.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useTechnicalSheetDetails('non-existent'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.sheet).toBeNull();
      });
    });
  });
});

describe('useTechnicalSheetMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
  });

  describe('createSheet', () => {
    it('should create a new sheet with required fields', async () => {
      const newSheet = createMockSheet({ id: 'new-sheet' });
      mockSupabaseInsert.mockResolvedValue({ data: newSheet, error: null });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createSheet.mutateAsync({
          technique_id: 'tech-1',
          title: 'Nova Ficha Técnica',
        });
      });

      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        'technical_sheets',
        expect.arrayContaining([
          expect.objectContaining({
            technique_id: 'tech-1',
            title: 'Nova Ficha Técnica',
            created_by: 'user-123',
          }),
        ])
      );
    });

    it('should create sheet with all optional fields', async () => {
      const newSheet = createMockSheet();
      mockSupabaseInsert.mockResolvedValue({ data: newSheet, error: null });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createSheet.mutateAsync({
          technique_id: 'tech-1',
          title: 'Ficha Completa',
          description: 'Descrição detalhada',
          product_category_id: 'cat-1',
          material_id: 'mat-1',
          estimated_time_minutes: 45,
          recommended_machine_id: 'machine-1',
        });
      });

      expect(mockSupabaseInsert).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Ficha técnica criada com sucesso!' })
      );
    });

    it('should handle create error', async () => {
      mockSupabaseInsert.mockResolvedValue({ 
        data: null, 
        error: { message: 'Duplicate entry' } 
      });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.createSheet.mutateAsync({
            technique_id: 'tech-1',
            title: 'Duplicada',
          });
        })
      ).rejects.toBeDefined();
    });
  });

  describe('updateSheet', () => {
    it('should update sheet title', async () => {
      mockSupabaseUpdate.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.updateSheet.mutateAsync({
          id: 'sheet-1',
          title: 'Título Atualizado',
        });
      });

      expect(mockSupabaseUpdate).toHaveBeenCalledWith(
        'technical_sheets',
        expect.objectContaining({
          title: 'Título Atualizado',
          updated_by: 'user-123',
        })
      );
    });

    it('should update multiple fields', async () => {
      mockSupabaseUpdate.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.updateSheet.mutateAsync({
          id: 'sheet-1',
          title: 'Novo Título',
          description: 'Nova descrição',
          estimated_time_minutes: 60,
        });
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Ficha técnica atualizada!' })
      );
    });
  });

  describe('deleteSheet (soft delete)', () => {
    it('should soft delete by setting is_active to false', async () => {
      mockSupabaseUpdate.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deleteSheet.mutateAsync('sheet-1');
      });

      expect(mockSupabaseUpdate).toHaveBeenCalledWith(
        'technical_sheets',
        expect.objectContaining({ is_active: false })
      );
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Ficha técnica removida!' })
      );
    });
  });

  describe('Step Management', () => {
    it('should add a new step', async () => {
      const newStep = createMockStep();
      mockSupabaseInsert.mockResolvedValue({ data: newStep, error: null });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.addStep.mutateAsync({
          technical_sheet_id: 'sheet-1',
          step_number: 1,
          title: 'Primeiro Passo',
          description: 'Descrição do passo',
          tips: 'Dica útil',
          warnings: 'Cuidado!',
        });
      });

      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        'technical_sheet_steps',
        expect.any(Array)
      );
    });

    it('should update existing step', async () => {
      mockSupabaseUpdate.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.updateStep.mutateAsync({
          id: 'step-1',
          title: 'Passo Atualizado',
          description: 'Nova descrição',
        });
      });

      expect(mockSupabaseUpdate).toHaveBeenCalledWith(
        'technical_sheet_steps',
        expect.objectContaining({ title: 'Passo Atualizado' })
      );
    });

    it('should delete step', async () => {
      mockSupabaseDelete.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deleteStep.mutateAsync('step-1');
      });

      expect(mockSupabaseDelete).toHaveBeenCalledWith('technical_sheet_steps');
    });
  });

  describe('Material Management', () => {
    it('should add material to sheet', async () => {
      const newMaterial = createMockMaterial();
      mockSupabaseInsert.mockResolvedValue({ data: newMaterial, error: null });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.addMaterial.mutateAsync({
          technical_sheet_id: 'sheet-1',
          name: 'Álcool Isopropílico',
          specification: '70%',
          quantity: '100ml',
          notes: 'Para limpeza',
        });
      });

      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        'technical_sheet_materials',
        expect.any(Array)
      );
    });

    it('should delete material', async () => {
      mockSupabaseDelete.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deleteMaterial.mutateAsync('mat-1');
      });

      expect(mockSupabaseDelete).toHaveBeenCalledWith('technical_sheet_materials');
    });
  });

  describe('Tip Management', () => {
    it('should add tip with type', async () => {
      const newTip = createMockTip({ tip_type: 'warning' });
      mockSupabaseInsert.mockResolvedValue({ data: newTip, error: null });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.addTip.mutateAsync({
          technical_sheet_id: 'sheet-1',
          tip_type: 'warning',
          content: 'Cuidado com a temperatura!',
        });
      });

      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        'technical_sheet_tips',
        expect.arrayContaining([
          expect.objectContaining({
            tip_type: 'warning',
            content: 'Cuidado com a temperatura!',
          }),
        ])
      );
    });

    it('should add important tip', async () => {
      const newTip = createMockTip({ tip_type: 'important' });
      mockSupabaseInsert.mockResolvedValue({ data: newTip, error: null });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.addTip.mutateAsync({
          technical_sheet_id: 'sheet-1',
          tip_type: 'important',
          content: 'Informação crucial para o processo',
        });
      });

      expect(mockSupabaseInsert).toHaveBeenCalled();
    });

    it('should delete tip', async () => {
      mockSupabaseDelete.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useTechnicalSheetMutations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deleteTip.mutateAsync('tip-1');
      });

      expect(mockSupabaseDelete).toHaveBeenCalledWith('technical_sheet_tips');
    });
  });
});
