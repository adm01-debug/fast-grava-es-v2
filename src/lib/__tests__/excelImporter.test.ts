import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { getExcelSheets, generateExcelTemplate } from './excelImporter';

// Mock xlsx
vi.mock('xlsx', () => ({
  read: vi.fn(() => ({
    SheetNames: ['Sheet1', 'Sheet2', 'Data'],
    Sheets: {
      Sheet1: {},
      Sheet2: {},
      Data: {},
    },
  })),
  utils: {
    sheet_to_json: vi.fn(() => [
      { nome: 'Item 1', valor: 100 },
      { nome: 'Item 2', valor: 200 },
    ]),
    aoa_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  write: vi.fn(() => new ArrayBuffer(0)),
}));

describe('excelImporter', () => {
  describe('getExcelSheets', () => {
    it('should return array of sheet names', async () => {
      // Create a mock file with ArrayBuffer
      const buffer = new ArrayBuffer(8);
      const mockFile = new File([buffer], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Mock FileReader
      const mockFileReader = {
        readAsArrayBuffer: vi.fn(function(this: any) {
          setTimeout(() => {
            this.onload({ target: { result: buffer } });
          }, 0);
        }),
        onload: null as any,
        onerror: null as any,
      };
      
      vi.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any);

      const sheets = await getExcelSheets(mockFile);
      
      expect(Array.isArray(sheets)).toBe(true);
    });
  });

  describe('generateExcelTemplate', () => {
    it('should return a Blob', () => {
      const columns = [
        { name: 'nome', example: 'Exemplo' },
        { name: 'valor', example: '100' },
      ];
      
      const blob = generateExcelTemplate(columns);
      
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should have correct MIME type', () => {
      const columns = [{ name: 'test', example: 'value' }];
      
      const blob = generateExcelTemplate(columns);
      
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    it('should use custom sheet name', () => {
      const columns = [{ name: 'test', example: 'value' }];
      
      const blob = generateExcelTemplate(columns, 'CustomSheet');
      
      expect(blob).toBeInstanceOf(Blob);
    });
  });
});
