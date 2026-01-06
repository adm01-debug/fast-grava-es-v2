import * as React from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface OptimisticUpdateOptions<TData, TVariables> {
  queryKey: string | string[];
  mutationFn: (variables: TVariables) => Promise<TData>;
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<TData, TVariables>({
  queryKey,
  mutationFn,
  updateFn,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: OptimisticUpdateOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
      const previousData = queryClient.getQueryData<TData>(
        Array.isArray(queryKey) ? queryKey : [queryKey]
      );
      queryClient.setQueryData(
        Array.isArray(queryKey) ? queryKey : [queryKey],
        (old: TData | undefined) => updateFn(old, variables)
      );
      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          Array.isArray(queryKey) ? queryKey : [queryKey],
          context.previousData
        );
      }
      toast({
        title: "Erro",
        description: errorMessage || "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive",
      });
      onError?.(error as Error, variables);
    },
    onSuccess: (data, variables) => {
      if (successMessage) {
        toast({ title: "Sucesso", description: successMessage });
      }
      onSuccess?.(data, variables);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
    },
  });
}
