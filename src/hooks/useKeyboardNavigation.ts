import { useState, useEffect, useCallback, useRef } from 'react';

// Keyboard shortcut definition
interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
}

// Parse key combination string (e.g., "ctrl+k", "shift+?")
function parseKeyCombo(combo: string): Omit<KeyboardShortcut, 'action' | 'description'> {
  const parts = combo.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  
  return {
    key,
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
    preventDefault: true,
  };
}

// Check if event matches shortcut
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const eventKey = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();

  // Handle special keys
  const keyMatches = eventKey === shortcutKey || 
    (shortcutKey === 'escape' && eventKey === 'escape') ||
    (shortcutKey === 'enter' && eventKey === 'enter') ||
    (shortcutKey === 'space' && eventKey === ' ') ||
    (shortcutKey === 'arrowup' && eventKey === 'arrowup') ||
    (shortcutKey === 'arrowdown' && eventKey === 'arrowdown') ||
    (shortcutKey === 'arrowleft' && eventKey === 'arrowleft') ||
    (shortcutKey === 'arrowright' && eventKey === 'arrowright');

  return (
    keyMatches &&
    !!shortcut.ctrl === (event.ctrlKey || event.metaKey) &&
    !!shortcut.alt === event.altKey &&
    !!shortcut.shift === event.shiftKey
  );
}

// Hook for single keyboard shortcut
export function useKeyboardShortcut(
  keyCombo: string,
  callback: () => void,
  options: { enabled?: boolean; preventDefault?: boolean } = {}
) {
  const { enabled = true, preventDefault = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const shortcut = {
      ...parseKeyCombo(keyCombo),
      action: callback,
      preventDefault,
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape key even in inputs
        if (event.key !== 'Escape') return;
      }

      if (matchesShortcut(event, shortcut)) {
        if (shortcut.preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyCombo, callback, enabled, preventDefault]);
}

// Hook for multiple keyboard shortcuts
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const parsedShortcuts = Object.entries(shortcuts).map(([combo, action]) => ({
      ...parseKeyCombo(combo),
      action,
    }));

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (event.key !== 'Escape') return;
      }

      for (const shortcut of parsedShortcuts) {
        if (matchesShortcut(event, shortcut as KeyboardShortcut)) {
          if (shortcut.preventDefault) {
            event.preventDefault();
          }
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

// Arrow key navigation hook
export function useArrowNavigation<T extends HTMLElement>(
  items: T[] | null,
  options: {
    onSelect?: (index: number) => void;
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
  } = {}
) {
  const { onSelect, loop = true, orientation = 'vertical' } = options;
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!items || items.length === 0) return;

    let newIndex = focusedIndex;
    const isVertical = orientation === 'vertical' || orientation === 'both';
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';

    if ((direction === 'up' && isVertical) || (direction === 'left' && isHorizontal)) {
      newIndex = focusedIndex - 1;
      if (newIndex < 0) {
        newIndex = loop ? items.length - 1 : 0;
      }
    } else if ((direction === 'down' && isVertical) || (direction === 'right' && isHorizontal)) {
      newIndex = focusedIndex + 1;
      if (newIndex >= items.length) {
        newIndex = loop ? 0 : items.length - 1;
      }
    }

    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
      items[newIndex]?.focus();
      onSelect?.(newIndex);
    }
  }, [items, focusedIndex, loop, orientation, onSelect]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          navigate('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          navigate('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          navigate('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigate('right');
          break;
        case 'Home':
          event.preventDefault();
          if (items && items.length > 0) {
            setFocusedIndex(0);
            items[0]?.focus();
          }
          break;
        case 'End':
          event.preventDefault();
          if (items && items.length > 0) {
            const lastIndex = items.length - 1;
            setFocusedIndex(lastIndex);
            items[lastIndex]?.focus();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, navigate]);

  return { focusedIndex, setFocusedIndex };
}

// Focus trap hook
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, enabled = true) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelector);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelector);
    focusableElements[0]?.focus();

    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, enabled]);
}

// Escape key handler
export function useEscapeKey(callback: () => void, enabled = true) {
  useKeyboardShortcut('escape', callback, { enabled });
}

// Enter key handler
export function useEnterKey(callback: () => void, enabled = true) {
  useKeyboardShortcut('enter', callback, { enabled, preventDefault: false });
}
