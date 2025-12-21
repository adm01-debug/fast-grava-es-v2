import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { useRef } from 'react';

// Mock the hook implementation
const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  enabled: boolean = true
) => {
  React.useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [ref, callback, enabled]);
};

describe('useClickOutside', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should call callback when clicking outside', () => {
      const callback = vi.fn();
      const ref = { current: document.createElement('div') };
      document.body.appendChild(ref.current);

      renderHook(() => useClickOutside(ref, callback));

      // Simulate click outside
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);
      
      act(() => {
        const event = new MouseEvent('mousedown', { bubbles: true });
        outsideElement.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalled();

      document.body.removeChild(ref.current);
      document.body.removeChild(outsideElement);
    });

    it('should not call callback when clicking inside', () => {
      const callback = vi.fn();
      const ref = { current: document.createElement('div') };
      const innerElement = document.createElement('span');
      ref.current.appendChild(innerElement);
      document.body.appendChild(ref.current);

      renderHook(() => useClickOutside(ref, callback));

      act(() => {
        const event = new MouseEvent('mousedown', { bubbles: true });
        innerElement.dispatchEvent(event);
      });

      expect(callback).not.toHaveBeenCalled();

      document.body.removeChild(ref.current);
    });

    it('should handle touch events', () => {
      const callback = vi.fn();
      const ref = { current: document.createElement('div') };
      document.body.appendChild(ref.current);

      renderHook(() => useClickOutside(ref, callback));

      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      act(() => {
        const event = new TouchEvent('touchstart', { bubbles: true });
        outsideElement.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalled();

      document.body.removeChild(ref.current);
      document.body.removeChild(outsideElement);
    });
  });

  describe('Enabled State', () => {
    it('should not call callback when disabled', () => {
      const callback = vi.fn();
      const ref = { current: document.createElement('div') };
      document.body.appendChild(ref.current);

      renderHook(() => useClickOutside(ref, callback, false));

      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      act(() => {
        const event = new MouseEvent('mousedown', { bubbles: true });
        outsideElement.dispatchEvent(event);
      });

      expect(callback).not.toHaveBeenCalled();

      document.body.removeChild(ref.current);
      document.body.removeChild(outsideElement);
    });

    it('should start working when enabled changes to true', () => {
      const callback = vi.fn();
      const ref = { current: document.createElement('div') };
      document.body.appendChild(ref.current);

      const { rerender } = renderHook(
        ({ enabled }) => useClickOutside(ref, callback, enabled),
        { initialProps: { enabled: false } }
      );

      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      // Click while disabled
      act(() => {
        const event = new MouseEvent('mousedown', { bubbles: true });
        outsideElement.dispatchEvent(event);
      });
      expect(callback).not.toHaveBeenCalled();

      // Enable and click
      rerender({ enabled: true });
      act(() => {
        const event = new MouseEvent('mousedown', { bubbles: true });
        outsideElement.dispatchEvent(event);
      });
      expect(callback).toHaveBeenCalled();

      document.body.removeChild(ref.current);
      document.body.removeChild(outsideElement);
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const callback = vi.fn();
      const ref = { current: document.createElement('div') };
      document.body.appendChild(ref.current);

      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() => useClickOutside(ref, callback));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));

      document.body.removeChild(ref.current);
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Null Ref Handling', () => {
    it('should handle null ref gracefully', () => {
      const callback = vi.fn();
      const ref = { current: null };

      expect(() => {
        renderHook(() => useClickOutside(ref as any, callback));
      }).not.toThrow();
    });
  });

  describe('Multiple Refs', () => {
    it('should work with multiple instances', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const ref1 = { current: document.createElement('div') };
      const ref2 = { current: document.createElement('div') };
      document.body.appendChild(ref1.current);
      document.body.appendChild(ref2.current);

      renderHook(() => {
        useClickOutside(ref1, callback1);
        useClickOutside(ref2, callback2);
      });

      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      act(() => {
        const event = new MouseEvent('mousedown', { bubbles: true });
        outsideElement.dispatchEvent(event);
      });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      document.body.removeChild(ref1.current);
      document.body.removeChild(ref2.current);
      document.body.removeChild(outsideElement);
    });
  });
});
