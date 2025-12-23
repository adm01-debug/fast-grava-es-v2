import { describe, it, expect } from 'vitest';
import { notificationsService } from './notifications';

describe('notificationsService', () => {
  it('should have send', () => { expect(notificationsService.send).toBeDefined(); });
  it('should have getAll', () => { expect(notificationsService.getAll).toBeDefined(); });
  it('should have markAsRead', () => { expect(notificationsService.markAsRead).toBeDefined(); });
});
