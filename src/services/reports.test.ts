import { describe, it, expect } from 'vitest';
import { reportsService } from './reports';

describe('reportsService', () => {
  it('should have getDailySummary', () => { expect(reportsService.getDailySummary).toBeDefined(); });
  it('should have exportPDF', () => { expect(reportsService.exportPDF).toBeDefined(); });
  it('should have exportExcel', () => { expect(reportsService.exportExcel).toBeDefined(); });
});
