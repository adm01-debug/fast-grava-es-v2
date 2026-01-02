import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock XLSX
vi.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

// Mock window
const mockCreateObjectURL = vi.fn(() => 'blob:url');
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('dataExporter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('should export CSV with correct headers', async () => {
    const { exportToCSV } = await import('./dataExporter');
    const data = [{ name: 'Test', value: 100 }];
    const columns = [{ key: 'name', header: 'Name' }, { key: 'value', header: 'Value' }];
    
    const clickSpy = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({ click: clickSpy, href: '', download: '' } as any);
    
    exportToCSV(data, columns, { filename: 'test' });
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('should export Excel', async () => {
    const { exportToExcel } = await import('./dataExporter');
    const data = [{ name: 'Test', value: 100 }];
    const columns = [{ key: 'name', header: 'Name' }, { key: 'value', header: 'Value' }];
    
    exportToExcel(data, columns, { filename: 'test' });
    const XLSX = await import('xlsx');
    expect(XLSX.writeFile).toHaveBeenCalled();
  });
});
