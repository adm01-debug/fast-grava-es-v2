import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePushNotifications } from './usePushNotifications';

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock navigation
vi.mock('@/lib/navigation', () => ({
  navigateTo: vi.fn(),
}));

// Mock error handling
vi.mock('@/lib/errorHandling', () => ({
  createAppError: vi.fn((error) => error),
}));

// Mock Notification API
const mockNotificationInstance = {
  close: vi.fn(),
  onclick: null as any,
};

class MockNotification {
  static permission: NotificationPermission = 'default';
  static requestPermission = vi.fn();
  
  title: string;
  body: string;
  icon: string;
  tag?: string;
  requireInteraction: boolean;
  data?: any;
  onclick: (() => void) | null = null;
  close = vi.fn();

  constructor(title: string, options: any = {}) {
    this.title = title;
    this.body = options.body || '';
    this.icon = options.icon || '/favicon.ico';
    this.tag = options.tag;
    this.requireInteraction = options.requireInteraction || false;
    this.data = options.data;
    
    // Store reference for testing
    Object.assign(mockNotificationInstance, this);
    mockNotificationInstance.onclick = null;
  }
}

describe('usePushNotifications', () => {
  const originalNotification = global.Notification;
  const originalWindow = global.window;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock notification
    MockNotification.permission = 'default';
    MockNotification.requestPermission = vi.fn();
    
    // Set up global Notification
    (global as any).Notification = MockNotification;
    
    // Mock window.focus
    global.window.focus = vi.fn();
  });

  afterEach(() => {
    (global as any).Notification = originalNotification;
  });

  describe('Initial State', () => {
    it('should detect notifications support', () => {
      const { result } = renderHook(() => usePushNotifications());

      expect(result.current.isSupported).toBe(true);
    });

    it('should get current permission status', () => {
      MockNotification.permission = 'granted';

      const { result } = renderHook(() => usePushNotifications());

      expect(result.current.permission).toBe('granted');
    });

    it('should handle when notifications are not supported', () => {
      delete (global as any).Notification;

      const { result } = renderHook(() => usePushNotifications());

      expect(result.current.isSupported).toBe(false);
      expect(result.current.permission).toBe('default');

      // Restore for other tests
      (global as any).Notification = MockNotification;
    });
  });

  describe('requestPermission', () => {
    it('should request permission and update state on granted', async () => {
      MockNotification.requestPermission.mockResolvedValue('granted');

      const { result } = renderHook(() => usePushNotifications());

      let granted: boolean;
      await act(async () => {
        granted = await result.current.requestPermission();
      });

      expect(granted!).toBe(true);
      expect(result.current.permission).toBe('granted');
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Notificações ativadas',
        })
      );
    });

    it('should handle denied permission', async () => {
      MockNotification.requestPermission.mockResolvedValue('denied');

      const { result } = renderHook(() => usePushNotifications());

      let granted: boolean;
      await act(async () => {
        granted = await result.current.requestPermission();
      });

      expect(granted!).toBe(false);
      expect(result.current.permission).toBe('denied');
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Notificações bloqueadas',
          variant: 'destructive',
        })
      );
    });

    it('should return false when notifications not supported', async () => {
      delete (global as any).Notification;

      const { result } = renderHook(() => usePushNotifications());

      let granted: boolean;
      await act(async () => {
        granted = await result.current.requestPermission();
      });

      expect(granted!).toBe(false);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Notificações não suportadas',
          variant: 'destructive',
        })
      );

      // Restore
      (global as any).Notification = MockNotification;
    });

    it('should handle request permission error', async () => {
      MockNotification.requestPermission.mockRejectedValue(new Error('Permission error'));

      const { result } = renderHook(() => usePushNotifications());

      let granted: boolean;
      await act(async () => {
        granted = await result.current.requestPermission();
      });

      expect(granted!).toBe(false);
    });
  });

  describe('sendNotification', () => {
    it('should send notification when permission granted', () => {
      MockNotification.permission = 'granted';

      const { result } = renderHook(() => usePushNotifications());

      act(() => {
        result.current.sendNotification({
          title: 'Test Title',
          body: 'Test Body',
          icon: '/test-icon.png',
          tag: 'test-tag',
          requireInteraction: true,
          data: { foo: 'bar' },
        });
      });

      expect(mockNotificationInstance.title).toBe('Test Title');
      expect(mockNotificationInstance.body).toBe('Test Body');
    });

    it('should use default icon when not provided', () => {
      MockNotification.permission = 'granted';

      const { result } = renderHook(() => usePushNotifications());

      act(() => {
        result.current.sendNotification({
          title: 'Test',
          body: 'Test',
        });
      });

      expect(mockNotificationInstance.icon).toBe('/favicon.ico');
    });

    it('should return null when not supported', () => {
      delete (global as any).Notification;

      const { result } = renderHook(() => usePushNotifications());

      let notification: any;
      act(() => {
        notification = result.current.sendNotification({
          title: 'Test',
          body: 'Test',
        });
      });

      expect(notification).toBeNull();

      // Restore
      (global as any).Notification = MockNotification;
    });

    it('should return null when permission not granted', () => {
      MockNotification.permission = 'denied';

      const { result } = renderHook(() => usePushNotifications());

      let notification: any;
      act(() => {
        notification = result.current.sendNotification({
          title: 'Test',
          body: 'Test',
        });
      });

      expect(notification).toBeNull();
    });

    it('should handle click event with navigation', () => {
      const { navigateTo } = vi.mocked(require('@/lib/navigation'));
      MockNotification.permission = 'granted';

      const { result } = renderHook(() => usePushNotifications());

      act(() => {
        result.current.sendNotification({
          title: 'Test',
          body: 'Test',
          data: { route: '/alerts' },
        });
      });

      // Simulate click
      if (mockNotificationInstance.onclick) {
        mockNotificationInstance.onclick();
      }

      expect(window.focus).toHaveBeenCalled();
      expect(navigateTo).toHaveBeenCalledWith('/alerts');
    });

    it('should close notification on click', () => {
      MockNotification.permission = 'granted';

      const { result } = renderHook(() => usePushNotifications());

      let notification: any;
      act(() => {
        notification = result.current.sendNotification({
          title: 'Test',
          body: 'Test',
        });
      });

      // Simulate click
      if (notification?.onclick) {
        notification.onclick();
      }

      expect(notification?.close).toHaveBeenCalled();
    });
  });

  describe('Specific Alert Types', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted';
    });

    it('should send delayed job alert', () => {
      const { result } = renderHook(() => usePushNotifications());

      act(() => {
        result.current.sendDelayedJobAlert({
          orderNumber: 'ORD-001',
          product: 'Camiseta',
          client: 'Cliente A',
        });
      });

      expect(mockNotificationInstance.title).toBe('⚠️ Job Atrasado');
      expect(mockNotificationInstance.body).toBe('ORD-001 - Camiseta (Cliente A)');
      expect(mockNotificationInstance.tag).toBe('delayed-ORD-001');
      expect(mockNotificationInstance.requireInteraction).toBe(true);
      expect(mockNotificationInstance.data).toEqual({ route: '/alerts', type: 'delayed' });
    });

    it('should send low buffer alert', () => {
      const { result } = renderHook(() => usePushNotifications());

      act(() => {
        result.current.sendLowBufferAlert('Laser', 2);
      });

      expect(mockNotificationInstance.title).toBe('🔴 Buffer Baixo');
      expect(mockNotificationInstance.body).toBe('Laser: apenas 2 jobs "no jeito"');
      expect(mockNotificationInstance.tag).toBe('buffer-Laser');
      expect(mockNotificationInstance.data).toEqual({ route: '/alerts', type: 'buffer' });
    });

    it('should send bottleneck alert', () => {
      const { result } = renderHook(() => usePushNotifications());

      act(() => {
        result.current.sendBottleneckAlert('Serigrafia', 95);
      });

      expect(mockNotificationInstance.title).toBe('⚡ Gargalo Detectado');
      expect(mockNotificationInstance.body).toBe('Serigrafia: 95% de ocupação');
      expect(mockNotificationInstance.tag).toBe('bottleneck-Serigrafia');
      expect(mockNotificationInstance.data).toEqual({ route: '/efficiency', type: 'bottleneck' });
    });

    it('should send status change alert', () => {
      const { result } = renderHook(() => usePushNotifications());

      act(() => {
        result.current.sendStatusChangeAlert({
          orderNumber: 'ORD-002',
          oldStatus: 'scheduled',
          newStatus: 'production',
        });
      });

      expect(mockNotificationInstance.title).toBe('🔄 Status Alterado');
      expect(mockNotificationInstance.body).toBe('ORD-002: scheduled → production');
      expect(mockNotificationInstance.tag).toBe('status-ORD-002');
      expect(mockNotificationInstance.data).toEqual({ route: '/kanban', type: 'status' });
    });

    it('should send production complete alert', () => {
      const { result } = renderHook(() => usePushNotifications());

      act(() => {
        result.current.sendProductionCompleteAlert({
          orderNumber: 'ORD-003',
          product: 'Caneca',
          operator: 'João',
        });
      });

      expect(mockNotificationInstance.title).toBe('✅ Produção Finalizada');
      expect(mockNotificationInstance.body).toBe('ORD-003 - Caneca por João');
      expect(mockNotificationInstance.tag).toBe('complete-ORD-003');
      expect(mockNotificationInstance.data).toEqual({ route: '/', type: 'complete' });
    });
  });

  describe('Return Values', () => {
    it('should return all expected functions and state', () => {
      const { result } = renderHook(() => usePushNotifications());

      expect(result.current).toEqual(
        expect.objectContaining({
          permission: expect.any(String),
          isSupported: expect.any(Boolean),
          requestPermission: expect.any(Function),
          sendNotification: expect.any(Function),
          sendDelayedJobAlert: expect.any(Function),
          sendLowBufferAlert: expect.any(Function),
          sendBottleneckAlert: expect.any(Function),
          sendStatusChangeAlert: expect.any(Function),
          sendProductionCompleteAlert: expect.any(Function),
        })
      );
    });
  });
});
