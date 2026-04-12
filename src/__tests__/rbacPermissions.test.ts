import { describe, it, expect } from 'vitest';
import { ROLE_PERMISSIONS } from '@/hooks/useRBAC';

describe('RBAC Permission Matrix', () => {
  describe('coordinator permissions', () => {
    const perms = ROLE_PERMISSIONS.coordinator;

    it('has full CRUD on jobs', () => {
      expect(perms).toContain('jobs:read');
      expect(perms).toContain('jobs:create');
      expect(perms).toContain('jobs:update');
      expect(perms).toContain('jobs:delete');
    });

    it('has user management', () => {
      expect(perms).toContain('users:create');
      expect(perms).toContain('users:delete');
      expect(perms).toContain('users:change_role');
    });

    it('has full machine CRUD', () => {
      expect(perms).toContain('machines:create');
      expect(perms).toContain('machines:delete');
    });

    it('has audit access', () => {
      expect(perms).toContain('audit:read');
    });

    it('can approve technical sheets', () => {
      expect(perms).toContain('technical_sheets:approve');
    });
  });

  describe('manager permissions', () => {
    const perms = ROLE_PERMISSIONS.manager;

    it('can read and create jobs but not delete', () => {
      expect(perms).toContain('jobs:read');
      expect(perms).toContain('jobs:create');
      expect(perms).not.toContain('jobs:delete');
    });

    it('cannot manage users', () => {
      expect(perms).not.toContain('users:create');
      expect(perms).not.toContain('users:delete');
      expect(perms).not.toContain('users:change_role');
    });

    it('can export reports', () => {
      expect(perms).toContain('reports:export');
    });

    it('can manage SPC and shifts', () => {
      expect(perms).toContain('spc:manage');
      expect(perms).toContain('shifts:manage');
    });
  });

  describe('operator permissions', () => {
    const perms = ROLE_PERMISSIONS.operator;

    it('has limited read access', () => {
      expect(perms).toContain('jobs:read');
      expect(perms).toContain('machines:read');
      expect(perms).toContain('technical_sheets:read');
    });

    it('can update jobs (progress) but not create or delete', () => {
      expect(perms).toContain('jobs:update');
      expect(perms).not.toContain('jobs:create');
      expect(perms).not.toContain('jobs:delete');
    });

    it('cannot access reports, settings, or user management', () => {
      expect(perms).not.toContain('reports:read');
      expect(perms).not.toContain('settings:read');
      expect(perms).not.toContain('users:read');
    });

    it('can create quality inspections', () => {
      expect(perms).toContain('quality:create');
    });

    it('cannot manage machines', () => {
      expect(perms).not.toContain('machines:create');
      expect(perms).not.toContain('machines:update');
      expect(perms).not.toContain('machines:delete');
    });
  });

  describe('role hierarchy', () => {
    it('coordinator has more permissions than manager', () => {
      expect(ROLE_PERMISSIONS.coordinator.length).toBeGreaterThan(ROLE_PERMISSIONS.manager.length);
    });

    it('manager has more permissions than operator', () => {
      expect(ROLE_PERMISSIONS.manager.length).toBeGreaterThan(ROLE_PERMISSIONS.operator.length);
    });

    it('all operator perms are subset of coordinator perms', () => {
      for (const perm of ROLE_PERMISSIONS.operator) {
        expect(ROLE_PERMISSIONS.coordinator).toContain(perm);
      }
    });
  });
});
