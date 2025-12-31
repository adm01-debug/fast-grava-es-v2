import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { History, RotateCcw, Eye, Loader2, ChevronRight } from 'lucide-react';
import { useVersions, useRestoreVersion, EntityVersion } from '@/hooks/useVersions';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VersionHistoryProps {
  entityType: string;
  entityId: string | null;
  entityName?: string;
  onRestore?: () => void;
}

export function VersionHistory({
  entityType,
  entityId,
  entityName = 'registro',
  onRestore,
}: VersionHistoryProps) {
  const [open, setOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<EntityVersion | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const { versions, isLoading, versionCount } = useVersions(entityType, entityId);
  const restoreVersion = useRestoreVersion(entityType);

  const handleRestore = async () => {
    if (!entityId || !selectedVersion) return;

    await restoreVersion.mutateAsync({
      entityId,
      version: selectedVersion,
    });

    setShowRestoreConfirm(false);
    setSelectedVersion(null);
    onRestore?.();
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatRelativeDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" disabled={!entityId}>
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
            {versionCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {versionCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Histórico de Versões</DialogTitle>
            <DialogDescription>
              Visualize e restaure versões anteriores deste {entityName}.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma versão anterior encontrada.
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <Accordion type="single" collapsible className="w-full">
                {versions.map((version) => (
                  <AccordionItem key={version.id} value={version.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4 text-left">
                        <Badge variant="outline">v{version.version_number}</Badge>
                        <div className="flex-1">
                          <div className="font-medium">
                            {formatRelativeDate(version.changed_at)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(version.changed_at)}
                            {version.user && ` • ${version.user.full_name || version.user.email}`}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {version.change_summary && (
                          <p className="text-sm text-muted-foreground">
                            {version.change_summary}
                          </p>
                        )}
                        <div className="bg-muted rounded-md p-4">
                          <pre className="text-xs overflow-auto max-h-48">
                            {JSON.stringify(version.data, null, 2)}
                          </pre>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedVersion(version);
                              setShowRestoreConfirm(true);
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restaurar esta versão
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de restauração */}
      <Dialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar Versão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja restaurar a versão {selectedVersion?.version_number}?
              Esta ação irá sobrescrever os dados atuais.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreConfirm(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleRestore}
              disabled={restoreVersion.isPending}
            >
              {restoreVersion.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
