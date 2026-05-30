import { describe, it, expect, vi, beforeEach } from 'vitest';

const { saveAsMock } = vi.hoisted(() => ({ saveAsMock: vi.fn() }));
vi.mock('file-saver', () => ({ saveAs: saveAsMock }));

import { objectsToRows, downloadWorkbook } from './excel';

describe('excel helper', () => {
  beforeEach(() => saveAsMock.mockReset());

  describe('objectsToRows', () => {
    it('emits a header row followed by data rows in key order', () => {
      const rows = objectsToRows([
        { name: 'A', value: 1 },
        { name: 'B', value: 2 },
      ]);
      expect(rows).toEqual([
        ['name', 'value'],
        ['A', 1],
        ['B', 2],
      ]);
    });

    it('coerces missing/undefined values to null', () => {
      const rows = objectsToRows([{ a: 1, b: undefined as unknown as number }]);
      expect(rows[1]).toEqual([1, null]);
    });

    it('returns a single empty row for empty input', () => {
      expect(objectsToRows([])).toEqual([[]]);
    });
  });

  describe('downloadWorkbook', () => {
    it('builds a non-empty .xlsx blob and triggers a download', async () => {
      await downloadWorkbook(
        [
          { name: 'Resumo', rows: [['KPI', 'Valor'], ['Produção', 100]] },
          // Name with invalid chars / too long is sanitized, not thrown.
          { name: 'Aba/Inválida:com*nome[muito]longo-demais-pra-caber', rows: [['x']] },
        ],
        'relatorio.xlsx',
      );

      expect(saveAsMock).toHaveBeenCalledTimes(1);
      const [blob, fileName] = saveAsMock.mock.calls[0];
      expect(fileName).toBe('relatorio.xlsx');
      expect(blob).toBeInstanceOf(Blob);
      expect((blob as Blob).size).toBeGreaterThan(0);
    });
  });
});
