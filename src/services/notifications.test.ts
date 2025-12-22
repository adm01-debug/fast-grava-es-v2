import { describe, it, expect } from 'vitest';
import { notificationsService } from './notifications';

describe('notificationsService', () => {
  it('should have send', () => { expect(notificationsService.send).toBeDefined(); });
  it('should have subscribe', () => { expect(notificationsService.subscribe).toBeDefined(); });
});
