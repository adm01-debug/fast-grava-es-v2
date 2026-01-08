import { useEffect, useCallback, useRef, useState } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;
type KeyCombo = string; // e.g., "ctrl+s", "shift+enter", "escape"

// Parse key combo string
function parseKeyCombo(combo: string): { key: string; ctrl: boolean; shift: boolean; alt: boolean; meta: boolean } {
  const parts = combo.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  return {
    key,
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
  };
}

// Check if event matches combo
function matchesCombo(event: KeyboardEvent, combo: ReturnType<typeof parseKeyCombo>): boolean {
  const key = event.key.toLowerCase();
  return (
    key === combo.key &&
    event.ctrlKey === combo.ctrl &&
    event.shiftKey === combo.shift &&
    event.altKey === combo.alt &&
    event.metaKey === combo.meta
  );
}

// Single hotkey
export function useHotkey(keyCombo: KeyCombo, handler: KeyHandler, options: { enabled?: boolean; preventDefault?: boolean } = {}) {
  const { enabled = true, preventDefault = true } = options;
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const combo = parseKeyCombo(keyCombo);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (matchesCombo(event, combo)) {
        if (preventDefault) event.preventDefault();
        savedHandler.current(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyCombo, enabled, preventDefault]);
}

// Multiple hotkeys
export function useHotkeys(
  hotkeys: Record<KeyCombo, KeyHandler>,
  options: { enabled?: boolean; preventDefault?: boolean } = {}
) {
  const { enabled = true, preventDefault = true } = options;
  const savedHandlers = useRef(hotkeys);

  useEffect(() => {
    savedHandlers.current = hotkeys;
  }, [hotkeys]);

  useEffect(() => {
    if (!enabled) return;

    const combos = Object.keys(savedHandlers.current).map(key => ({
      combo: parseKeyCombo(key),
      key,
    }));

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const { combo, key } of combos) {
        if (matchesCombo(event, combo)) {
          if (preventDefault) event.preventDefault();
          savedHandlers.current[key](event);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, preventDefault]);
}

// Note: useFocusTrap is available from '@/hooks/use-focus-trap'
// Use that for focus trap functionality

// Arrow key navigation
export function useArrowNavigation<T extends HTMLElement>(
  items: T[],
  options: { loop?: boolean; orientation?: 'horizontal' | 'vertical' | 'both' } = {}
) {
  const { loop = true, orientation = 'vertical' } = options;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isVertical = orientation === 'vertical' || orientation === 'both';
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';

    let newIndex = activeIndex;

    if ((event.key === 'ArrowDown' && isVertical) || (event.key === 'ArrowRight' && isHorizontal)) {
      event.preventDefault();
      newIndex = loop
        ? (activeIndex + 1) % items.length
        : Math.min(activeIndex + 1, items.length - 1);
    } else if ((event.key === 'ArrowUp' && isVertical) || (event.key === 'ArrowLeft' && isHorizontal)) {
      event.preventDefault();
      newIndex = loop
        ? (activeIndex - 1 + items.length) % items.length
        : Math.max(activeIndex - 1, 0);
    } else if (event.key === 'Home') {
      event.preventDefault();
      newIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      newIndex = items.length - 1;
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      items[newIndex]?.focus();
    }
  }, [activeIndex, items, loop, orientation]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { activeIndex, setActiveIndex };
}

// Escape key
export function useEscapeKey(handler: () => void, enabled = true) {
  useHotkey('escape', handler, { enabled });
}

// Enter key
export function useEnterKey(handler: () => void, enabled = true) {
  useHotkey('enter', handler, { enabled, preventDefault: false });
}

// Key sequence (e.g., Konami code)
export function useKeySequence(sequence: string[], handler: () => void, timeout = 2000) {
  const inputSequence = useRef<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      clearTimeout(timeoutRef.current);

      inputSequence.current.push(event.key.toLowerCase());

      if (inputSequence.current.length > sequence.length) {
        inputSequence.current.shift();
      }

      if (inputSequence.current.join(',') === sequence.map(k => k.toLowerCase()).join(',')) {
        handler();
        inputSequence.current = [];
      }

      timeoutRef.current = setTimeout(() => {
        inputSequence.current = [];
      }, timeout);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutRef.current);
    };
  }, [sequence, handler, timeout]);
}

// Keyboard shortcuts help dialog
interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string; description: string }[];
}

export function useKeyboardShortcutsHelp(groups: ShortcutGroup[]) {
  const [isOpen, setIsOpen] = useState(false);

  useHotkey('shift+?', () => setIsOpen(true));
  useEscapeKey(() => setIsOpen(false), isOpen);

  return { isOpen, setIsOpen, groups };
}

// Type-ahead search
export function useTypeAhead<T>(
  items: T[],
  getLabel: (item: T) => string,
  options: { timeout?: number } = {}
) {
  const { timeout = 500 } = options;
  const [query, setQuery] = useState('');
  const [matchIndex, setMatchIndex] = useState(-1);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        clearTimeout(timeoutRef.current);
        
        const newQuery = query + event.key.toLowerCase();
        setQuery(newQuery);

        const matchingIndex = items.findIndex(item =>
          getLabel(item).toLowerCase().startsWith(newQuery)
        );
        setMatchIndex(matchingIndex);

        timeoutRef.current = setTimeout(() => {
          setQuery('');
          setMatchIndex(-1);
        }, timeout);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutRef.current);
    };
  }, [items, getLabel, query, timeout]);

  return { query, matchIndex };
}

// Undo/Redo shortcuts
export function useUndoRedoShortcuts(
  undo: () => void,
  redo: () => void,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;

  useHotkeys({
    'ctrl+z': undo,
    'meta+z': undo,
    'ctrl+shift+z': redo,
    'meta+shift+z': redo,
    'ctrl+y': redo,
  }, { enabled });
}
