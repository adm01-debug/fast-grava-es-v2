import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { showErrorToast, createAppError } from '@/lib/errorHandling';
import { defaultQueryOptions, STALE_TIMES } from '@/lib/queryConfig';

const SHEETS_ERROR_CONTEXT = {
  sheets: { entity: 'technical_sheets', operation: 'fetch' },
  sheetDetails: { entity: 'technical_sheets', operation: 'fetch_details' },
  categories: { entity: 'product_categories', operation: 'fetch' },
  materials: { entity: 'materials', operation: 'fetch' },
  steps: { entity: 'technical_sheet_steps', operation: 'fetch' },
  tips: { entity: 'technical_sheet_tips', operation: 'fetch' },
};

export interface TechnicalSheet {
  id: string;
  technique_id: string;
  product_category_id: string | null;
  material_id: string | null;
  title: string;
  description: string | null;
  estimated_time_minutes: number | null;
  recommended_machine_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  techniques?: { id: string; name: string; color: string; short_name: string };
  product_categories?: { id: string; name: string };
  materials?: { id: string; name: string };
  machines?: { id: string; name: string; code: string };
}

export interface TechnicalSheetStep {
  id: string;
  technical_sheet_id: string;
  step_number: number;
  title: string;
  description: string;
  tips: string | null;
  warnings: string | null;
}

export interface TechnicalSheetMaterial {
  id: string;
  technical_sheet_id: string;
  name: string;
  specification: string | null;
  quantity: string | null;
  notes: string | null;
}

export interface TechnicalSheetTip {
  id: string;
  technical_sheet_id: string;
  tip_type: 'tip' | 'warning' | 'important';
  content: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface Material {
  id: string;
  name: string;
  description: string | null;
}

export const useTechnicalSheets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all technical sheets with relations
  const sheetsQuery = useQuery({
    queryKey: ['technical-sheets'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('technical_sheets')
          .select(`
            *,
            techniques (id, name, color, short_name),
            product_categories (id, name),
            materials (id, name),
            machines (id, name, code)
          `)
          .eq('is_active', true)
          .order('technique_id', { ascending: true });

        if (error) throw error;
        return data as TechnicalSheet[];
      } catch (error) {
        const appError = createAppError(error, SHEETS_ERROR_CONTEXT.sheets);
        if (import.meta.env.DEV) console.error('[useTechnicalSheets]', appError);
        throw error;
      }
    },
    staleTime: STALE_TIMES.STATIC,
    ...defaultQueryOptions,
  });

  // Realtime subscription for technical sheets
  useEffect(() => {
    const channel = supabase
      .channel('technical-sheets-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'technical_sheets' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['technical-sheets'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch product categories
  const categoriesQuery = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('product_categories')
          .select('*')
          .order('name');

        if (error) throw error;
        return data as ProductCategory[];
      } catch (error) {
        const appError = createAppError(error, SHEETS_ERROR_CONTEXT.categories);
        if (import.meta.env.DEV) console.error('[useTechnicalSheets:categories]', appError);
        throw error;
      }
    }
  });

  // Fetch materials
  const materialsQuery = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .order('name');

        if (error) throw error;
        return data as Material[];
      } catch (error) {
        const appError = createAppError(error, SHEETS_ERROR_CONTEXT.materials);
        if (import.meta.env.DEV) console.error('[useTechnicalSheets:materials]', appError);
        throw error;
      }
    }
  });

  return {
    sheets: sheetsQuery.data || [],
    isLoadingSheets: sheetsQuery.isLoading,
    categories: categoriesQuery.data || [],
    materials: materialsQuery.data || [],
    refetchSheets: sheetsQuery.refetch
  };
};

export const useTechnicalSheetDetails = (sheetId: string | null) => {
  // Fetch sheet details
  const sheetQuery = useQuery({
    queryKey: ['technical-sheet', sheetId],
    queryFn: async () => {
      if (!sheetId) return null;
      
      const { data, error } = await supabase
        .from('technical_sheets')
        .select(`
          *,
          techniques (id, name, color, short_name),
          product_categories (id, name),
          materials (id, name),
          machines (id, name, code)
        `)
        .eq('id', sheetId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Ficha técnica não encontrada');
      return data as TechnicalSheet;
    },
    enabled: !!sheetId
  });

  // Fetch steps
  const stepsQuery = useQuery({
    queryKey: ['technical-sheet-steps', sheetId],
    queryFn: async () => {
      if (!sheetId) return [];
      
      const { data, error } = await supabase
        .from('technical_sheet_steps')
        .select('*')
        .eq('technical_sheet_id', sheetId)
        .order('step_number');

      if (error) throw error;
      return data as TechnicalSheetStep[];
    },
    enabled: !!sheetId
  });

  // Fetch materials/supplies
  const materialsQuery = useQuery({
    queryKey: ['technical-sheet-materials', sheetId],
    queryFn: async () => {
      if (!sheetId) return [];
      
      const { data, error } = await supabase
        .from('technical_sheet_materials')
        .select('*')
        .eq('technical_sheet_id', sheetId);

      if (error) throw error;
      return data as TechnicalSheetMaterial[];
    },
    enabled: !!sheetId
  });

  // Fetch tips
  const tipsQuery = useQuery({
    queryKey: ['technical-sheet-tips', sheetId],
    queryFn: async () => {
      if (!sheetId) return [];
      
      const { data, error } = await supabase
        .from('technical_sheet_tips')
        .select('*')
        .eq('technical_sheet_id', sheetId);

      if (error) throw error;
      return data as TechnicalSheetTip[];
    },
    enabled: !!sheetId
  });

  return {
    sheet: sheetQuery.data,
    steps: stepsQuery.data || [],
    sheetMaterials: materialsQuery.data || [],
    tips: tipsQuery.data || [],
    isLoading: sheetQuery.isLoading || stepsQuery.isLoading
  };
};

export const useTechnicalSheetMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create sheet
  const createSheet = useMutation({
    mutationFn: async (sheet: { technique_id: string; title: string; description?: string; product_category_id?: string; material_id?: string; estimated_time_minutes?: number; recommended_machine_id?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('technical_sheets')
        .insert([{
          technique_id: sheet.technique_id,
          title: sheet.title,
          description: sheet.description || null,
          product_category_id: sheet.product_category_id || null,
          material_id: sheet.material_id || null,
          estimated_time_minutes: sheet.estimated_time_minutes || null,
          recommended_machine_id: sheet.recommended_machine_id || null,
          created_by: userData.user?.id,
          updated_by: userData.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-sheets'] });
      toast({ title: 'Ficha técnica criada com sucesso!' });
    },
    onError: (error: Error) => {
      const appError = createAppError(error, { entity: 'technical_sheets', operation: 'create' });
      if (import.meta.env.DEV) console.error('[createSheet]', appError);
      toast({ title: 'Erro ao criar ficha', description: error.message, variant: 'destructive' });
    }
  });

  // Update sheet
  const updateSheet = useMutation({
    mutationFn: async ({ id, ...sheet }: Partial<TechnicalSheet> & { id: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('technical_sheets')
        .update({ ...sheet, updated_by: userData.user?.id })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-sheets'] });
      queryClient.invalidateQueries({ queryKey: ['technical-sheet'] });
      toast({ title: 'Ficha técnica atualizada!' });
    },
    onError: (error: Error) => {
      const appError = createAppError(error, { entity: 'technical_sheets', operation: 'update' });
      if (import.meta.env.DEV) console.error('[updateSheet]', appError);
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    }
  });

  // Delete sheet (soft delete)
  const deleteSheet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('technical_sheets')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-sheets'] });
      toast({ title: 'Ficha técnica removida!' });
    },
    onError: (error: Error) => {
      const appError = createAppError(error, { entity: 'technical_sheets', operation: 'delete' });
      if (import.meta.env.DEV) console.error('[deleteSheet]', appError);
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
    }
  });

  // Add step
  const addStep = useMutation({
    mutationFn: async (step: { technical_sheet_id: string; step_number: number; title: string; description: string; tips?: string; warnings?: string }) => {
      const { data, error } = await supabase
        .from('technical_sheet_steps')
        .insert([{
          technical_sheet_id: step.technical_sheet_id,
          step_number: step.step_number,
          title: step.title,
          description: step.description,
          tips: step.tips || null,
          warnings: step.warnings || null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['technical-sheet-steps', variables.technical_sheet_id] });
    }
  });

  // Update step
  const updateStep = useMutation({
    mutationFn: async ({ id, ...step }: Partial<TechnicalSheetStep> & { id: string }) => {
      const { error } = await supabase
        .from('technical_sheet_steps')
        .update(step)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-sheet-steps'] });
    }
  });

  // Delete step
  const deleteStep = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('technical_sheet_steps')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-sheet-steps'] });
    }
  });

  // Add material/supply
  const addMaterial = useMutation({
    mutationFn: async (material: { technical_sheet_id: string; name: string; specification?: string; quantity?: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('technical_sheet_materials')
        .insert([{
          technical_sheet_id: material.technical_sheet_id,
          name: material.name,
          specification: material.specification || null,
          quantity: material.quantity || null,
          notes: material.notes || null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['technical-sheet-materials', variables.technical_sheet_id] });
    }
  });

  // Delete material/supply
  const deleteMaterial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('technical_sheet_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-sheet-materials'] });
    }
  });

  // Add tip
  const addTip = useMutation({
    mutationFn: async (tip: { technical_sheet_id: string; tip_type: 'tip' | 'warning' | 'important'; content: string }) => {
      const { data, error } = await supabase
        .from('technical_sheet_tips')
        .insert([{
          technical_sheet_id: tip.technical_sheet_id,
          tip_type: tip.tip_type,
          content: tip.content
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['technical-sheet-tips', variables.technical_sheet_id] });
    }
  });

  // Delete tip
  const deleteTip = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('technical_sheet_tips')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-sheet-tips'] });
    }
  });

  return {
    createSheet,
    updateSheet,
    deleteSheet,
    addStep,
    updateStep,
    deleteStep,
    addMaterial,
    deleteMaterial,
    addTip,
    deleteTip
  };
};
