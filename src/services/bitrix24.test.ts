import { describe, it, expect } from 'vitest';
import { bitrix24Service } from './bitrix24';

describe('bitrix24Service', () => {
  it('should have getSyncHistory', () => { expect(bitrix24Service.getSyncHistory).toBeDefined(); });
  it('should have getFieldMappings', () => { expect(bitrix24Service.getFieldMappings).toBeDefined(); });
  it('should have triggerSync', () => { expect(bitrix24Service.triggerSync).toBeDefined(); });
});
