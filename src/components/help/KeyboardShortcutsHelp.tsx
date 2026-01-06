import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Keyboard, 
  Command, 
  Search, 
  X, 
  ChevronRight,
  Home,
  Calendar,
  LayoutGrid,
  Bell,
  Settings,
  Plus,
  Save,
  Trash2,
  Copy,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
  action?: () => void;
}

interface ShortcutCategory {
  name: string;
  icon: React.ReactNode;
  shortcuts: Shortcut[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: 'Navegação',
    icon: <Home className="h-4 w-4" />,
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Abrir busca rápida', category: 'Navegação' },
      { keys: ['G', 'H'], description: 'Ir para Dashboard', category: 'Navegação' },
      { keys: ['G', 'C'], description: 'Ir para Calendário', category: 'Navegação' },
      { keys: ['G', 'K'], description: 'Ir para Kanban', category: 'Navegação' },
      { keys: ['G', 'A'], description: 'Ir para Alertas', category: 'Navegação' },
      { keys: ['G', 'S'], description: 'Ir para Configurações', category: 'Navegação' },
      { keys: ['⌘', '['], description: 'Voltar', category: 'Navegação' },
      { keys: ['⌘', ']'], description: 'Avançar', category: 'Navegação' },
    ],
  },
  {
    name: 'Ações',
    icon: <Plus className="h-4 w-4" />,
    shortcuts: [
      { keys: ['N'], description: 'Novo job', category: 'Ações' },
      { keys: ['⌘', 'S'], description: 'Salvar', category: 'Ações' },
      { keys: ['⌘', 'Enter'], description: 'Confirmar/Enviar', category: 'Ações' },
      { keys: ['Esc'], description: 'Cancelar/Fechar', category: 'Ações' },
      { keys: ['⌘', 'Z'], description: 'Desfazer', category: 'Ações' },
      { keys: ['⌘', 'Shift', 'Z'], description: 'Refazer', category: 'Ações' },
      { keys: ['⌘', 'C'], description: 'Copiar', category: 'Ações' },
      { keys: ['Delete'], description: 'Excluir selecionado', category: 'Ações' },
    ],
  },
  {
    name: 'Visualização',
    icon: <LayoutGrid className="h-4 w-4" />,
    shortcuts: [
      { keys: ['⌘', 'B'], description: 'Toggle sidebar', category: 'Visualização' },
      { keys: ['⌘', 'Shift', 'D'], description: 'Toggle tema escuro', category: 'Visualização' },
      { keys: ['⌘', '+'], description: 'Aumentar zoom', category: 'Visualização' },
      { keys: ['⌘', '-'], description: 'Diminuir zoom', category: 'Visualização' },
      { keys: ['⌘', '0'], description: 'Zoom padrão', category: 'Visualização' },
      { keys: ['F'], description: 'Tela cheia', category: 'Visualização' },
    ],
  },
  {
    name: 'Tabelas & Listas',
    icon: <ArrowUp className="h-4 w-4" />,
    shortcuts: [
      { keys: ['↑', '↓'], description: 'Navegar entre itens', category: 'Tabelas' },
      { keys: ['Enter'], description: 'Abrir item selecionado', category: 'Tabelas' },
      { keys: ['Space'], description: 'Selecionar item', category: 'Tabelas' },
      { keys: ['⌘', 'A'], description: 'Selecionar todos', category: 'Tabelas' },
      { keys: ['Shift', 'Click'], description: 'Seleção múltipla', category: 'Tabelas' },
      { keys: ['⌘', 'Click'], description: 'Adicionar à seleção', category: 'Tabelas' },
    ],
  },
  {
    name: 'Ajuda',
    icon: <Keyboard className="h-4 w-4" />,
    shortcuts: [
      { keys: ['?'], description: 'Mostrar atalhos (esta tela)', category: 'Ajuda' },
      { keys: ['⌘', '/'], description: 'Abrir documentação', category: 'Ajuda' },
      { keys: ['⌘', '.'], description: 'Feedback/Suporte', category: 'Ajuda' },
    ],
  },
];

// Key display component
function KeyBadge({ keyName }: { keyName: string }) {
  const displayKey = keyName
    .replace('⌘', navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
    .replace('Shift', '⇧')
    .replace('Enter', '↵')
    .replace('Escape', 'Esc')
    .replace('Delete', 'Del')
    .replace('Space', '␣');
  
  const isArrow = ['↑', '↓', '←', '→'].includes(keyName);
  const isModifier = ['⌘', 'Ctrl', '⇧', 'Shift', 'Alt', 'Option'].includes(keyName);
  
  return (
    <kbd className={cn(
      'inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded',
      'bg-muted border border-border shadow-sm',
      'text-xs font-mono font-medium text-foreground',
      isModifier && 'bg-primary/10 border-primary/20',
      isArrow && 'px-1'
    )}>
      {displayKey}
    </kbd>
  );
}

// Main shortcuts help dialog
interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Filter shortcuts based on search
  const filteredCategories = shortcutCategories.map(category => ({
    ...category,
    shortcuts: category.shortcuts.filter(s => 
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.keys.some(k => k.toLowerCase().includes(search.toLowerCase()))
    ),
  })).filter(c => c.shortcuts.length > 0 || !search);
  
  // Keyboard listener for "?" key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          onOpenChange(true);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-primary" />
              Atalhos de Teclado
            </DialogTitle>
            <Badge variant="secondary" className="gap-1">
              <Command className="h-3 w-3" />
              Pressione ? para abrir
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar atalhos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh]">
          <div className="p-4 space-y-6">
            {filteredCategories.map((category) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {/* Category header */}
                <button
                  onClick={() => setActiveCategory(
                    activeCategory === category.name ? null : category.name
                  )}
                  className="flex items-center gap-2 text-sm font-medium text-foreground w-full hover:text-primary transition-colors"
                >
                  {category.icon}
                  {category.name}
                  <Badge variant="outline" className="ml-auto text-xs">
                    {category.shortcuts.length}
                  </Badge>
                </button>
                
                {/* Shortcuts grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <AnimatePresence>
                    {category.shortcuts.map((shortcut, idx) => (
                      <motion.div
                        key={shortcut.description}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className={cn(
                          'flex items-center justify-between gap-3 p-2 rounded-lg',
                          'hover:bg-muted/50 transition-colors group'
                        )}
                      >
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {shortcut.keys.map((key, i) => (
                            <React.Fragment key={i}>
                              <KeyBadge keyName={key} />
                              {i < shortcut.keys.length - 1 && (
                                <span className="text-muted-foreground text-xs">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
            
            {/* No results */}
            {filteredCategories.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Nenhum atalho encontrado para "{search}"
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="p-3 border-t bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            Dica: Use <KeyBadge keyName="⌘" /> + <KeyBadge keyName="K" /> para busca rápida em qualquer lugar
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to open keyboard shortcuts
export function useKeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  
  return {
    open,
    setOpen,
    KeyboardShortcutsDialog: () => (
      <KeyboardShortcutsHelp open={open} onOpenChange={setOpen} />
    ),
  };
}

export default KeyboardShortcutsHelp;
