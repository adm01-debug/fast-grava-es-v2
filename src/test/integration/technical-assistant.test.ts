import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==========================================
// TECHNICAL ASSISTANT AI TESTS
// ==========================================

describe('Technical Assistant AI', () => {
  describe('Technique Detection', () => {
    const detectTechnique = (message: string): string[] => {
      const techniques: string[] = [];
      const lowerMessage = message.toLowerCase();
      
      const techniqueKeywords: Record<string, string[]> = {
        fiber_laser: ['fiber', 'fibra', 'laser fibra', 'marcação laser', 'gravação metal'],
        co2_laser: ['co2', 'laser co2', 'corte laser', 'acrílico', 'madeira'],
        uv_laser: ['uv', 'laser uv', 'ultravioleta'],
        silk_textil: ['silk', 'serigrafia', 'têxtil', 'camiseta', 'tecido'],
        silk_vinilico: ['vinílico', 'vinil', 'adesivo'],
        tampografia: ['tampografia', 'tampo', 'impressão tampográfica'],
        hot_stamping: ['hot stamping', 'foil', 'douração'],
        dtf: ['dtf', 'direct to film', 'transfer digital'],
        sublimacao: ['sublimação', 'sublimar', 'caneca', 'poliéster'],
        prensa_termica: ['prensa', 'térmica', 'transfer'],
        decalque: ['decalque', 'forno', 'cerâmica', 'vidro'],
      };
      
      for (const [technique, keywords] of Object.entries(techniqueKeywords)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          techniques.push(technique);
        }
      }
      
      return techniques;
    };

    it('should detect fiber laser technique from message', () => {
      const message = 'Como fazer gravação em metal com laser fibra?';
      const detected = detectTechnique(message);
      
      expect(detected).toContain('fiber_laser');
    });

    it('should detect silk screen technique', () => {
      const message = 'Quero imprimir em camiseta com serigrafia';
      const detected = detectTechnique(message);
      
      expect(detected).toContain('silk_textil');
    });

    it('should detect multiple techniques in same message', () => {
      const message = 'Qual a diferença entre sublimação e DTF para tecidos?';
      const detected = detectTechnique(message);
      
      expect(detected).toContain('sublimacao');
      expect(detected).toContain('dtf');
    });

    it('should return empty array for unrelated message', () => {
      const message = 'Qual o horário de funcionamento?';
      const detected = detectTechnique(message);
      
      expect(detected).toHaveLength(0);
    });

    it('should be case insensitive', () => {
      const message = 'COMO USAR LASER FIBRA?';
      const detected = detectTechnique(message);
      
      expect(detected).toContain('fiber_laser');
    });
  });

  describe('System Prompt Construction', () => {
    const buildSystemPrompt = (
      basePrompt: string,
      techniqueKnowledge: Record<string, string>,
      detectedTechniques: string[]
    ): string => {
      let prompt = basePrompt;
      
      for (const technique of detectedTechniques) {
        if (techniqueKnowledge[technique]) {
          prompt += `\n\n## Conhecimento sobre ${technique}:\n${techniqueKnowledge[technique]}`;
        }
      }
      
      return prompt;
    };

    it('should include base system prompt', () => {
      const basePrompt = 'Você é um assistente técnico especializado.';
      const prompt = buildSystemPrompt(basePrompt, {}, []);
      
      expect(prompt).toContain('Você é um assistente técnico especializado.');
    });

    it('should append technique-specific knowledge', () => {
      const basePrompt = 'Você é um assistente técnico.';
      const knowledge = {
        fiber_laser: 'Laser de fibra usa comprimento de onda de 1064nm.',
      };
      
      const prompt = buildSystemPrompt(basePrompt, knowledge, ['fiber_laser']);
      
      expect(prompt).toContain('1064nm');
      expect(prompt).toContain('fiber_laser');
    });

    it('should include multiple technique knowledge sections', () => {
      const basePrompt = 'Base prompt';
      const knowledge = {
        silk_textil: 'Serigrafia usa telas de poliéster.',
        dtf: 'DTF usa filme PET para transferência.',
      };
      
      const prompt = buildSystemPrompt(basePrompt, knowledge, ['silk_textil', 'dtf']);
      
      expect(prompt).toContain('poliéster');
      expect(prompt).toContain('PET');
    });
  });

  describe('Response Streaming', () => {
    const parseSSEChunk = (chunk: string): string | null => {
      if (chunk.startsWith(':') || chunk.trim() === '') return null;
      if (!chunk.startsWith('data: ')) return null;
      
      const jsonStr = chunk.slice(6).trim();
      if (jsonStr === '[DONE]') return null;
      
      try {
        const parsed = JSON.parse(jsonStr);
        return parsed.choices?.[0]?.delta?.content || null;
      } catch {
        return null;
      }
    };

    it('should parse valid SSE delta chunk', () => {
      const chunk = 'data: {"choices":[{"delta":{"content":"Olá"}}]}';
      const content = parseSSEChunk(chunk);
      
      expect(content).toBe('Olá');
    });

    it('should handle [DONE] signal', () => {
      const chunk = 'data: [DONE]';
      const content = parseSSEChunk(chunk);
      
      expect(content).toBeNull();
    });

    it('should ignore SSE comments', () => {
      const chunk = ': ping';
      const content = parseSSEChunk(chunk);
      
      expect(content).toBeNull();
    });

    it('should ignore empty lines', () => {
      const chunk = '';
      const content = parseSSEChunk(chunk);
      
      expect(content).toBeNull();
    });

    it('should handle malformed JSON gracefully', () => {
      const chunk = 'data: {invalid json}';
      const content = parseSSEChunk(chunk);
      
      expect(content).toBeNull();
    });

    it('should handle chunk without content delta', () => {
      const chunk = 'data: {"choices":[{"delta":{}}]}';
      const content = parseSSEChunk(chunk);
      
      expect(content).toBeNull();
    });
  });

  describe('Message Accumulation', () => {
    const accumulateMessage = (chunks: string[]): string => {
      return chunks.filter(Boolean).join('');
    };

    it('should accumulate multiple text chunks', () => {
      const chunks = ['Olá', ', ', 'como', ' posso', ' ajudar?'];
      const message = accumulateMessage(chunks);
      
      expect(message).toBe('Olá, como posso ajudar?');
    });

    it('should handle empty chunks', () => {
      const chunks = ['Texto', '', 'mais texto'];
      const message = accumulateMessage(chunks);
      
      expect(message).toBe('Textomais texto');
    });
  });
});

// ==========================================
// CONVERSATION MANAGEMENT TESTS
// ==========================================

describe('Conversation Management', () => {
  describe('Conversation Creation', () => {
    it('should create conversation with default title', () => {
      const createConversation = (userId: string, title?: string) => ({
        id: 'conv-123',
        user_id: userId,
        title: title || 'Nova conversa',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      const conversation = createConversation('user-1');
      
      expect(conversation.title).toBe('Nova conversa');
      expect(conversation.user_id).toBe('user-1');
    });

    it('should create conversation with custom title', () => {
      const createConversation = (userId: string, title?: string) => ({
        id: 'conv-123',
        user_id: userId,
        title: title || 'Nova conversa',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      const conversation = createConversation('user-1', 'Dúvidas sobre laser');
      
      expect(conversation.title).toBe('Dúvidas sobre laser');
    });
  });

  describe('Conversation Filtering', () => {
    const mockConversations = [
      { id: '1', title: 'Laser fibra parâmetros', created_at: '2025-01-10T10:00:00Z', updated_at: '2025-01-10T12:00:00Z' },
      { id: '2', title: 'Serigrafia cores', created_at: '2025-01-08T10:00:00Z', updated_at: '2025-01-08T14:00:00Z' },
      { id: '3', title: 'DTF materiais', created_at: '2025-01-12T10:00:00Z', updated_at: '2025-01-12T11:00:00Z' },
    ];

    it('should filter conversations by search query', () => {
      const filterByQuery = (conversations: typeof mockConversations, query: string) => {
        if (!query) return conversations;
        return conversations.filter(c => 
          c.title.toLowerCase().includes(query.toLowerCase())
        );
      };
      
      const filtered = filterByQuery(mockConversations, 'laser');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toContain('Laser');
    });

    it('should filter conversations by date range', () => {
      const filterByDate = (
        conversations: typeof mockConversations,
        filter: 'today' | 'week' | 'month' | 'all'
      ) => {
        if (filter === 'all') return conversations;
        
        const now = new Date('2025-01-12T15:00:00Z');
        const cutoff = new Date(now);
        
        switch (filter) {
          case 'today':
            cutoff.setHours(0, 0, 0, 0);
            break;
          case 'week':
            cutoff.setDate(cutoff.getDate() - 7);
            break;
          case 'month':
            cutoff.setMonth(cutoff.getMonth() - 1);
            break;
        }
        
        return conversations.filter(c => new Date(c.updated_at) >= cutoff);
      };
      
      const filtered = filterByDate(mockConversations, 'week');
      
      expect(filtered.length).toBeGreaterThanOrEqual(2);
    });

    it('should return all conversations when no filter applied', () => {
      const filterByQuery = (conversations: typeof mockConversations, query: string) => {
        if (!query) return conversations;
        return conversations.filter(c => 
          c.title.toLowerCase().includes(query.toLowerCase())
        );
      };
      
      const filtered = filterByQuery(mockConversations, '');
      
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Message Search Within Conversation', () => {
    const mockMessages = [
      { id: '1', content: 'Como ajustar potência do laser?', role: 'user' },
      { id: '2', content: 'A potência do laser fibra pode ser ajustada...', role: 'assistant' },
      { id: '3', content: 'E a velocidade?', role: 'user' },
      { id: '4', content: 'A velocidade de marcação depende do material...', role: 'assistant' },
    ];

    it('should find messages matching search query', () => {
      const searchMessages = (messages: typeof mockMessages, query: string) => {
        if (!query) return [];
        return messages.filter(m => 
          m.content.toLowerCase().includes(query.toLowerCase())
        );
      };
      
      const results = searchMessages(mockMessages, 'potência');
      
      expect(results).toHaveLength(2);
    });

    it('should return indices of matching messages', () => {
      const getMatchingIndices = (messages: typeof mockMessages, query: string) => {
        if (!query) return [];
        return messages
          .map((m, i) => m.content.toLowerCase().includes(query.toLowerCase()) ? i : -1)
          .filter(i => i !== -1);
      };
      
      const indices = getMatchingIndices(mockMessages, 'velocidade');
      
      expect(indices).toContain(2);
      expect(indices).toContain(3);
    });

    it('should navigate between search matches', () => {
      const navigateMatches = (
        currentIndex: number,
        matchingIndices: number[],
        direction: 'next' | 'prev'
      ): number => {
        if (matchingIndices.length === 0) return -1;
        
        const currentPos = matchingIndices.indexOf(currentIndex);
        
        if (direction === 'next') {
          if (currentPos === -1 || currentPos === matchingIndices.length - 1) {
            return matchingIndices[0];
          }
          return matchingIndices[currentPos + 1];
        } else {
          if (currentPos === -1 || currentPos === 0) {
            return matchingIndices[matchingIndices.length - 1];
          }
          return matchingIndices[currentPos - 1];
        }
      };
      
      const indices = [1, 3];
      
      expect(navigateMatches(1, indices, 'next')).toBe(3);
      expect(navigateMatches(3, indices, 'next')).toBe(1);
      expect(navigateMatches(3, indices, 'prev')).toBe(1);
    });
  });
});

// ==========================================
// TECHNICAL KNOWLEDGE BASE TESTS
// ==========================================

describe('Technical Knowledge Base', () => {
  describe('Technical Sheet Structure', () => {
    interface TechnicalSheet {
      id: string;
      title: string;
      technique_id: string;
      product_category_id?: string;
      material_id?: string;
      description?: string;
      estimated_time_minutes?: number;
      is_active: boolean;
    }

    it('should validate required fields', () => {
      const validateSheet = (sheet: Partial<TechnicalSheet>): string[] => {
        const errors: string[] = [];
        
        if (!sheet.title?.trim()) errors.push('Título é obrigatório');
        if (!sheet.technique_id) errors.push('Técnica é obrigatória');
        
        return errors;
      };
      
      const invalidSheet = { title: '', technique_id: '' };
      const errors = validateSheet(invalidSheet);
      
      expect(errors).toContain('Título é obrigatório');
      expect(errors).toContain('Técnica é obrigatória');
    });

    it('should validate estimated time is positive', () => {
      const validateSheet = (sheet: Partial<TechnicalSheet>): string[] => {
        const errors: string[] = [];
        
        if (sheet.estimated_time_minutes !== undefined && sheet.estimated_time_minutes <= 0) {
          errors.push('Tempo estimado deve ser positivo');
        }
        
        return errors;
      };
      
      const sheet = { estimated_time_minutes: -5 };
      const errors = validateSheet(sheet);
      
      expect(errors).toContain('Tempo estimado deve ser positivo');
    });
  });

  describe('Sheet Steps Management', () => {
    interface SheetStep {
      id: string;
      step_number: number;
      title: string;
      description: string;
      tips?: string;
      warnings?: string;
    }

    it('should order steps by step_number', () => {
      const orderSteps = (steps: SheetStep[]): SheetStep[] => {
        return [...steps].sort((a, b) => a.step_number - b.step_number);
      };
      
      const unordered: SheetStep[] = [
        { id: '1', step_number: 3, title: 'Passo 3', description: 'Desc 3' },
        { id: '2', step_number: 1, title: 'Passo 1', description: 'Desc 1' },
        { id: '3', step_number: 2, title: 'Passo 2', description: 'Desc 2' },
      ];
      
      const ordered = orderSteps(unordered);
      
      expect(ordered[0].step_number).toBe(1);
      expect(ordered[1].step_number).toBe(2);
      expect(ordered[2].step_number).toBe(3);
    });

    it('should validate step has title and description', () => {
      const validateStep = (step: Partial<SheetStep>): string[] => {
        const errors: string[] = [];
        
        if (!step.title?.trim()) errors.push('Título do passo é obrigatório');
        if (!step.description?.trim()) errors.push('Descrição do passo é obrigatória');
        
        return errors;
      };
      
      const invalidStep = { title: '', description: '' };
      const errors = validateStep(invalidStep);
      
      expect(errors).toHaveLength(2);
    });

    it('should reorder steps when one is removed', () => {
      const reorderAfterRemoval = (steps: SheetStep[], removedIndex: number): SheetStep[] => {
        return steps
          .filter((_, i) => i !== removedIndex)
          .map((step, i) => ({ ...step, step_number: i + 1 }));
      };
      
      const steps: SheetStep[] = [
        { id: '1', step_number: 1, title: 'Passo 1', description: 'Desc' },
        { id: '2', step_number: 2, title: 'Passo 2', description: 'Desc' },
        { id: '3', step_number: 3, title: 'Passo 3', description: 'Desc' },
      ];
      
      const reordered = reorderAfterRemoval(steps, 1);
      
      expect(reordered).toHaveLength(2);
      expect(reordered[0].step_number).toBe(1);
      expect(reordered[1].step_number).toBe(2);
    });
  });

  describe('Sheet Materials Management', () => {
    interface SheetMaterial {
      id: string;
      name: string;
      quantity?: string;
      specification?: string;
      notes?: string;
    }

    it('should validate material has name', () => {
      const validateMaterial = (material: Partial<SheetMaterial>): boolean => {
        return !!material.name?.trim();
      };
      
      expect(validateMaterial({ name: 'Tinta' })).toBe(true);
      expect(validateMaterial({ name: '' })).toBe(false);
      expect(validateMaterial({})).toBe(false);
    });

    it('should format material with quantity and specification', () => {
      const formatMaterial = (material: SheetMaterial): string => {
        let text = material.name;
        if (material.quantity) text += ` (${material.quantity})`;
        if (material.specification) text += ` - ${material.specification}`;
        return text;
      };
      
      const material: SheetMaterial = {
        id: '1',
        name: 'Tinta plastisol',
        quantity: '500ml',
        specification: 'Cor branca',
      };
      
      const formatted = formatMaterial(material);
      
      expect(formatted).toBe('Tinta plastisol (500ml) - Cor branca');
    });
  });

  describe('Sheet Tips Management', () => {
    interface SheetTip {
      id: string;
      tip_type: 'tip' | 'warning' | 'important' | 'note';
      content: string;
    }

    it('should categorize tips by type', () => {
      const categorizeTips = (tips: SheetTip[]) => {
        return {
          tips: tips.filter(t => t.tip_type === 'tip'),
          warnings: tips.filter(t => t.tip_type === 'warning'),
          important: tips.filter(t => t.tip_type === 'important'),
          notes: tips.filter(t => t.tip_type === 'note'),
        };
      };
      
      const allTips: SheetTip[] = [
        { id: '1', tip_type: 'tip', content: 'Dica útil' },
        { id: '2', tip_type: 'warning', content: 'Atenção!' },
        { id: '3', tip_type: 'tip', content: 'Outra dica' },
        { id: '4', tip_type: 'important', content: 'Importante!' },
      ];
      
      const categorized = categorizeTips(allTips);
      
      expect(categorized.tips).toHaveLength(2);
      expect(categorized.warnings).toHaveLength(1);
      expect(categorized.important).toHaveLength(1);
      expect(categorized.notes).toHaveLength(0);
    });

    it('should assign correct icon for tip type', () => {
      const getTipIcon = (type: SheetTip['tip_type']): string => {
        switch (type) {
          case 'warning': return 'AlertTriangle';
          case 'important': return 'AlertCircle';
          case 'note': return 'Info';
          case 'tip': 
          default: return 'Lightbulb';
        }
      };
      
      expect(getTipIcon('warning')).toBe('AlertTriangle');
      expect(getTipIcon('important')).toBe('AlertCircle');
      expect(getTipIcon('tip')).toBe('Lightbulb');
    });
  });

  describe('Knowledge Base Search', () => {
    const mockSheets = [
      { id: '1', title: 'Serigrafia em Camiseta', technique_id: 'silk', description: 'Processo para algodão' },
      { id: '2', title: 'Laser em Metal', technique_id: 'fiber_laser', description: 'Gravação em aço' },
      { id: '3', title: 'Sublimação em Caneca', technique_id: 'sublimacao', description: 'Poliéster coating' },
    ];

    it('should search sheets by title', () => {
      const searchSheets = (sheets: typeof mockSheets, query: string) => {
        if (!query) return sheets;
        const lower = query.toLowerCase();
        return sheets.filter(s => 
          s.title.toLowerCase().includes(lower) ||
          s.description?.toLowerCase().includes(lower)
        );
      };
      
      const results = searchSheets(mockSheets, 'camiseta');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('Camiseta');
    });

    it('should search sheets by description', () => {
      const searchSheets = (sheets: typeof mockSheets, query: string) => {
        if (!query) return sheets;
        const lower = query.toLowerCase();
        return sheets.filter(s => 
          s.title.toLowerCase().includes(lower) ||
          s.description?.toLowerCase().includes(lower)
        );
      };
      
      const results = searchSheets(mockSheets, 'aço');
      
      expect(results).toHaveLength(1);
      expect(results[0].technique_id).toBe('fiber_laser');
    });

    it('should filter sheets by technique', () => {
      const filterByTechnique = (sheets: typeof mockSheets, techniqueId: string) => {
        if (!techniqueId) return sheets;
        return sheets.filter(s => s.technique_id === techniqueId);
      };
      
      const filtered = filterByTechnique(mockSheets, 'silk');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toContain('Serigrafia');
    });

    it('should group sheets by technique', () => {
      const groupByTechnique = (sheets: typeof mockSheets) => {
        return sheets.reduce((acc, sheet) => {
          if (!acc[sheet.technique_id]) {
            acc[sheet.technique_id] = [];
          }
          acc[sheet.technique_id].push(sheet);
          return acc;
        }, {} as Record<string, typeof mockSheets>);
      };
      
      const grouped = groupByTechnique(mockSheets);
      
      expect(Object.keys(grouped)).toHaveLength(3);
      expect(grouped['silk']).toHaveLength(1);
    });
  });
});

// ==========================================
// AI RESPONSE QUALITY TESTS
// ==========================================

describe('AI Response Quality', () => {
  describe('Response Formatting', () => {
    it('should detect markdown code blocks', () => {
      const hasCodeBlock = (text: string): boolean => {
        return /```[\s\S]*```/.test(text);
      };
      
      const withCode = 'Aqui está um exemplo:\n```python\nprint("Hello")\n```';
      const withoutCode = 'Este é um texto simples sem código.';
      
      expect(hasCodeBlock(withCode)).toBe(true);
      expect(hasCodeBlock(withoutCode)).toBe(false);
    });

    it('should detect bullet lists in response', () => {
      const hasBulletList = (text: string): boolean => {
        return /^[\s]*[-*•]\s/m.test(text);
      };
      
      const withList = 'Passos:\n- Primeiro passo\n- Segundo passo';
      const withoutList = 'Este é um parágrafo normal.';
      
      expect(hasBulletList(withList)).toBe(true);
      expect(hasBulletList(withoutList)).toBe(false);
    });

    it('should detect numbered lists', () => {
      const hasNumberedList = (text: string): boolean => {
        return /^[\s]*\d+[.)]\s/m.test(text);
      };
      
      const withNumbered = 'Passos:\n1. Primeiro\n2. Segundo';
      const withoutNumbered = 'Texto sem lista numerada.';
      
      expect(hasNumberedList(withNumbered)).toBe(true);
      expect(hasNumberedList(withoutNumbered)).toBe(false);
    });
  });

  describe('Response Relevance', () => {
    it('should check if response mentions detected technique', () => {
      const mentionsTechnique = (response: string, technique: string): boolean => {
        const techniqueTerms: Record<string, string[]> = {
          fiber_laser: ['laser', 'fibra', 'marcação', 'gravação'],
          silk_textil: ['serigrafia', 'silk', 'tela', 'tinta'],
          sublimacao: ['sublimação', 'sublimar', 'transfer'],
        };
        
        const terms = techniqueTerms[technique] || [];
        const lowerResponse = response.toLowerCase();
        
        return terms.some(term => lowerResponse.includes(term));
      };
      
      const response = 'Para gravação com laser de fibra, ajuste a potência...';
      
      expect(mentionsTechnique(response, 'fiber_laser')).toBe(true);
      expect(mentionsTechnique(response, 'sublimacao')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should provide fallback message on API error', () => {
      const getFallbackMessage = (errorType: string): string => {
        switch (errorType) {
          case 'rate_limit':
            return 'Limite de requisições excedido. Aguarde um momento e tente novamente.';
          case 'timeout':
            return 'A requisição demorou muito. Tente novamente.';
          case 'server_error':
            return 'Erro no servidor. Tente novamente mais tarde.';
          default:
            return 'Ocorreu um erro. Por favor, tente novamente.';
        }
      };
      
      expect(getFallbackMessage('rate_limit')).toContain('Limite');
      expect(getFallbackMessage('timeout')).toContain('demorou');
      expect(getFallbackMessage('unknown')).toContain('erro');
    });

    it('should detect rate limit error from response', () => {
      const isRateLimitError = (status: number, body?: any): boolean => {
        return status === 429 || body?.error?.type === 'rate_limit_exceeded';
      };
      
      expect(isRateLimitError(429)).toBe(true);
      expect(isRateLimitError(200, { error: { type: 'rate_limit_exceeded' } })).toBe(true);
      expect(isRateLimitError(500)).toBe(false);
    });
  });
});

// ==========================================
// CONVERSATION PERSISTENCE TESTS
// ==========================================

describe('Conversation Persistence', () => {
  describe('Auto-save Behavior', () => {
    it('should determine when to auto-save conversation title', () => {
      const shouldAutoSaveTitle = (
        currentTitle: string,
        firstUserMessage: string,
        messageCount: number
      ): boolean => {
        // Auto-save title when it's default and there's a first message
        return currentTitle === 'Nova conversa' && messageCount >= 1 && !!firstUserMessage;
      };
      
      expect(shouldAutoSaveTitle('Nova conversa', 'Como usar laser?', 1)).toBe(true);
      expect(shouldAutoSaveTitle('Minha conversa', 'Como usar laser?', 1)).toBe(false);
      expect(shouldAutoSaveTitle('Nova conversa', '', 0)).toBe(false);
    });

    it('should generate title from first message', () => {
      const generateTitle = (message: string, maxLength: number = 50): string => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength - 3) + '...';
      };
      
      const shortMessage = 'Dúvida sobre laser';
      const longMessage = 'Qual é a melhor configuração de potência para gravação em aço inoxidável usando laser de fibra?';
      
      expect(generateTitle(shortMessage)).toBe('Dúvida sobre laser');
      expect(generateTitle(longMessage).length).toBeLessThanOrEqual(50);
      expect(generateTitle(longMessage)).toContain('...');
    });
  });

  describe('Message Ordering', () => {
    it('should order messages by created_at ascending', () => {
      const messages = [
        { id: '1', created_at: '2025-01-01T10:05:00Z', content: 'Third' },
        { id: '2', created_at: '2025-01-01T10:00:00Z', content: 'First' },
        { id: '3', created_at: '2025-01-01T10:02:00Z', content: 'Second' },
      ];
      
      const ordered = [...messages].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      expect(ordered[0].content).toBe('First');
      expect(ordered[1].content).toBe('Second');
      expect(ordered[2].content).toBe('Third');
    });
  });

  describe('Conversation Deletion', () => {
    it('should cascade delete messages when conversation is deleted', () => {
      // Simulating cascade behavior
      const deleteConversation = (
        conversations: { id: string }[],
        messages: { conversation_id: string }[],
        conversationId: string
      ) => {
        return {
          conversations: conversations.filter(c => c.id !== conversationId),
          messages: messages.filter(m => m.conversation_id !== conversationId),
        };
      };
      
      const conversations = [{ id: 'conv-1' }, { id: 'conv-2' }];
      const messages = [
        { conversation_id: 'conv-1' },
        { conversation_id: 'conv-1' },
        { conversation_id: 'conv-2' },
      ];
      
      const result = deleteConversation(conversations, messages, 'conv-1');
      
      expect(result.conversations).toHaveLength(1);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].conversation_id).toBe('conv-2');
    });
  });
});
