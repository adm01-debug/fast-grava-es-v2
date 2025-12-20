import { useEffect, useCallback, useRef } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;
type KeyCombo = string | string[];

interface UseKeyboardOptions {
  target?: Window | Document | HTMLElement | null;
  event?: 'keydown' | 'keyup' | 'keypress';
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export function useKeyboard(
  key: KeyCombo,
  handler: KeyHandler,
  options: UseKeyboardOptions = {}
): void {
  const {
    target = typeof window !== 'undefined' ? window : null,
    event = 'keydown',
    enabled = true,
    preventDefault = false,
    stopPropagation = false,
  } = options;

  const savedHandler = useRef<KeyHandler>(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  const normalizeKey = useCallback((keyString: string): { key: string; modifiers: string[] } => {
    const parts = keyString.toLowerCase().split('+').map(p => p.trim());
    const modifiers = parts.filter(p => ['ctrl', 'alt', 'shift', 'meta', 'cmd'].includes(p));
    const key = parts.find(p => !['ctrl', 'alt', 'shift', 'meta', 'cmd'].includes(p)) || '';
    return { key, modifiers };
  }, []);

  const matchesKeyCombo = useCallback((event: KeyboardEvent, keyCombo: string): boolean => {
    const { key: targetKey, modifiers } = normalizeKey(keyCombo);
    
    const eventKey = event.key.toLowerCase();
    const ctrlPressed = event.ctrlKey || event.metaKey;
    const altPressed = event.altKey;
    const shiftPressed = event.shiftKey;

    const ctrlRequired = modifiers.includes('ctrl') || modifiers.includes('cmd') || modifiers.includes('meta');
    const altRequired = modifiers.includes('alt');
    const shiftRequired = modifiers.includes('shift');

    return (
      eventKey === targetKey &&
      ctrlPressed === ctrlRequired &&
      altPressed === altRequired &&
      shiftPressed === shiftRequired
    );
  }, [normalizeKey]);

  useEffect(() => {
    if (!enabled || !target) return;

    const listener = (event: KeyboardEvent) => {
      const keys = Array.isArray(key) ? key : [key];
      const matches = keys.some(k => matchesKeyCombo(event, k));

      if (matches) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        savedHandler.current(event);
      }
    };

    target.addEventListener(event, listener as EventListener);
    return () => target.removeEventListener(event, listener as EventListener);
  }, [key, enabled, target, event, preventDefault, stopPropagation, matchesKeyCombo]);
}

// Preset hooks
export function useEscapeKey(handler: KeyHandler, options?: Omit<UseKeyboardOptions, 'key'>): void {
  useKeyboard('escape', handler, options);
}

export function useEnterKey(handler: KeyHandler, options?: Omit<UseKeyboardOptions, 'key'>): void {
  useKeyboard('enter', handler, options);
}

export function useCtrlS(handler: KeyHandler, options?: Omit<UseKeyboardOptions, 'key'>): void {
  useKeyboard('ctrl+s', handler, { ...options, preventDefault: true });
}

export function useCtrlZ(handler: KeyHandler, options?: Omit<UseKeyboardOptions, 'key'>): void {
  useKeyboard('ctrl+z', handler, options);
}

export function useCtrlShiftZ(handler: KeyHandler, options?: Omit<UseKeyboardOptions, 'key'>): void {
  useKeyboard('ctrl+shift+z', handler, options);
}

export default useKeyboard;
