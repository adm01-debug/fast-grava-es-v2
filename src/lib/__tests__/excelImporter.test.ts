import { describe, it, expect } from 'vitest';
import { getExcelSheets, generateExcelTemplate } from '../excelImporter';

describe('excelImporter', () => {
  describe('generateExcelTemplate', () => {
    it('should return a Blob', () => {
      const columns = [
        { name: 'nome', example: 'Exemplo' },
        { name: 'valor', example: '100' },
      ];
      
      const blob = generateExcelTemplate(columns);
      
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('getExcelSheets', () => {
    it('should return default sheet names', async () => {
      const mockFile = new File(['test'], 'test.xlsx');
      const sheets = await getExcelSheets(mockFile);
      expect(Array.isArray(sheets)).toBe(true);
    });
  });
});
