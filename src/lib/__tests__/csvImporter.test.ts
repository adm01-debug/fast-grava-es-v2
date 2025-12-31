import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { importCSV, generateCSVTemplate } from './csvImporter';

// Mock papaparse
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn((file, options) => {
      const mockData = [
        { nome: 'Produto 1', codigo: 'P001', preco: '10.50' },
        { nome: 'Produto 2', codigo: 'P002', preco: '20.00' },
        { nome: '', codigo: 'P003', preco: 'invalid' }, // Invalid row
      ];
      
      setTimeout(() => {
        options.complete({ data: mockData });
      }, 0);
    }),
  },
}));

describe('csvImporter', () => {
  const schema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    codigo: z.string().min(1, 'Código é obrigatório'),
    preco: z.coerce.number().positive('Preço deve ser positivo'),
  });

  describe('importCSV', () => {
    it('should parse and validate CSV data', async () => {
      const mockFile = new File([''], 'test.csv', { type: 'text/csv' });
      
      const result = await importCSV(mockFile, schema);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('total');
    });

    it('should return success array with valid rows', async () => {
      const mockFile = new File([''], 'test.csv', { type: 'text/csv' });
      
      const result = await importCSV(mockFile, schema);
      
      expect(result.success.length).toBeGreaterThanOrEqual(0);
    });

    it('should return errors array with invalid rows', async () => {
      const mockFile = new File([''], 'test.csv', { type: 'text/csv' });
      
      const result = await importCSV(mockFile, schema);
      
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('generateCSVTemplate', () => {
    it('should generate CSV template with headers', () => {
      const columns = [
        { name: 'nome', example: 'Produto Exemplo' },
        { name: 'codigo', example: 'P001' },
        { name: 'preco', example: '10.50' },
      ];
      
      const template = generateCSVTemplate(columns);
      
      expect(template).toContain('nome');
      expect(template).toContain('codigo');
      expect(template).toContain('preco');
    });

    it('should include example values in second row', () => {
      const columns = [
        { name: 'nome', example: 'Produto Exemplo' },
        { name: 'codigo', example: 'P001' },
      ];
      
      const template = generateCSVTemplate(columns);
      const lines = template.split('\n');
      
      expect(lines.length).toBe(2);
      expect(lines[1]).toContain('Produto Exemplo');
    });
  });
});
