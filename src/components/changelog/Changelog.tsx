import React, { useState, useEffect, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Bug, 
  Wrench, 
  AlertTriangle, 
  Rocket,
  Gift,
  ChevronRight,
  X,
  Bell,
  ExternalLink,
  Calendar,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
type ChangeType = 'feature' | 'fix' | 'improvement' | 'breaking' | 'security' | 'other';

interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  title: string;
  description?: string;
  changes: {
    type: ChangeType;
    title: string;
    description?: string;
  }[];
  isNew?: boolean;
}

interface ChangelogContextType {
  entries: ChangelogEntry[];
  lastSeenVersion: string | null;
  markAsSeen: () => void;
  hasNewChanges: boolean;
  getUnseenChanges: () => ChangelogEntry[];
}

// Sample changelog data
const sampleChangelog: ChangelogEntry[] = [
  {
    id: '1',
    version: '2.0.0',
    date: '2024-01-15',
    title: 'Grande Atualização - Dashboard Redesenhado',
    description: 'Esta versão traz um redesign completo do dashboard com novos recursos.',
    isNew: true,
    changes: [
      { type: 'feature', title: 'Novo dashboard visual', description: 'Interface completamente redesenhada com melhor UX' },
      { type: 'feature', title: 'Modo escuro automático', description: 'Agora o tema muda automaticamente baseado nas preferências do sistema' },
      { type: 'improvement', title: 'Performance 50% melhor', description: 'Otimizações significativas no carregamento' },
      { type: 'fix', title: 'Correção de bugs de autenticação' },
      { type: 'breaking', title: 'API v1 descontinuada', description: 'Migre para a API v2 até março' },
    ],
  },
  {
    id: '2',
    version: '1.9.5',
    date: '2024-01-10',
    title: 'Correções e Melhorias',
    changes: [
      { type: 'fix', title: 'Correção no upload de arquivos grandes' },
      { type: 'fix', title: 'Bug no filtro de datas corrigido' },
      { type: 'improvement', title: 'Melhor feedback de loading' },
      { type: 'security', title: 'Atualização de dependências de segurança' },
    ],
  },
  {
    id: '3',
    version: '1.9.0',
    date: '2024-01-05',
    title: 'Novos Recursos de Relatórios',
    changes: [
      { type: 'feature', title: 'Exportação para PDF', description: 'Agora é possível exportar relatórios em PDF' },
      { type: 'feature', title: 'Gráficos interativos' },
      { type: 'improvement', title: 'Filtros salvos persistentes' },
    ],
  },
];

// Context
const ChangelogContext = createContext<ChangelogContextType | null>(null);

export function useChangelog() {
  const context = useContext(ChangelogContext);
  if (!context) {
    throw new Error('useChangelog must be used within ChangelogProvider');
  }
  return context;
}

// Provider
export function ChangelogProvider({ 
  children,
  entries = sampleChangelog,
}: { 
  children: React.ReactNode;
  entries?: ChangelogEntry[];
}) {
  const [lastSeenVersion, setLastSeenVersion] = useState<string | null>(() => 
    localStorage.getItem('changelog-last-seen')
  );

  const latestVersion = entries[0]?.version;
  const hasNewChanges = latestVersion !== lastSeenVersion;

  const markAsSeen = () => {
    if (latestVersion) {
      localStorage.setItem('changelog-last-seen', latestVersion);
      setLastSeenVersion(latestVersion);
    }
  };

  const getUnseenChanges = () => {
    if (!lastSeenVersion) return entries;
    const lastSeenIndex = entries.findIndex(e => e.version === lastSeenVersion);
    return lastSeenIndex === -1 ? entries : entries.slice(0, lastSeenIndex);
  };

  return (
    <ChangelogContext.Provider value={{
      entries,
      lastSeenVersion,
      markAsSeen,
      hasNewChanges,
      getUnseenChanges,
    }}>
      {children}
    </ChangelogContext.Provider>
  );
}

// Change Type Badge
function ChangeTypeBadge({ type }: { type: ChangeType }) {
  const config: Record<ChangeType, { label: string; icon: React.ReactNode; className: string }> = {
    feature: { 
      label: 'Novo', 
      icon: <Sparkles className="w-3 h-3" />, 
      className: 'bg-green-500/10 text-green-600 border-green-500/20' 
    },
    fix: { 
      label: 'Correção', 
      icon: <Bug className="w-3 h-3" />, 
      className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
    },
    improvement: { 
      label: 'Melhoria', 
      icon: <Wrench className="w-3 h-3" />, 
      className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' 
    },
    breaking: { 
      label: 'Breaking', 
      icon: <AlertTriangle className="w-3 h-3" />, 
      className: 'bg-red-500/10 text-red-600 border-red-500/20' 
    },
    security: { 
      label: 'Segurança', 
      icon: <AlertTriangle className="w-3 h-3" />, 
      className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' 
    },
    other: { 
      label: 'Outro', 
      icon: <Gift className="w-3 h-3" />, 
      className: 'bg-gray-500/10 text-gray-600 border-gray-500/20' 
    },
  };

  const { label, icon, className } = config[type];

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      {icon}
      {label}
    </Badge>
  );
}

// Single Change Item
function ChangeItem({ change }: { change: ChangelogEntry['changes'][0] }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <ChangeTypeBadge type={change.type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{change.title}</p>
        {change.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{change.description}</p>
        )}
      </div>
    </div>
  );
}

// Version Entry
function VersionEntry({ entry, isExpanded = false }: { entry: ChangelogEntry; isExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(isExpanded);

  return (
    <Card className={cn(entry.isNew && 'border-primary/50 bg-primary/5')}>
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono">
              <Tag className="w-3 h-3 mr-1" />
              v{entry.version}
            </Badge>
            {entry.isNew && (
              <Badge className="bg-primary text-primary-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                Novo
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {formatDistanceToNow(new Date(entry.date), { addSuffix: true, locale: ptBR })}
            <ChevronRight className={cn('w-4 h-4 transition-transform', expanded && 'rotate-90')} />
          </div>
        </div>
        <CardTitle className="text-lg mt-2">{entry.title}</CardTitle>
        {entry.description && (
          <p className="text-sm text-muted-foreground">{entry.description}</p>
        )}
      </CardHeader>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              <div className="border-t border-border pt-4 space-y-1">
                {entry.changes.map((change, index) => (
                  <ChangeItem key={index} change={change} />
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// Full Changelog List
export function ChangelogList({ className }: { className?: string }) {
  const { entries } = useChangelog();

  return (
    <div className={cn('space-y-4', className)}>
      {entries.map((entry, index) => (
        <VersionEntry key={entry.id} entry={entry} isExpanded={index === 0} />
      ))}
    </div>
  );
}

// What's New Modal
export function WhatsNewModal({ 
  trigger,
  title = "O que há de novo?",
}: { 
  trigger?: React.ReactNode;
  title?: string;
}) {
  const { hasNewChanges, getUnseenChanges, markAsSeen, entries } = useChangelog();
  const [open, setOpen] = useState(false);
  const unseenChanges = getUnseenChanges();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      markAsSeen();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="relative">
            <Rocket className="w-4 h-4 mr-2" />
            {title}
            {hasNewChanges && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {(unseenChanges.length > 0 ? unseenChanges : entries.slice(0, 3)).map((entry, index) => (
              <VersionEntry key={entry.id} entry={entry} isExpanded={index === 0} />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Notification Badge Button
export function ChangelogNotificationBadge({ className }: { className?: string }) {
  const { hasNewChanges, getUnseenChanges } = useChangelog();
  const unseenCount = getUnseenChanges().length;

  if (!hasNewChanges) return null;

  return (
    <WhatsNewModal
      trigger={
        <Button variant="ghost" size="icon" className={cn('relative', className)}>
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
            {unseenCount}
          </span>
        </Button>
      }
    />
  );
}

// Floating Announcement Banner
export function AnnouncementBanner({
  entry,
  onDismiss,
  className,
}: {
  entry?: ChangelogEntry;
  onDismiss?: () => void;
  className?: string;
}) {
  const { entries, markAsSeen, hasNewChanges } = useChangelog();
  const latestEntry = entry || entries[0];
  const [dismissed, setDismissed] = useState(false);

  if (!hasNewChanges || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    markAsSeen();
    onDismiss?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'bg-primary text-primary-foreground px-4 py-2 flex items-center justify-center gap-4',
        className
      )}
    >
      <Sparkles className="w-4 h-4" />
      <span className="text-sm">
        <strong>v{latestEntry.version}</strong> - {latestEntry.title}
      </span>
      <WhatsNewModal
        trigger={
          <Button variant="secondary" size="sm" className="h-7">
            Ver detalhes
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        }
      />
      <button onClick={handleDismiss} className="p-1 hover:bg-primary-foreground/10 rounded">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Inline Update Card
export function InlineUpdateCard({ className }: { className?: string }) {
  const { entries, hasNewChanges, markAsSeen } = useChangelog();
  const latestEntry = entries[0];

  if (!hasNewChanges || !latestEntry) return null;

  return (
    <Card className={cn('border-primary/50 bg-primary/5', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">Nova Atualização Disponível</h4>
                <Badge variant="outline" className="font-mono text-xs">
                  v{latestEntry.version}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{latestEntry.title}</p>
              <div className="flex gap-1 mt-2">
                {latestEntry.changes.slice(0, 3).map((change, i) => (
                  <ChangeTypeBadge key={i} type={change.type} />
                ))}
                {latestEntry.changes.length > 3 && (
                  <Badge variant="outline">+{latestEntry.changes.length - 3}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <WhatsNewModal
              trigger={
                <Button size="sm">Ver detalhes</Button>
              }
            />
            <Button variant="ghost" size="sm" onClick={markAsSeen}>
              Ignorar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Timeline View
export function ChangelogTimeline({ className }: { className?: string }) {
  const { entries } = useChangelog();

  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      
      <div className="space-y-8">
        {entries.map((entry) => (
          <div key={entry.id} className="relative pl-10">
            <div className="absolute left-0 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
              <Tag className="w-4 h-4 text-primary" />
            </div>
            
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">v{entry.version}</Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(entry.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              <h3 className="text-lg font-semibold mt-1">{entry.title}</h3>
              {entry.description && (
                <p className="text-sm text-muted-foreground">{entry.description}</p>
              )}
            </div>
            
            <div className="space-y-2 mt-3">
              {entry.changes.map((change, index) => (
                <ChangeItem key={index} change={change} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
