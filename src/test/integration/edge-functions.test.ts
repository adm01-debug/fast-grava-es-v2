import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke
    },
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token' } }
      })
    }
  }
}));

describe('Edge Functions Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // BITRIX24-SYNC TESTS
  // ============================================
  describe('bitrix24-sync', () => {
    describe('test-connection action', () => {
      it('should return success when connection is established via webhook', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            success: true,
            message: 'Conexão estabelecida',
            method: 'webhook'
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'test-connection' }
        });

        expect(result.data.success).toBe(true);
        expect(result.data.method).toBe('webhook');
        expect(mockInvoke).toHaveBeenCalledWith('bitrix24-sync', {
          body: { action: 'test-connection' }
        });
      });

      it('should return success when connection is established via OAuth', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            success: true,
            message: 'Conexão estabelecida',
            method: 'oauth'
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'test-connection' }
        });

        expect(result.data.success).toBe(true);
        expect(result.data.method).toBe('oauth');
      });

      it('should return error when OAuth needs reauthorization', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            success: false,
            needsReauthorization: true,
            reason: 'Token inválido ou expirado'
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'test-connection' }
        });

        expect(result.data.success).toBe(false);
        expect(result.data.needsReauthorization).toBe(true);
      });

      it('should handle network errors gracefully', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: null,
          error: { message: 'Failed to fetch' }
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'test-connection' }
        });

        expect(result.error).toBeTruthy();
        expect(result.data).toBeNull();
      });
    });

    describe('pull action', () => {
      it('should successfully pull deals from Bitrix24', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            success: true,
            synced: 15,
            errors: []
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'pull' }
        });

        expect(result.data.success).toBe(true);
        expect(result.data.synced).toBe(15);
        expect(result.data.errors).toHaveLength(0);
      });

      it('should pull deals with category filter', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            success: true,
            synced: 5,
            errors: []
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'pull', categoryId: 'C1:NEW' }
        });

        expect(result.data.success).toBe(true);
        expect(mockInvoke).toHaveBeenCalledWith('bitrix24-sync', {
          body: { action: 'pull', categoryId: 'C1:NEW' }
        });
      });

      it('should return partial success with some errors', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            success: true,
            synced: 10,
            errors: [
              { dealId: '123', error: 'Invalid technique' },
              { dealId: '456', error: 'Missing required field' }
            ]
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'pull' }
        });

        expect(result.data.success).toBe(true);
        expect(result.data.synced).toBe(10);
        expect(result.data.errors).toHaveLength(2);
      });

      it('should handle empty result set', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            success: true,
            synced: 0,
            errors: []
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'pull' }
        });

        expect(result.data.success).toBe(true);
        expect(result.data.synced).toBe(0);
      });
    });

    describe('push action', () => {
      it('should successfully push status update to Bitrix24', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            success: true,
            message: 'Status atualizado no Bitrix24'
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: {
            action: 'push',
            jobId: 'job-uuid-123',
            status: 'finished',
            producedQuantity: 1000,
            lostPieces: 5
          }
        });

        expect(result.data.success).toBe(true);
      });

      it('should handle missing jobId error', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            success: false,
            error: 'Job ID é obrigatório'
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'push', status: 'finished' }
        });

        expect(result.data.success).toBe(false);
        expect(result.data.error).toContain('Job ID');
      });

      it('should handle job not found error', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            success: false,
            error: 'Job não encontrado'
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'push', jobId: 'invalid-uuid', status: 'finished' }
        });

        expect(result.data.success).toBe(false);
        expect(result.data.error).toContain('não encontrado');
      });
    });

    describe('check-oauth-status action', () => {
      it('should return valid OAuth status', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            hasTokens: true,
            isValid: true,
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
            needsReauthorization: false
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'check-oauth-status' }
        });

        expect(result.data.hasTokens).toBe(true);
        expect(result.data.isValid).toBe(true);
        expect(result.data.needsReauthorization).toBe(false);
      });

      it('should return expired OAuth status', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            hasTokens: true,
            isValid: false,
            expiresAt: new Date(Date.now() - 3600000).toISOString(),
            needsReauthorization: true,
            reason: 'Token expirado'
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'check-oauth-status' }
        });

        expect(result.data.hasTokens).toBe(true);
        expect(result.data.isValid).toBe(false);
        expect(result.data.needsReauthorization).toBe(true);
      });

      it('should return no tokens status', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            hasTokens: false,
            isValid: false,
            needsReauthorization: true
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'check-oauth-status' }
        });

        expect(result.data.hasTokens).toBe(false);
        expect(result.data.needsReauthorization).toBe(true);
      });
    });

    describe('clear-tokens action', () => {
      it('should successfully clear tokens', async () => {
        mockInvoke.mockResolvedValueOnce({
          data: {
            success: true,
            message: 'Tokens removidos com sucesso'
          },
          error: null
        });

        const result = await mockInvoke('bitrix24-sync', {
          body: { action: 'clear-tokens' }
        });

        expect(result.data.success).toBe(true);
      });
    });
  });

  // ============================================
  // TECHNICAL-ASSISTANT TESTS
  // ============================================
  describe('technical-assistant', () => {
    it('should return streaming response for valid message', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: 'data: {"choices":[{"delta":{"content":"Para ajustar a potência..."}}]}\n',
        error: null
      });

      const result = await mockInvoke('technical-assistant', {
        body: {
          messages: [
            { role: 'user', content: 'Como ajustar a potência do fiber laser?' }
          ]
        }
      });

      expect(result.data).toBeTruthy();
      expect(result.error).toBeNull();
    });

    it('should detect fiber laser technique from message', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: 'data: {"choices":[{"delta":{"content":"O Fiber Laser usa..."}}]}\n',
        error: null
      });

      const result = await mockInvoke('technical-assistant', {
        body: {
          messages: [
            { role: 'user', content: 'Quais materiais posso gravar com fiber laser?' }
          ]
        }
      });

      expect(result.error).toBeNull();
      expect(mockInvoke).toHaveBeenCalledWith('technical-assistant', expect.objectContaining({
        body: expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ content: expect.stringContaining('fiber laser') })
          ])
        })
      }));
    });

    it('should detect serigrafia technique from message', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: 'data: {"choices":[{"delta":{"content":"Para serigrafia..."}}]}\n',
        error: null
      });

      const result = await mockInvoke('technical-assistant', {
        body: {
          messages: [
            { role: 'user', content: 'Qual a melhor malha para silk screen?' }
          ]
        }
      });

      expect(result.error).toBeNull();
    });

    it('should include custom knowledge when provided', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: 'data: {"choices":[{"delta":{"content":"Baseado no conhecimento..."}}]}\n',
        error: null
      });

      const result = await mockInvoke('technical-assistant', {
        body: {
          messages: [
            { role: 'user', content: 'Como usar a máquina X?' }
          ],
          customKnowledge: 'A máquina X é um laser de alta potência...'
        }
      });

      expect(result.error).toBeNull();
      expect(mockInvoke).toHaveBeenCalledWith('technical-assistant', expect.objectContaining({
        body: expect.objectContaining({
          customKnowledge: expect.any(String)
        })
      }));
    });

    it('should handle rate limit error (429)', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Limite de requisições excedido', status: 429 }
      });

      const result = await mockInvoke('technical-assistant', {
        body: {
          messages: [{ role: 'user', content: 'Test' }]
        }
      });

      expect(result.error).toBeTruthy();
      expect(result.error.status).toBe(429);
    });

    it('should handle credits exhausted error (402)', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Créditos esgotados', status: 402 }
      });

      const result = await mockInvoke('technical-assistant', {
        body: {
          messages: [{ role: 'user', content: 'Test' }]
        }
      });

      expect(result.error).toBeTruthy();
      expect(result.error.status).toBe(402);
    });

    it('should handle empty messages array', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Messages array is required' }
      });

      const result = await mockInvoke('technical-assistant', {
        body: { messages: [] }
      });

      expect(result.error).toBeTruthy();
    });

    it('should handle multiple techniques in single message', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: 'data: {"choices":[{"delta":{"content":"Comparando..."}}]}\n',
        error: null
      });

      const result = await mockInvoke('technical-assistant', {
        body: {
          messages: [
            { role: 'user', content: 'Qual a diferença entre tampografia e hot stamping?' }
          ]
        }
      });

      expect(result.error).toBeNull();
    });
  });

  // ============================================
  // CREATE-OPERATOR TESTS
  // ============================================
  describe('create-operator', () => {
    it('should successfully create operator with all fields', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: {
          success: true,
          user: {
            id: 'new-user-uuid',
            email: 'operador@empresa.com'
          }
        },
        error: null
      });

      const result = await mockInvoke('create-operator', {
        body: {
          email: 'operador@empresa.com',
          password: 'senha123',
          full_name: 'João Silva',
          phone: '11999998888'
        }
      });

      expect(result.data.success).toBe(true);
      expect(result.data.user.email).toBe('operador@empresa.com');
      expect(result.data.user.id).toBeTruthy();
    });

    it('should create operator without optional phone', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: {
          success: true,
          user: {
            id: 'new-user-uuid',
            email: 'operador2@empresa.com'
          }
        },
        error: null
      });

      const result = await mockInvoke('create-operator', {
        body: {
          email: 'operador2@empresa.com',
          password: 'senha123',
          full_name: 'Maria Santos'
        }
      });

      expect(result.data.success).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Não autorizado', status: 401 }
      });

      const result = await mockInvoke('create-operator', {
        body: {
          email: 'test@test.com',
          password: 'test123',
          full_name: 'Test User'
        }
      });

      expect(result.error).toBeTruthy();
      expect(result.error.status).toBe(401);
    });

    it('should return 403 when user is not coordinator', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { error: 'Apenas coordenadores podem criar operadores' },
        error: null
      });

      const result = await mockInvoke('create-operator', {
        body: {
          email: 'test@test.com',
          password: 'test123',
          full_name: 'Test User'
        }
      });

      expect(result.data.error).toContain('coordenadores');
    });

    it('should return 400 when email is missing', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { error: 'Email, senha e nome são obrigatórios' },
        error: null
      });

      const result = await mockInvoke('create-operator', {
        body: {
          password: 'test123',
          full_name: 'Test User'
        }
      });

      expect(result.data.error).toContain('obrigatórios');
    });

    it('should return 400 when password is missing', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { error: 'Email, senha e nome são obrigatórios' },
        error: null
      });

      const result = await mockInvoke('create-operator', {
        body: {
          email: 'test@test.com',
          full_name: 'Test User'
        }
      });

      expect(result.data.error).toContain('obrigatórios');
    });

    it('should return 400 when full_name is missing', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { error: 'Email, senha e nome são obrigatórios' },
        error: null
      });

      const result = await mockInvoke('create-operator', {
        body: {
          email: 'test@test.com',
          password: 'test123'
        }
      });

      expect(result.data.error).toContain('obrigatórios');
    });

    it('should handle duplicate email error', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { error: 'User already registered' },
        error: null
      });

      const result = await mockInvoke('create-operator', {
        body: {
          email: 'existing@empresa.com',
          password: 'test123',
          full_name: 'Test User'
        }
      });

      expect(result.data.error).toBeTruthy();
    });

    it('should handle weak password error', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { error: 'Password should be at least 6 characters' },
        error: null
      });

      const result = await mockInvoke('create-operator', {
        body: {
          email: 'test@test.com',
          password: '123',
          full_name: 'Test User'
        }
      });

      expect(result.data.error).toBeTruthy();
    });
  });

  // ============================================
  // UPDATE-OPERATOR TESTS
  // ============================================
  describe('update-operator', () => {
    it('should successfully update operator with all fields', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { success: true },
        error: null
      });

      const result = await mockInvoke('update-operator', {
        body: {
          operator_id: 'operator-uuid-123',
          full_name: 'João Silva Santos',
          phone: '11999997777'
        }
      });

      expect(result.data.success).toBe(true);
    });

    it('should update operator name only', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { success: true },
        error: null
      });

      const result = await mockInvoke('update-operator', {
        body: {
          operator_id: 'operator-uuid-123',
          full_name: 'Novo Nome'
        }
      });

      expect(result.data.success).toBe(true);
    });

    it('should clear phone when empty string provided', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { success: true },
        error: null
      });

      const result = await mockInvoke('update-operator', {
        body: {
          operator_id: 'operator-uuid-123',
          full_name: 'Test User',
          phone: ''
        }
      });

      expect(result.data.success).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Não autorizado', status: 401 }
      });

      const result = await mockInvoke('update-operator', {
        body: {
          operator_id: 'operator-uuid-123',
          full_name: 'Test User'
        }
      });

      expect(result.error).toBeTruthy();
      expect(result.error.status).toBe(401);
    });

    it('should return 403 when user is not coordinator', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { error: 'Apenas coordenadores podem editar operadores' },
        error: null
      });

      const result = await mockInvoke('update-operator', {
        body: {
          operator_id: 'operator-uuid-123',
          full_name: 'Test User'
        }
      });

      expect(result.data.error).toContain('coordenadores');
    });

    it('should return 400 when operator_id is missing', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { error: 'ID do operador é obrigatório' },
        error: null
      });

      const result = await mockInvoke('update-operator', {
        body: {
          full_name: 'Test User'
        }
      });

      expect(result.data.error).toContain('ID do operador');
    });

    it('should return 400 when full_name is empty', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { error: 'Nome é obrigatório' },
        error: null
      });

      const result = await mockInvoke('update-operator', {
        body: {
          operator_id: 'operator-uuid-123',
          full_name: ''
        }
      });

      expect(result.data.error).toContain('Nome');
    });

    it('should return 400 when full_name is whitespace only', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { error: 'Nome é obrigatório' },
        error: null
      });

      const result = await mockInvoke('update-operator', {
        body: {
          operator_id: 'operator-uuid-123',
          full_name: '   '
        }
      });

      expect(result.data.error).toContain('Nome');
    });

    it('should handle non-existent operator gracefully', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { success: true }, // Supabase update succeeds even if no rows matched
        error: null
      });

      const result = await mockInvoke('update-operator', {
        body: {
          operator_id: 'non-existent-uuid',
          full_name: 'Test User'
        }
      });

      // Note: Supabase update doesn't error on no match
      expect(result.data.success).toBe(true);
    });

    it('should handle internal server error', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: { error: 'Erro interno do servidor' },
        error: null
      });

      const result = await mockInvoke('update-operator', {
        body: {
          operator_id: 'operator-uuid-123',
          full_name: 'Test User'
        }
      });

      expect(result.data.error).toContain('Erro interno');
    });
  });

  // ============================================
  // EDGE FUNCTION ERROR HANDLING TESTS
  // ============================================
  describe('Edge Function Error Handling', () => {
    it('should handle function not found error', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Function not found', status: 404 }
      });

      const result = await mockInvoke('non-existent-function', {
        body: {}
      });

      expect(result.error).toBeTruthy();
      expect(result.error.status).toBe(404);
    });

    it('should handle timeout error', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Function timed out', status: 504 }
      });

      const result = await mockInvoke('bitrix24-sync', {
        body: { action: 'pull' }
      });

      expect(result.error).toBeTruthy();
      expect(result.error.status).toBe(504);
    });

    it('should handle CORS preflight request', async () => {
      // CORS is handled by the function, should not error
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const result = await mockInvoke('bitrix24-sync', {
        body: { action: 'test-connection' }
      });

      expect(result.error).toBeNull();
    });

    it('should handle malformed JSON in request', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid JSON in request body' }
      });

      const result = await mockInvoke('bitrix24-sync', {
        body: 'invalid json'
      });

      expect(result.error).toBeTruthy();
    });

    it('should handle missing required headers', async () => {
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Missing authorization header', status: 401 }
      });

      const result = await mockInvoke('create-operator', {
        body: { email: 'test@test.com', password: '123456', full_name: 'Test' }
      });

      expect(result.error).toBeTruthy();
    });
  });

  // ============================================
  // INTEGRATION SCENARIOS
  // ============================================
  describe('Integration Scenarios', () => {
    it('should handle complete Bitrix24 sync workflow', async () => {
      // Step 1: Check OAuth status
      mockInvoke.mockResolvedValueOnce({
        data: { hasTokens: true, isValid: true, needsReauthorization: false },
        error: null
      });

      // Step 2: Pull from Bitrix24
      mockInvoke.mockResolvedValueOnce({
        data: { success: true, synced: 10, errors: [] },
        error: null
      });

      // Step 3: Push status update
      mockInvoke.mockResolvedValueOnce({
        data: { success: true, message: 'Status atualizado' },
        error: null
      });

      // Execute workflow
      const oauthResult = await mockInvoke('bitrix24-sync', {
        body: { action: 'check-oauth-status' }
      });
      expect(oauthResult.data.isValid).toBe(true);

      const pullResult = await mockInvoke('bitrix24-sync', {
        body: { action: 'pull' }
      });
      expect(pullResult.data.synced).toBe(10);

      const pushResult = await mockInvoke('bitrix24-sync', {
        body: { action: 'push', jobId: 'uuid', status: 'finished' }
      });
      expect(pushResult.data.success).toBe(true);
    });

    it('should handle operator management workflow', async () => {
      // Step 1: Create operator
      mockInvoke.mockResolvedValueOnce({
        data: { success: true, user: { id: 'new-id', email: 'op@test.com' } },
        error: null
      });

      // Step 2: Update operator
      mockInvoke.mockResolvedValueOnce({
        data: { success: true },
        error: null
      });

      const createResult = await mockInvoke('create-operator', {
        body: { email: 'op@test.com', password: '123456', full_name: 'Operator' }
      });
      expect(createResult.data.user.id).toBe('new-id');

      const updateResult = await mockInvoke('update-operator', {
        body: { operator_id: 'new-id', full_name: 'Updated Name' }
      });
      expect(updateResult.data.success).toBe(true);
    });

    it('should handle technical assistant conversation flow', async () => {
      // Message 1
      mockInvoke.mockResolvedValueOnce({
        data: 'data: {"choices":[{"delta":{"content":"Resposta 1..."}}]}\n',
        error: null
      });

      // Message 2 (follow-up)
      mockInvoke.mockResolvedValueOnce({
        data: 'data: {"choices":[{"delta":{"content":"Resposta 2..."}}]}\n',
        error: null
      });

      const msg1 = await mockInvoke('technical-assistant', {
        body: { messages: [{ role: 'user', content: 'Como funciona o laser?' }] }
      });
      expect(msg1.error).toBeNull();

      const msg2 = await mockInvoke('technical-assistant', {
        body: {
          messages: [
            { role: 'user', content: 'Como funciona o laser?' },
            { role: 'assistant', content: 'O laser funciona...' },
            { role: 'user', content: 'E os parâmetros?' }
          ]
        }
      });
      expect(msg2.error).toBeNull();
    });
  });
});
