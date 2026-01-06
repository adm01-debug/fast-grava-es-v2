import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Briefcase,
  Wrench,
  Users,
  Settings,
  BarChart3,
  Calendar,
  FileText,
  Zap,
  Clock,
  Star,
  ArrowRight,
  Layers,
  Package,
  AlertTriangle,
  CheckCircle2,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Types
interface SwitchableItem {
  id: string;
  type: 'job' | 'machine' | 'operator' | 'maintenance' | 'lot' | 'report';
  title: string;
  subtitle?: string;
  status?: 'active' | 'pending' | 'completed' | 'warning' | 'error';
  meta?: string;
  path: string;
  icon?: React.ReactNode;
  priority?: number;
}

interface QuickSwitcherProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Status colors and icons
const statusConfig = {
  active: { color: 'bg-green-500', icon: CheckCircle2, label: 'Ativo' },
  pending: { color: 'bg-yellow-500', icon: Timer, label: 'Pendente' },
  completed: { color: 'bg-blue-500', icon: CheckCircle2, label: 'Concluído' },
  warning: { color: 'bg-orange-500', icon: AlertTriangle, label: 'Atenção' },
  error: { color: 'bg-red-500', icon: AlertTriangle, label: 'Erro' },
};

// Type icons
const typeIcons = {
  job: Briefcase,
  machine: Wrench,
  operator: Users,
  maintenance: Settings,
  lot: Package,
  report: FileText,
};

const typeLabels = {
  job: 'Job',
  machine: 'Máquina',
  operator: 'Operador',
  maintenance: 'Manutenção',
  lot: 'Lote',
  report: 'Relatório',
};

// Mock data - em produção, isso viria do backend
const mockRecentItems: SwitchableItem[] = [
  { id: '1', type: 'job', title: 'JOB-2024-001', subtitle: 'Cliente ABC', status: 'active', meta: 'Flexografia', path: '/jobs', priority: 1 },
  { id: '2', type: 'machine', title: 'FLEXO-01', subtitle: 'Flexografia', status: 'active', meta: 'Em produção', path: '/machines', priority: 2 },
  { id: '3', type: 'maintenance', title: 'Manutenção Preventiva', subtitle: 'FLEXO-02', status: 'pending', meta: 'Amanhã', path: '/maintenance', priority: 3 },
];

const mockFavoriteItems: SwitchableItem[] = [
  { id: '4', type: 'job', title: 'JOB-2024-005', subtitle: 'Cliente XYZ', status: 'pending', meta: 'Rotogravura', path: '/jobs', priority: 1 },
  { id: '5', type: 'machine', title: 'ROTO-01', subtitle: 'Rotogravura', status: 'active', meta: 'Disponível', path: '/machines', priority: 2 },
];

const mockAllItems: SwitchableItem[] = [
  ...mockRecentItems,
  ...mockFavoriteItems,
  { id: '6', type: 'lot', title: 'LOT-2024-100', subtitle: 'Produto A', status: 'completed', meta: '1000 unidades', path: '/traceability', priority: 4 },
  { id: '7', type: 'operator', title: 'João Silva', subtitle: 'Operador Sênior', status: 'active', meta: 'Flexografia', path: '/operators', priority: 5 },
  { id: '8', type: 'report', title: 'Relatório de Produção', subtitle: 'Janeiro 2024', status: 'completed', meta: 'PDF', path: '/reports', priority: 6 },
];

// Quick actions
const quickActions = [
  { id: 'new-job', label: 'Novo Job', icon: Briefcase, path: '/jobs', shortcut: 'N' },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/', shortcut: 'D' },
  { id: 'schedule', label: 'Agenda', icon: Calendar, path: '/scheduler', shortcut: 'A' },
  { id: 'energy', label: 'Energia', icon: Zap, path: '/energy', shortcut: 'E' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/reports', shortcut: 'R' },
];

export function QuickSwitcher({ isOpen, onOpenChange }: QuickSwitcherProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Filter items based on search and type
  const filteredItems = useMemo(() => {
    let items = mockAllItems;
    
    if (selectedType) {
      items = items.filter(item => item.type === selectedType);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.subtitle?.toLowerCase().includes(searchLower) ||
        item.meta?.toLowerCase().includes(searchLower)
      );
    }
    
    return items.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }, [search, selectedType]);

  // Handle item selection
  const handleSelect = useCallback((item: SwitchableItem) => {
    navigate(item.path);
    onOpenChange(false);
    setSearch('');
    setSelectedType(null);
  }, [navigate, onOpenChange]);

  // Handle quick action
  const handleQuickAction = useCallback((path: string) => {
    navigate(path);
    onOpenChange(false);
    setSearch('');
  }, [navigate, onOpenChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd/Ctrl + K + K (double K for switcher)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && e.shiftKey) {
        e.preventDefault();
        onOpenChange(!isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpenChange]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedType(null);
    }
  }, [isOpen]);

  const renderItem = (item: SwitchableItem, showType = true) => {
    const TypeIcon = typeIcons[item.type];
    const StatusIcon = item.status ? statusConfig[item.status].icon : null;

    return (
      <CommandItem
        key={item.id}
        value={`${item.title} ${item.subtitle} ${item.meta}`}
        onSelect={() => handleSelect(item)}
        className="flex items-center gap-3 p-3 cursor-pointer"
      >
        <div className={cn(
          "flex items-center justify-center h-10 w-10 rounded-lg",
          "bg-primary/10 text-primary"
        )}>
          <TypeIcon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{item.title}</span>
            {item.status && StatusIcon && (
              <div className={cn(
                "h-2 w-2 rounded-full",
                statusConfig[item.status].color
              )} />
            )}
          </div>
          {item.subtitle && (
            <p className="text-sm text-muted-foreground truncate">
              {item.subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {item.meta && (
            <Badge variant="secondary" className="text-xs">
              {item.meta}
            </Badge>
          )}
          {showType && (
            <Badge variant="outline" className="text-xs">
              {typeLabels[item.type]}
            </Badge>
          )}
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CommandItem>
    );
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border shadow-lg">
        <div className="flex items-center border-b px-3">
          <Layers className="h-4 w-4 text-muted-foreground mr-2" />
          <CommandInput
            placeholder="Trocar para... (job, máquina, lote...)"
            value={search}
            onValueChange={setSearch}
            className="flex-1"
          />
        </div>

        {/* Type filters */}
        <div className="flex items-center gap-1 p-2 border-b overflow-x-auto">
          <Badge
            variant={selectedType === null ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setSelectedType(null)}
          >
            Todos
          </Badge>
          {Object.entries(typeLabels).map(([type, label]) => {
            const Icon = typeIcons[type as keyof typeof typeIcons];
            return (
              <Badge
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap gap-1"
                onClick={() => setSelectedType(type)}
              >
                <Icon className="h-3 w-3" />
                {label}
              </Badge>
            );
          })}
        </div>

        <CommandList>
          <ScrollArea className="h-[400px]">
            <CommandEmpty>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Layers className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum item encontrado para "{search}"
                </p>
              </div>
            </CommandEmpty>

            {!search && !selectedType && (
              <>
                {/* Quick Actions */}
                <CommandGroup heading="Ações Rápidas">
                  <div className="grid grid-cols-5 gap-2 p-2">
                    {quickActions.map((action) => (
                      <motion.button
                        key={action.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickAction(action.path)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-lg",
                          "bg-muted/50 hover:bg-muted transition-colors",
                          "text-center"
                        )}
                      >
                        <action.icon className="h-5 w-5 text-primary" />
                        <span className="text-xs font-medium">{action.label}</span>
                        <kbd className="text-[10px] text-muted-foreground bg-background px-1 rounded">
                          {action.shortcut}
                        </kbd>
                      </motion.button>
                    ))}
                  </div>
                </CommandGroup>

                <CommandSeparator />

                {/* Recent Items */}
                <CommandGroup heading={
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Recentes</span>
                  </div>
                }>
                  {mockRecentItems.map(item => renderItem(item))}
                </CommandGroup>

                <CommandSeparator />

                {/* Favorites */}
                <CommandGroup heading={
                  <div className="flex items-center gap-2">
                    <Star className="h-3 w-3" />
                    <span>Favoritos</span>
                  </div>
                }>
                  {mockFavoriteItems.map(item => renderItem(item))}
                </CommandGroup>
              </>
            )}

            {/* Search Results */}
            {(search || selectedType) && filteredItems.length > 0 && (
              <CommandGroup heading="Resultados">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      {renderItem(item, !selectedType)}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CommandGroup>
            )}
          </ScrollArea>
        </CommandList>

        {/* Footer */}
        <div className="flex items-center justify-between p-2 border-t bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border">↵</kbd>
              Selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border">↑↓</kbd>
              Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border">Esc</kbd>
              Fechar
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background rounded border">⌘⇧K</kbd>
            Quick Switcher
          </span>
        </div>
      </Command>
    </CommandDialog>
  );
}

// Hook to manage Quick Switcher state
export function useQuickSwitcher() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, setIsOpen };
}
