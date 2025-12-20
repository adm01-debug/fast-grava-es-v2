import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { 
  useTechnicalConversations, 
  useTechnicalMessages,
  TechnicalConversation,
  TechnicalMessage 
} from './useTechnicalConversations';

// Mock data
const mockUser = { id: 'user-123' };
const mockSupabaseQuery = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseDelete = vi.fn();
const mockSupabaseChannel = vi.fn();
const mockSupabaseRemoveChannel = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          order: () => mockSupabaseQuery(table),
        }),
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => mockSupabaseInsert(table, data),
        }),
      }),
      update: (data: any) => ({
        eq: () => ({
          select: () => ({
            maybeSingle: () => mockSupabaseUpdate(table, data),
          }),
          then: (cb: any) => cb({ error: null }),
        }),
      }),
      delete: () => ({
        eq: () => mockSupabaseDelete(table),
      }),
    }),
    channel: (name: string) => ({
      on: () => ({
        subscribe: () => mockSupabaseChannel(name),
      }),
    }),
    removeChannel: mockSupabaseRemoveChannel,
  },
}));

vi.mock('@/lib/errorHandling', () => ({
  showErrorToast: vi.fn(),
  createAppError: vi.fn((error) => error),
  createMutationErrorHandler: vi.fn(() => vi.fn()),
}));

vi.mock('@/lib/queryConfig', () => ({
  defaultQueryOptions: {},
  STALE_TIMES: { USER: 60000, DYNAMIC: 30000 },
}));

// Helper to create wrapper
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

// Mock data factories
const createMockConversation = (overrides: Partial<TechnicalConversation> = {}): TechnicalConversation => ({
  id: 'conv-1',
  user_id: 'user-123',
  title: 'Test Conversation',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

const createMockMessage = (overrides: Partial<TechnicalMessage> = {}): TechnicalMessage => ({
  id: 'msg-1',
  conversation_id: 'conv-1',
  role: 'user',
  content: 'Hello, I need help',
  created_at: new Date().toISOString(),
  ...overrides,
});

describe('useTechnicalConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseChannel.mockReturnValue({ unsubscribe: vi.fn() });
  });

  describe('Fetching Conversations', () => {
    it('should return empty array when no conversations', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useTechnicalConversations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.conversations).toEqual([]);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should fetch and return conversations', async () => {
      const mockConversations = [
        createMockConversation({ id: 'conv-1', title: 'First' }),
        createMockConversation({ id: 'conv-2', title: 'Second' }),
      ];

      mockSupabaseQuery.mockResolvedValue({ data: mockConversations, error: null });

      const { result } = renderHook(() => useTechnicalConversations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.conversations.length).toBe(2);
      });
    });

    it('should handle fetch error', async () => {
      mockSupabaseQuery.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      });

      const { result } = renderHook(() => useTechnicalConversations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.conversations).toEqual([]);
      });
    });
  });

  describe('createConversation', () => {
    it('should create a new conversation with default title', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseInsert.mockResolvedValue({ 
        data: createMockConversation({ title: 'Nova conversa' }), 
        error: null 
      });

      const { result } = renderHook(() => useTechnicalConversations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createConversation.mutateAsync();
      });

      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        'technical_conversations',
        expect.arrayContaining([
          expect.objectContaining({
            user_id: 'user-123',
            title: 'Nova conversa',
          }),
        ])
      );
    });

    it('should create a conversation with custom title', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseInsert.mockResolvedValue({ 
        data: createMockConversation({ title: 'Custom Title' }), 
        error: null 
      });

      const { result } = renderHook(() => useTechnicalConversations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createConversation.mutateAsync('Custom Title');
      });

      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        'technical_conversations',
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Custom Title',
          }),
        ])
      );
    });
  });

  describe('updateConversationTitle', () => {
    it('should update conversation title', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseUpdate.mockResolvedValue({ 
        data: createMockConversation({ title: 'Updated Title' }), 
        error: null 
      });

      const { result } = renderHook(() => useTechnicalConversations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.updateConversationTitle.mutateAsync({
          id: 'conv-1',
          title: 'Updated Title',
        });
      });

      expect(mockSupabaseUpdate).toHaveBeenCalledWith(
        'technical_conversations',
        { title: 'Updated Title' }
      );
    });

    it('should throw error if conversation not found', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseUpdate.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useTechnicalConversations(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.updateConversationTitle.mutateAsync({
            id: 'non-existent',
            title: 'Title',
          });
        })
      ).rejects.toThrow('Conversa não encontrada');
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseDelete.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useTechnicalConversations(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.deleteConversation.mutateAsync('conv-1');
      });

      expect(mockSupabaseDelete).toHaveBeenCalledWith('technical_conversations');
    });
  });

  describe('Realtime Subscription', () => {
    it('should subscribe to conversation changes', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      renderHook(() => useTechnicalConversations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSupabaseChannel).toHaveBeenCalledWith('technical-conversations-changes');
      });
    });

    it('should cleanup subscription on unmount', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { unmount } = renderHook(() => useTechnicalConversations(), {
        wrapper: createWrapper(),
      });

      unmount();

      expect(mockSupabaseRemoveChannel).toHaveBeenCalled();
    });
  });
});

describe('useTechnicalMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Fetching Messages', () => {
    it('should return empty array when no conversationId', async () => {
      const { result } = renderHook(() => useTechnicalMessages(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.messages).toEqual([]);
    });

    it('should fetch messages for conversation', async () => {
      const mockMessages = [
        createMockMessage({ id: 'msg-1', role: 'user', content: 'Hello' }),
        createMockMessage({ id: 'msg-2', role: 'assistant', content: 'Hi there!' }),
      ];

      mockSupabaseQuery.mockResolvedValue({ data: mockMessages, error: null });

      const { result } = renderHook(() => useTechnicalMessages('conv-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.messages.length).toBe(2);
      });
    });
  });

  describe('addMessage', () => {
    it('should add a user message', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseInsert.mockResolvedValue({
        data: createMockMessage({ role: 'user', content: 'Test message' }),
        error: null,
      });

      const { result } = renderHook(() => useTechnicalMessages('conv-1'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.addMessage.mutateAsync({
          role: 'user',
          content: 'Test message',
        });
      });

      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        'technical_messages',
        expect.arrayContaining([
          expect.objectContaining({
            conversation_id: 'conv-1',
            role: 'user',
            content: 'Test message',
          }),
        ])
      );
    });

    it('should add an assistant message', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseInsert.mockResolvedValue({
        data: createMockMessage({ role: 'assistant', content: 'AI response' }),
        error: null,
      });

      const { result } = renderHook(() => useTechnicalMessages('conv-1'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.addMessage.mutateAsync({
          role: 'assistant',
          content: 'AI response',
        });
      });

      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        'technical_messages',
        expect.arrayContaining([
          expect.objectContaining({
            role: 'assistant',
            content: 'AI response',
          }),
        ])
      );
    });

    it('should throw error when no conversation selected', async () => {
      const { result } = renderHook(() => useTechnicalMessages(null), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.addMessage.mutateAsync({
            role: 'user',
            content: 'Test',
          });
        })
      ).rejects.toThrow('No conversation selected');
    });
  });
});
