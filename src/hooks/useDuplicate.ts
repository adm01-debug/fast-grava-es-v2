import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DuplicateOptions<T> {
  tableName: string;
  queryKey: string[];
  excludeFields?: (keyof T)[];
  transformData?: (data: T) => Partial<T>;
  generateNewName?: (originalName: string) => string;
  nameField?: keyof T;
}

export function useDuplicate<T extends { id: string }>(
  options: DuplicateOptions<T>
) {
  const {
    tableName,
    queryKey,
    excludeFields = ['id', 'created_at', 'updated_at'] as (keyof T)[],
    transformData,
    generateNewName = (name) => `${name} (Cópia)`,
    nameField,
  } = options;

  const queryClient = useQueryClient();

  const duplicateMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      // Fetch original data using type assertion for dynamic table access
      const { data: original, error: fetchError } = await (supabase
        .from(tableName as 'jobs')
        .select('*')
        .eq('id', sourceId)
        .single() as unknown as Promise<{ data: Record<string, unknown> | null; error: Error | null }>);

      if (fetchError) throw fetchError;
      if (!original) throw new Error('Registro não encontrado');

      // Prepare duplicate data
      let duplicateData = { ...original } as Record<string, unknown>;

      // Remove excluded fields
      excludeFields.forEach(field => {
        delete duplicateData[field as string];
      });

      // Apply custom transformation
      if (transformData) {
        duplicateData = { ...duplicateData, ...transformData(original as unknown as T) };
      }

      // Generate new name if nameField is specified
      if (nameField && duplicateData[nameField as string]) {
        duplicateData[nameField as string] = generateNewName(
          duplicateData[nameField as string] as string
        );
      }

      // Insert duplicate
      const { data: newRecord, error: insertError } = await (supabase
        .from(tableName as 'jobs')
        .insert(duplicateData as never)
        .select()
        .single() as unknown as Promise<{ data: Record<string, unknown> | null; error: Error | null }>);

      if (insertError) throw insertError;

      return newRecord as unknown as T;
    },
    onSuccess: (newRecord) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Registro duplicado com sucesso!');
      return newRecord;
    },
    onError: (error: Error) => {
      console.error('Erro ao duplicar:', error);
      toast.error('Erro ao duplicar registro');
    },
  });

  // Bulk duplicate
  const bulkDuplicateMutation = useMutation({
    mutationFn: async (sourceIds: string[]) => {
      const results: T[] = [];

      for (const id of sourceIds) {
        // Fetch original
        const { data: original, error: fetchError } = await (supabase
          .from(tableName as 'jobs')
          .select('*')
          .eq('id', id)
          .single() as unknown as Promise<{ data: Record<string, unknown> | null; error: Error | null }>);

        if (fetchError || !original) continue;

        // Prepare duplicate
        let duplicateData = { ...original } as Record<string, unknown>;
        excludeFields.forEach(field => {
          delete duplicateData[field as string];
        });

        if (transformData) {
          duplicateData = { ...duplicateData, ...transformData(original as unknown as T) };
        }

        if (nameField && duplicateData[nameField as string]) {
          duplicateData[nameField as string] = generateNewName(
            duplicateData[nameField as string] as string
          );
        }

        // Insert
        const { data: newRecord, error: insertError } = await (supabase
          .from(tableName as 'jobs')
          .insert(duplicateData as never)
          .select()
          .single() as unknown as Promise<{ data: Record<string, unknown> | null; error: Error | null }>);

        if (!insertError && newRecord) {
          results.push(newRecord as unknown as T);
        }
      }

      return results;
    },
    onSuccess: (newRecords) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`${newRecords.length} registros duplicados`);
    },
    onError: (error: Error) => {
      toast.error('Erro ao duplicar registros');
    },
  });

  return {
    duplicate: duplicateMutation.mutate,
    duplicateAsync: duplicateMutation.mutateAsync,
    bulkDuplicate: bulkDuplicateMutation.mutate,
    bulkDuplicateAsync: bulkDuplicateMutation.mutateAsync,
    isDuplicating: duplicateMutation.isPending || bulkDuplicateMutation.isPending,
  };
}
