// Comprehensive Keyboard Navigation System
import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard, Command, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  CornerDownLeft, X, HelpCircle, Settings, Search, Home, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

// Types
interface KeyBinding {
  id: string;
  keys: string[];
  description: string;
  category: string;
  action: () => void;
  enabled?: boolean;
  global?: boolean;
}

interface FocusableElement {
  id: string;
  element: HTMLElement;
  group?: string;
  order?: number;
}

interface KeyboardNavigationContextType {
  registerBinding: (binding: KeyBinding) => void;
  unregisterBinding: (id: string) => void;
  registerFocusable: (focusable: FocusableElement) => void;
  unregisterFocusable: (id: string) => void;
  focusNext: () => void;
  focusPrevious: () => void;
  focusFirst: () => void;
  focusLast: () => void;
  currentFocus: string | null;
  setCurrentFocus: (id: string | null) => void;
  isKeyboardMode: boolean;
  showShortcutsHelp: boolean;
  setShowShortcutsHelp: (show: boolean) => void;
  bindings: KeyBinding[];
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | null>(null);

// Parse key string into event match
function parseKeys(keys: string[]): { key: string; modifiers: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean } } {
  const keyString = keys.join('+').toLowerCase();
  const parts = keyString.split('+');
  
  const modifiers = {
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('⌘'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt') || parts.includes('option')
  };

  const key = parts.filter(p => 
    !['ctrl', 'control', 'meta', 'cmd', '⌘', 'shift', 'alt', 'option'].includes(p)
  )[0] || '';

  return { key, modifiers };
}

function matchesEvent(event: KeyboardEvent, binding: KeyBinding): boolean {
  const { key, modifiers } = parseKeys(binding.keys);
  
  const eventKey = event.key.toLowerCase();
  const matchesKey = eventKey === key || event.code.toLowerCase() === key;
  
  const matchesModifiers = 
    !!event.ctrlKey === !!modifiers.ctrl &&
    !!event.metaKey === !!modifiers.meta &&
    !!event.shiftKey === !!modifiers.shift &&
    !!event.altKey === !!modifiers.alt;

  return matchesKey && matchesModifiers;
}

// Provider
interface KeyboardNavigationProviderProps {
  children: ReactNode;
}

export function KeyboardNavigationProvider({ children }: KeyboardNavigationProviderProps) {
  const [bindings, setBindings] = useState<Map<string, KeyBinding>>(new Map());
  const [focusables, setFocusables] = useState<Map<string, FocusableElement>>(new Map());
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const registerBinding = useCallback((binding: KeyBinding) => {
    setBindings(prev => new Map(prev).set(binding.id, binding));
  }, []);

  const unregisterBinding = useCallback((id: string) => {
    setBindings(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const registerFocusable = useCallback((focusable: FocusableElement) => {
    setFocusables(prev => new Map(prev).set(focusable.id, focusable));
  }, []);

  const unregisterFocusable = useCallback((id: string) => {
    setFocusables(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const getSortedFocusables = useCallback(() => {
    return Array.from(focusables.values())
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [focusables]);

  const focusNext = useCallback(() => {
    const sorted = getSortedFocusables();
    if (sorted.length === 0) return;

    const currentIndex = currentFocus 
      ? sorted.findIndex(f => f.id === currentFocus)
      : -1;
    const nextIndex = (currentIndex + 1) % sorted.length;
    const next = sorted[nextIndex];
    
    next.element.focus();
    setCurrentFocus(next.id);
  }, [currentFocus, getSortedFocusables]);

  const focusPrevious = useCallback(() => {
    const sorted = getSortedFocusables();
    if (sorted.length === 0) return;

    const currentIndex = currentFocus 
      ? sorted.findIndex(f => f.id === currentFocus)
      : 0;
    const prevIndex = (currentIndex - 1 + sorted.length) % sorted.length;
    const prev = sorted[prevIndex];
    
    prev.element.focus();
    setCurrentFocus(prev.id);
  }, [currentFocus, getSortedFocusables]);

  const focusFirst = useCallback(() => {
    const sorted = getSortedFocusables();
    if (sorted.length === 0) return;
    
    sorted[0].element.focus();
    setCurrentFocus(sorted[0].id);
  }, [getSortedFocusables]);

  const focusLast = useCallback(() => {
    const sorted = getSortedFocusables();
    if (sorted.length === 0) return;
    
    const last = sorted[sorted.length - 1];
    last.element.focus();
    setCurrentFocus(last.id);
  }, [getSortedFocusables]);

  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detect keyboard mode
      if (event.key === 'Tab') {
        setIsKeyboardMode(true);
      }

      // Skip if in input element (unless global binding)
      const target = event.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) 
        || target.isContentEditable;

      // Check bindings
      for (const binding of bindings.values()) {
        if (binding.enabled === false) continue;
        if (isInput && !binding.global) continue;
        
        if (matchesEvent(event, binding)) {
          event.preventDefault();
          binding.action();
          return;
        }
      }

      // Built-in navigation shortcuts
      if (!isInput) {
        if (event.key === '?' && event.shiftKey) {
          event.preventDefault();
          setShowShortcutsHelp(true);
        }
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardMode(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [bindings]);

  // Register default bindings
  useEffect(() => {
    const defaultBindings: KeyBinding[] = [
      {
        id: 'nav-next',
        keys: ['Tab'],
        description: 'Próximo elemento',
        category: 'Navegação',
        action: focusNext,
        global: true
      },
      {
        id: 'nav-prev',
        keys: ['Shift', 'Tab'],
        description: 'Elemento anterior',
        category: 'Navegação',
        action: focusPrevious,
        global: true
      },
      {
        id: 'help',
        keys: ['Shift', '?'],
        description: 'Mostrar atalhos',
        category: 'Ajuda',
        action: () => setShowShortcutsHelp(true),
        global: true
      }
    ];

    defaultBindings.forEach(registerBinding);
    return () => defaultBindings.forEach(b => unregisterBinding(b.id));
  }, [registerBinding, unregisterBinding, focusNext, focusPrevious]);

  return (
    <KeyboardNavigationContext.Provider
      value={{
        registerBinding,
        unregisterBinding,
        registerFocusable,
        unregisterFocusable,
        focusNext,
        focusPrevious,
        focusFirst,
        focusLast,
        currentFocus,
        setCurrentFocus,
        isKeyboardMode,
        showShortcutsHelp,
        setShowShortcutsHelp,
        bindings: Array.from(bindings.values())
      }}
    >
      {children}
      <ShortcutsHelpDialog />
      {isKeyboardMode && <FocusIndicator />}
    </KeyboardNavigationContext.Provider>
  );
}

export function useKeyboardNavigation() {
  const context = useContext(KeyboardNavigationContext);
  if (!context) throw new Error('useKeyboardNavigation must be used within KeyboardNavigationProvider');
  return context;
}

// Hook to register a keyboard shortcut
export function useKeyBinding(binding: Omit<KeyBinding, 'id'> & { id?: string }) {
  const { registerBinding, unregisterBinding } = useKeyboardNavigation();
  const id = binding.id || `binding-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    registerBinding({ ...binding, id });
    return () => unregisterBinding(id);
  }, [binding.keys.join(','), binding.enabled]);
}

// Hook to make element focusable in keyboard navigation
export function useFocusable<T extends HTMLElement>(options?: { group?: string; order?: number }) {
  const ref = useRef<T>(null);
  const { registerFocusable, unregisterFocusable, currentFocus, isKeyboardMode } = useKeyboardNavigation();
  const idRef = useRef(`focusable-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!ref.current) return;

    registerFocusable({
      id: idRef.current,
      element: ref.current,
      group: options?.group,
      order: options?.order
    });

    return () => unregisterFocusable(idRef.current);
  }, [options?.group, options?.order, registerFocusable, unregisterFocusable]);

  return {
    ref,
    isFocused: currentFocus === idRef.current,
    isKeyboardMode,
    focusProps: {
      'data-focusable': true,
      'data-focus-id': idRef.current
    }
  };
}

// Shortcuts Help Dialog
function ShortcutsHelpDialog() {
  const { showShortcutsHelp, setShowShortcutsHelp, bindings } = useKeyboardNavigation();

  // Group bindings by category
  const groupedBindings = bindings.reduce((acc, binding) => {
    const category = binding.category || 'Geral';
    if (!acc[category]) acc[category] = [];
    acc[category].push(binding);
    return acc;
  }, {} as Record<string, KeyBinding[]>);

  return (
    <Dialog open={showShortcutsHelp} onOpenChange={setShowShortcutsHelp}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {Object.entries(groupedBindings).map(([category, categoryBindings]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryBindings.map(binding => (
                    <div
                      key={binding.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm">{binding.description}</span>
                      <KeyCombo keys={binding.keys} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Pressione <KeyCombo keys={['Shift', '?']} size="sm" /> a qualquer momento para ver esta ajuda
          </p>
          <Button onClick={() => setShowShortcutsHelp(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Key Combo Display
interface KeyComboProps {
  keys: string[];
  size?: 'sm' | 'default';
}

export function KeyCombo({ keys, size = 'default' }: KeyComboProps) {
  const sizeClasses = {
    sm: 'px-1 py-0.5 text-[10px]',
    default: 'px-1.5 py-0.5 text-xs'
  };

  const keyMap: Record<string, string> = {
    'meta': '⌘',
    'cmd': '⌘',
    'ctrl': 'Ctrl',
    'control': 'Ctrl',
    'shift': '⇧',
    'alt': '⌥',
    'option': '⌥',
    'enter': '↵',
    'return': '↵',
    'escape': 'Esc',
    'esc': 'Esc',
    'arrowup': '↑',
    'arrowdown': '↓',
    'arrowleft': '←',
    'arrowright': '→',
    'backspace': '⌫',
    'delete': '⌦',
    'space': 'Space',
    'tab': 'Tab'
  };

  return (
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          <kbd
            className={cn(
              'rounded border bg-background font-mono font-medium',
              sizeClasses[size]
            )}
          >
            {keyMap[key.toLowerCase()] || key.toUpperCase()}
          </kbd>
          {i < keys.length - 1 && (
            <span className="text-muted-foreground text-xs">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Focus Indicator (visual feedback for keyboard navigation)
function FocusIndicator() {
  const { currentFocus, isKeyboardMode } = useKeyboardNavigation();
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isKeyboardMode || !currentFocus) {
      setVisible(false);
      return;
    }

    const element = document.querySelector(`[data-focus-id="${currentFocus}"]`);
    if (!element) {
      setVisible(false);
      return;
    }

    const rect = element.getBoundingClientRect();
    setPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    });
    setVisible(true);
  }, [currentFocus, isKeyboardMode]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed pointer-events-none z-[9999] border-2 border-primary rounded-lg"
      style={{
        top: position.top - 2,
        left: position.left - 2,
        width: position.width + 4,
        height: position.height + 4
      }}
    >
      <motion.div
        className="absolute inset-0 bg-primary/10 rounded-lg"
        animate={{ opacity: [0.5, 0.2, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
    </motion.div>
  );
}

// Shortcut Button Component
interface ShortcutButtonProps extends React.ComponentProps<typeof Button> {
  shortcut?: string[];
}

export function ShortcutButton({ shortcut, children, ...props }: ShortcutButtonProps) {
  const { ref, focusProps, isFocused, isKeyboardMode } = useFocusable<HTMLButtonElement>();

  return (
    <Button
      ref={ref}
      {...props}
      {...focusProps}
      className={cn(props.className, isFocused && isKeyboardMode && 'ring-2 ring-primary')}
    >
      {children}
      {shortcut && (
        <span className="ml-2 opacity-60">
          <KeyCombo keys={shortcut} size="sm" />
        </span>
      )}
    </Button>
  );
}

// Keyboard Mode Indicator
export function KeyboardModeIndicator() {
  const { isKeyboardMode, setShowShortcutsHelp } = useKeyboardNavigation();

  return (
    <AnimatePresence>
      {isKeyboardMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-4 z-50"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowShortcutsHelp(true)}
            className="shadow-lg"
          >
            <Keyboard className="h-4 w-4 mr-2" />
            Modo Teclado
            <Badge variant="outline" className="ml-2">
              ?
            </Badge>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Skip Link Component (accessibility)
export function SkipLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
    >
      {children}
    </a>
  );
}

// Focus Trap Component
interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
}

export function FocusTrap({ children, active = true }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus first element on mount
    firstElement.focus();

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}
