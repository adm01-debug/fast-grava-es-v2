import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

import { useKeyboard } from './useKeyboard';

describe('useKeyboard', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Single Key', () => {
    it('should handle single key press', () => {
      const callback = vi.fn();
      renderHook(() => useKeyboard('Enter', callback));
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        document.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalled();
    });

    it('should handle Escape key', () => {
      const callback = vi.fn();
      renderHook(() => useKeyboard('Escape', callback));
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Key Combinations', () => {
    it('should handle Ctrl+S', () => {
      const callback = vi.fn();
      renderHook(() => useKeyboard('ctrl+s', callback));
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
        document.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalled();
    });

    it('should handle Ctrl+Shift+Z', () => {
      const callback = vi.fn();
      renderHook(() => useKeyboard('ctrl+shift+z', callback));
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true });
        document.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Enabled State', () => {
    it('should not trigger when disabled', () => {
      const callback = vi.fn();
      renderHook(() => useKeyboard('Enter', callback, { enabled: false }));
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        document.dispatchEvent(event);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should remove listener on unmount', () => {
      const callback = vi.fn();
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = renderHook(() => useKeyboard('Enter', callback));
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalled();
      removeEventListenerSpy.mockRestore();
    });
  });
});
