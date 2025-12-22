import { describe, it, expect } from 'vitest';
import { bitrix24Service } from './bitrix24';

describe('bitrix24Service', () => {
  it('should have sync', () => { expect(bitrix24Service.sync).toBeDefined(); });
  it('should have getDeals', () => { expect(bitrix24Service.getDeals).toBeDefined(); });
});
