import { useEffect, useCallback, useMemo } from 'react';

type KeyCombo = string;
type KeyHandler = (event: KeyboardEvent) => void;

interface ShortcutConfig {
  key: KeyCombo;
  handler: KeyHandler;
  description?: string;
  category?: string;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  targetElement?: HTMLElement | null;
}

// Parse key combo string into parts
function parseKeyCombo(combo: KeyCombo): {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
} {
  const parts = combo.toLowerCase().split('+').map((p) => p.trim());
  const key = parts[parts.length - 1];
  
  return {
    key,
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    alt: parts.includes('alt') || parts.includes('option'),
    shift: parts.includes('shift'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
  };
}

// Check if event matches key combo
function matchesKeyCombo(event: KeyboardEvent, combo: KeyCombo): boolean {
  const parsed = parseKeyCombo(combo);
  const eventKey = event.key.toLowerCase();
  
  // Handle special keys
  const keyMatches = 
    eventKey === parsed.key ||
    event.code.toLowerCase() === parsed.key ||
    event.code.toLowerCase() === `key${parsed.key}`;

  return (
    keyMatches &&
    event.ctrlKey === parsed.ctrl &&
    event.altKey === parsed.alt &&
    event.shiftKey === parsed.shift &&
    event.metaKey === parsed.meta
  );
}

/**
 * Hook for handling keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, targetElement } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Skip if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape key even in inputs
        if (event.key !== 'Escape') return;
      }

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;
        
        if (matchesKeyCombo(event, shortcut.key)) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          if (shortcut.stopPropagation) {
            event.stopPropagation();
          }
          shortcut.handler(event);
          break;
        }
      }
    },
    [enabled, shortcuts]
  );

  useEffect(() => {
    const element = targetElement || document;
    element.addEventListener('keydown', handleKeyDown as EventListener);
    return () => {
      element.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [handleKeyDown, targetElement]);
}

/**
 * Hook for single keyboard shortcut
 */
export function useKeyboardShortcut(
  key: KeyCombo,
  handler: KeyHandler,
  options: Omit<ShortcutConfig, 'key' | 'handler'> & UseKeyboardShortcutsOptions = {}
) {
  const shortcuts = useMemo(
    () => [{ key, handler, ...options }],
    [key, handler, options]
  );
  
  useKeyboardShortcuts(shortcuts, options);
}

// Common shortcut presets
export const shortcutPresets = {
  // Navigation
  goHome: { key: 'g+h', description: 'Ir para início' },
  goBack: { key: 'alt+arrowleft', description: 'Voltar' },
  goForward: { key: 'alt+arrowright', description: 'Avançar' },
  
  // Search
  search: { key: 'ctrl+k', description: 'Buscar' },
  searchAlt: { key: 'cmd+k', description: 'Buscar' },
  
  // Actions
  save: { key: 'ctrl+s', description: 'Salvar' },
  saveAlt: { key: 'cmd+s', description: 'Salvar' },
  new: { key: 'ctrl+n', description: 'Novo' },
  newAlt: { key: 'cmd+n', description: 'Novo' },
  delete: { key: 'delete', description: 'Excluir' },
  undo: { key: 'ctrl+z', description: 'Desfazer' },
  redo: { key: 'ctrl+shift+z', description: 'Refazer' },
  
  // UI
  escape: { key: 'escape', description: 'Fechar/Cancelar' },
  help: { key: '?', description: 'Ajuda' },
  toggleSidebar: { key: 'ctrl+b', description: 'Alternar sidebar' },
  toggleTheme: { key: 'ctrl+shift+l', description: 'Alternar tema' },
  
  // Selection
  selectAll: { key: 'ctrl+a', description: 'Selecionar tudo' },
  
  // Navigation in lists
  nextItem: { key: 'j', description: 'Próximo item' },
  prevItem: { key: 'k', description: 'Item anterior' },
  openItem: { key: 'enter', description: 'Abrir item' },
  
  // Quick actions
  quickAction1: { key: '1', description: 'Ação rápida 1' },
  quickAction2: { key: '2', description: 'Ação rápida 2' },
  quickAction3: { key: '3', description: 'Ação rápida 3' },
};

// Keyboard shortcuts registry for documentation
interface ShortcutRegistry {
  shortcuts: Map<string, ShortcutConfig>;
  register: (id: string, config: ShortcutConfig) => void;
  unregister: (id: string) => void;
  getAll: () => ShortcutConfig[];
  getByCategory: (category: string) => ShortcutConfig[];
}

export function createShortcutRegistry(): ShortcutRegistry {
  const shortcuts = new Map<string, ShortcutConfig>();

  return {
    shortcuts,
    register: (id: string, config: ShortcutConfig) => {
      shortcuts.set(id, config);
    },
    unregister: (id: string) => {
      shortcuts.delete(id);
    },
    getAll: () => Array.from(shortcuts.values()),
    getByCategory: (category: string) =>
      Array.from(shortcuts.values()).filter((s) => s.category === category),
  };
}

// Format key for display
export function formatKeyCombo(combo: KeyCombo): string {
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent);
  
  return combo
    .split('+')
    .map((key) => {
      const k = key.trim().toLowerCase();
      switch (k) {
        case 'ctrl':
        case 'control':
          return isMac ? '⌃' : 'Ctrl';
        case 'alt':
        case 'option':
          return isMac ? '⌥' : 'Alt';
        case 'shift':
          return isMac ? '⇧' : 'Shift';
        case 'meta':
        case 'cmd':
        case 'command':
          return isMac ? '⌘' : 'Win';
        case 'enter':
          return '↵';
        case 'escape':
          return 'Esc';
        case 'arrowup':
          return '↑';
        case 'arrowdown':
          return '↓';
        case 'arrowleft':
          return '←';
        case 'arrowright':
          return '→';
        case 'backspace':
          return '⌫';
        case 'delete':
          return 'Del';
        case 'tab':
          return '⇥';
        case 'space':
          return '␣';
        default:
          return k.toUpperCase();
      }
    })
    .join(isMac ? '' : '+');
}

// Keyboard shortcut display component
import React from 'react';
import { cn } from '@/lib/utils';

interface KeyboardShortcutProps {
  keys: KeyCombo;
  className?: string;
}

export function KeyboardShortcut({ keys, className }: KeyboardShortcutProps) {
  const formatted = formatKeyCombo(keys);
  const parts = formatted.split(/(?=[⌃⌥⇧⌘↵↑↓←→⌫⇥␣])|(?<=[⌃⌥⇧⌘↵↑↓←→⌫⇥␣])/);

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {parts.map((part, i) => (
        <kbd
          key={i}
          className={cn(
            'inline-flex items-center justify-center',
            'min-w-[1.5rem] h-5 px-1.5',
            'text-xs font-medium',
            'bg-muted border border-border rounded',
            'text-muted-foreground'
          )}
        >
          {part}
        </kbd>
      ))}
    </span>
  );
}

// Shortcuts help dialog content
interface ShortcutsHelpProps {
  shortcuts: Array<{ key: KeyCombo; description: string; category?: string }>;
}

export function ShortcutsHelp({ shortcuts }: ShortcutsHelpProps) {
  const categories = useMemo(() => {
    const cats = new Map<string, typeof shortcuts>();
    shortcuts.forEach((s) => {
      const cat = s.category || 'Geral';
      if (!cats.has(cat)) cats.set(cat, []);
      cats.get(cat)!.push(s);
    });
    return cats;
  }, [shortcuts]);

  return (
    <div className="space-y-6">
      {Array.from(categories.entries()).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-foreground mb-3">{category}</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between py-1"
              >
                <span className="text-sm text-muted-foreground">
                  {item.description}
                </span>
                <KeyboardShortcut keys={item.key} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
