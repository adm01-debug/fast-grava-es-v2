import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showErrorToast, createAppError, createMutationErrorHandler } from '@/lib/errorHandling';
import { defaultQueryOptions, STALE_TIMES } from '@/lib/queryConfig';

const CONVERSATIONS_ERROR_CONTEXT = {
  conversations: { entity: 'technical_conversations', operation: 'fetch' },
  messages: { entity: 'technical_messages', operation: 'fetch' },
  createConversation: { entity: 'technical_conversations', operation: 'create' },
  addMessage: { entity: 'technical_messages', operation: 'create' },
};

export interface TechnicalConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface TechnicalMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const useTechnicalConversations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['technical-conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('technical_conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as TechnicalConversation[];
      } catch (error) {
        const appError = createAppError(error, CONVERSATIONS_ERROR_CONTEXT.conversations);
        if (import.meta.env.DEV) console.error('[useTechnicalConversations]', appError);
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: STALE_TIMES.USER,
    ...defaultQueryOptions,
  });

  const createConversation = useMutation({
    mutationFn: async (title?: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      try {
        const { data, error } = await supabase
          .from('technical_conversations')
          .insert([{ 
            user_id: user.id, 
            title: title || 'Nova conversa' 
          }])
          .select()
          .single();

        if (error) throw error;
        return data as TechnicalConversation;
      } catch (error) {
        const appError = createAppError(error, CONVERSATIONS_ERROR_CONTEXT.createConversation);
        if (import.meta.env.DEV) console.error('[createConversation]', appError);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-conversations'] });
    },
    onError: createMutationErrorHandler('Erro ao criar conversa'),
  });

  const updateConversationTitle = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data, error } = await supabase
        .from('technical_conversations')
        .update({ title })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-conversations'] });
    }
  });

  const deleteConversation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('technical_conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-conversations'] });
    }
  });

  return {
    conversations,
    isLoading,
    createConversation,
    updateConversationTitle,
    deleteConversation
  };
};

export const useTechnicalMessages = (conversationId: string | null) => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['technical-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('technical_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as TechnicalMessage[];
    },
    enabled: !!conversationId
  });

  const addMessage = useMutation({
    mutationFn: async ({ role, content }: { role: 'user' | 'assistant'; content: string }) => {
      if (!conversationId) throw new Error('No conversation selected');
      
      const { data, error } = await supabase
        .from('technical_messages')
        .insert([{ 
          conversation_id: conversationId, 
          role, 
          content 
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Update conversation's updated_at
      await supabase
        .from('technical_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data as TechnicalMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['technical-conversations'] });
    }
  });

  return {
    messages,
    isLoading,
    addMessage
  };
};
