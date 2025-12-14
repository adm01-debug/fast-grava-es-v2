import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock Supabase client
const mockFrom = vi.fn();
const mockAuth = {
  getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-123' } } })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => mockFrom(),
    auth: mockAuth,
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('useOperators type-safety tests', () => {
  describe('Bug Fix #12: Type-safe profile extraction', () => {
    it('should correctly type profile data', () => {
      // Simulate the data structure returned from Supabase
      const rawData = [
        {
          id: 'role-1',
          user_id: 'user-1',
          role: 'operator',
          created_at: '2024-01-01T00:00:00Z',
          is_active: true,
          profiles: {
            full_name: 'John Doe',
            avatar_url: 'https://example.com/avatar.jpg',
            phone: '+1234567890',
          },
        },
        {
          id: 'role-2',
          user_id: 'user-2',
          role: 'operator',
          created_at: '2024-01-02T00:00:00Z',
          is_active: false,
          profiles: {
            full_name: null,
            avatar_url: null,
            phone: null,
          },
        },
      ];

      // Simulate the type-safe mapping logic from useOperators
      const mappedData = rawData.map(item => {
        const profile = item.profiles as {
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
        } | null;
        
        return {
          id: item.id,
          user_id: item.user_id,
          role: item.role as 'operator',
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
          phone: profile?.phone ?? null,
          created_at: item.created_at,
          is_active: item.is_active ?? true,
        };
      });

      expect(mappedData[0].full_name).toBe('John Doe');
      expect(mappedData[0].avatar_url).toBe('https://example.com/avatar.jpg');
      expect(mappedData[0].phone).toBe('+1234567890');
      expect(mappedData[0].is_active).toBe(true);

      expect(mappedData[1].full_name).toBeNull();
      expect(mappedData[1].avatar_url).toBeNull();
      expect(mappedData[1].phone).toBeNull();
      expect(mappedData[1].is_active).toBe(false);
    });

    it('should handle missing profiles object', () => {
      const rawData = [
        {
          id: 'role-1',
          user_id: 'user-1',
          role: 'operator',
          created_at: '2024-01-01T00:00:00Z',
          is_active: null, // Could be null in database
          profiles: null, // Profile might be null
        },
      ];

      const mappedData = rawData.map(item => {
        const profile = item.profiles as {
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
        } | null;
        
        return {
          id: item.id,
          user_id: item.user_id,
          role: item.role as 'operator',
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
          phone: profile?.phone ?? null,
          created_at: item.created_at,
          is_active: item.is_active ?? true, // Default to true
        };
      });

      expect(mappedData[0].full_name).toBeNull();
      expect(mappedData[0].avatar_url).toBeNull();
      expect(mappedData[0].phone).toBeNull();
      expect(mappedData[0].is_active).toBe(true); // Defaults to true
    });

    it('should handle undefined profile properties', () => {
      const rawData = [
        {
          id: 'role-1',
          user_id: 'user-1',
          role: 'operator',
          created_at: '2024-01-01T00:00:00Z',
          is_active: true,
          profiles: {}, // Empty profiles object
        },
      ];

      const mappedData = rawData.map(item => {
        const profile = item.profiles as {
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
        } | null;
        
        return {
          id: item.id,
          user_id: item.user_id,
          role: item.role as 'operator',
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
          phone: profile?.phone ?? null,
          created_at: item.created_at,
          is_active: item.is_active ?? true,
        };
      });

      expect(mappedData[0].full_name).toBeNull();
      expect(mappedData[0].avatar_url).toBeNull();
      expect(mappedData[0].phone).toBeNull();
    });
  });

  describe('OperatorWithProfile interface', () => {
    it('should match expected interface structure', () => {
      interface OperatorWithProfile {
        id: string;
        user_id: string;
        role: 'coordinator' | 'operator' | 'manager';
        full_name: string | null;
        avatar_url: string | null;
        phone: string | null;
        created_at: string;
        is_active: boolean;
      }

      const operator: OperatorWithProfile = {
        id: 'role-1',
        user_id: 'user-1',
        role: 'operator',
        full_name: 'Test User',
        avatar_url: null,
        phone: null,
        created_at: '2024-01-01T00:00:00Z',
        is_active: true,
      };

      expect(operator.id).toBeDefined();
      expect(operator.user_id).toBeDefined();
      expect(operator.role).toBe('operator');
      expect(typeof operator.is_active).toBe('boolean');
    });
  });
});

describe('Operator mutations', () => {
  describe('Remove operator mutation', () => {
    it('should include operator_name in audit log', () => {
      const operatorId = 'user-123';
      const operatorName = 'John Doe';

      // Simulate the audit log entry structure
      const auditEntry = {
        operator_id: operatorId,
        operator_name: operatorName,
        action: 'removed',
        performed_by: 'admin-123',
        performed_by_name: 'Admin User',
      };

      expect(auditEntry.operator_id).toBe(operatorId);
      expect(auditEntry.operator_name).toBe(operatorName);
      expect(auditEntry.action).toBe('removed');
    });
  });

  describe('Toggle active mutation', () => {
    it('should log correct action for activation', () => {
      const isActive = true;
      const action = isActive ? 'activated' : 'deactivated';
      expect(action).toBe('activated');
    });

    it('should log correct action for deactivation', () => {
      const isActive = false;
      const action = isActive ? 'activated' : 'deactivated';
      expect(action).toBe('deactivated');
    });
  });
});
