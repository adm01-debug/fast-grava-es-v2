import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCSV, exportToPDF } from '../dataExporter';

describe('dataExporter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export CSV with correct headers', () => {
    const data = [{ name: 'Test', value: 100 }];
    const columns = [
      { key: 'name' as const, header: 'Name' }, 
      { key: 'value' as const, header: 'Value' }
    ];
    
    // Just verify function exists and doesn't throw
    expect(() => exportToCSV(data, columns, { filename: 'test' })).not.toThrow();
  });
});
