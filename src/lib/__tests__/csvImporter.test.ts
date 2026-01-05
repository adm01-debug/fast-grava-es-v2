import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { importCSV, generateCSVTemplate } from '../csvImporter';

describe('csvImporter', () => {
  const schema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    codigo: z.string().min(1, 'Código é obrigatório'),
  });

  describe('generateCSVTemplate', () => {
    it('should generate CSV template with headers', () => {
      const columns = [
        { name: 'nome', example: 'Produto Exemplo' },
        { name: 'codigo', example: 'P001' },
      ];
      
      const template = generateCSVTemplate(columns);
      
      expect(template).toContain('nome');
      expect(template).toContain('codigo');
    });
  });
});
