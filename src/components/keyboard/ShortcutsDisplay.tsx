import * as React from 'react';
import { motion } from 'framer-motion';
import { Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Keyboard shortcut display
interface ShortcutKeyProps {
  keys: string[];
  className?: string;
}

export function ShortcutKey({ keys, className }: ShortcutKeyProps) {
  const formatKey = (key: string) => {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
    
    const keyMap: Record<string, string> = {
      mod: isMac ? '⌘' : 'Ctrl',
      ctrl: isMac ? '⌃' : 'Ctrl',
      alt: isMac ? '⌥' : 'Alt',
      shift: '⇧',
      enter: '↵',
      escape: 'Esc',
      backspace: '⌫',
      delete: '⌦',
      tab: '⇥',
      space: '␣',
      up: '↑',
      down: '↓',
      left: '←',
      right: '→',
    };

    return keyMap[key.toLowerCase()] || key.toUpperCase();
  };

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded shadow-sm min-w-[1.5rem] text-center">
            {formatKey(key)}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-muted-foreground text-xs">+</span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

// Shortcut definition
export interface Shortcut {
  id: string;
  keys: string[];
  label: string;
  description?: string;
  category?: string;
  action?: () => void;
}

// Shortcuts help dialog
interface ShortcutsHelpProps {
  shortcuts: Shortcut[];
  trigger?: React.ReactNode;
  className?: string;
}

export function ShortcutsHelp({ shortcuts, trigger, className }: ShortcutsHelpProps) {
  const categories = React.useMemo(() => {
    const cats: Record<string, Shortcut[]> = {};
    shortcuts.forEach((shortcut) => {
      const category = shortcut.category || 'Geral';
      if (!cats[category]) cats[category] = [];
      cats[category].push(shortcut);
    });
    return cats;
  }, [shortcuts]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <Command className="h-4 w-4 mr-2" />
            Atalhos
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(categories).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((shortcut) => (
                  <motion.div
                    key={shortcut.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{shortcut.label}</p>
                      {shortcut.description && (
                        <p className="text-xs text-muted-foreground">
                          {shortcut.description}
                        </p>
                      )}
                    </div>
                    <ShortcutKey keys={shortcut.keys} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t">
          Pressione <ShortcutKey keys={['?']} /> a qualquer momento para ver esta ajuda
        </p>
      </DialogContent>
    </Dialog>
  );
}

// Use keyboard shortcut hook
interface UseKeyboardShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  options: UseKeyboardShortcutOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;

  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.includes('Mac');
      
      const keyMatches = keys.every((key) => {
        const k = key.toLowerCase();
        if (k === 'mod') return isMac ? event.metaKey : event.ctrlKey;
        if (k === 'ctrl') return event.ctrlKey;
        if (k === 'alt') return event.altKey;
        if (k === 'shift') return event.shiftKey;
        if (k === 'meta') return event.metaKey;
        return event.key.toLowerCase() === k;
      });

      if (keyMatches) {
        if (preventDefault) event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keys, callback, enabled, preventDefault]);
}

// Shortcuts manager
interface ShortcutsManagerProps {
  shortcuts: Shortcut[];
  children: React.ReactNode;
}

export function ShortcutsManager({ shortcuts, children }: ShortcutsManagerProps) {
  const [showHelp, setShowHelp] = React.useState(false);

  // Register all shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show help on ?
      if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          setShowHelp(true);
          return;
        }
      }

      const isMac = navigator.platform.includes('Mac');

      shortcuts.forEach((shortcut) => {
        if (!shortcut.action) return;

        const keyMatches = shortcut.keys.every((key) => {
          const k = key.toLowerCase();
          if (k === 'mod') return isMac ? event.metaKey : event.ctrlKey;
          if (k === 'ctrl') return event.ctrlKey;
          if (k === 'alt') return event.altKey;
          if (k === 'shift') return event.shiftKey;
          if (k === 'meta') return event.metaKey;
          return event.key.toLowerCase() === k;
        });

        if (keyMatches) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <>
      {children}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Atalhos de Teclado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.id}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm">{shortcut.label}</span>
                <ShortcutKey keys={shortcut.keys} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Common shortcuts preset
export const commonShortcuts: Shortcut[] = [
  { id: 'save', keys: ['mod', 's'], label: 'Salvar', category: 'Geral' },
  { id: 'search', keys: ['mod', 'k'], label: 'Buscar', category: 'Navegação' },
  { id: 'new', keys: ['mod', 'n'], label: 'Novo', category: 'Ações' },
  { id: 'close', keys: ['escape'], label: 'Fechar', category: 'Geral' },
  { id: 'undo', keys: ['mod', 'z'], label: 'Desfazer', category: 'Edição' },
  { id: 'redo', keys: ['mod', 'shift', 'z'], label: 'Refazer', category: 'Edição' },
  { id: 'copy', keys: ['mod', 'c'], label: 'Copiar', category: 'Edição' },
  { id: 'paste', keys: ['mod', 'v'], label: 'Colar', category: 'Edição' },
  { id: 'cut', keys: ['mod', 'x'], label: 'Recortar', category: 'Edição' },
  { id: 'selectAll', keys: ['mod', 'a'], label: 'Selecionar tudo', category: 'Edição' },
];
