import { test, expect } from 'vitest';
import { type AppRole } from './auth.types';

// Mock check for admin bypass logic
function checkBypass(role: AppRole | null, allowedRoles?: AppRole[]) {
  if (role === 'admin') return true;
  if (!allowedRoles) return true;
  return allowedRoles.includes(role as AppRole);
}

test('Admin role should always have bypass on protected routes', () => {
  const adminRole: AppRole = 'admin';
  const operatorRole: AppRole = 'operator';
  const managerRole: AppRole = 'manager';
  
  // Test various allowed roles scenarios
  expect(checkBypass(adminRole, ['operator'])).toBe(true);
  expect(checkBypass(adminRole, ['manager', 'coordinator'])).toBe(true);
  expect(checkBypass(adminRole, [])).toBe(true);
  
  // Control tests
  expect(checkBypass(operatorRole, ['manager'])).toBe(false);
  expect(checkBypass(managerRole, ['manager'])).toBe(true);
});
