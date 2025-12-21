import { describe, it, expect } from 'vitest';
import { reportsService } from './reports';

describe('reportsService', () => {
  it('should have generate', () => { expect(reportsService.generate).toBeDefined(); });
  it('should have exportPDF', () => { expect(reportsService.exportPDF).toBeDefined(); });
});
