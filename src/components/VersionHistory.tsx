import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, History, RotateCcw, Clock } from 'lucide-react';
import { useVersions } from '@/hooks/useVersions';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VersionHistoryProps {
  entityType: string;
  entityId: string;
  onRestore?: (version: number) => void;
}

export function VersionHistory({ entityType, entityId, onRestore }: VersionHistoryProps) {
  const { versions, isLoading, restoreVersion, currentVersion } = useVersions(entityType, entityId);

  const handleRestore = async (versionNumber: number) => {
    await restoreVersion(versionNumber);
    onRestore?.(versionNumber);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!versions?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <History className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Nenhum histórico de versões</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2 p-2">
        {versions.map((version) => (
          <div
            key={version.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              version.version_number === currentVersion ? 'bg-primary/5 border-primary/20' : 'bg-card'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                v{version.version_number}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {version.change_summary || `Versão ${version.version_number}`}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(version.changed_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>

            {version.version_number !== currentVersion && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRestore(version.version_number)}
                className="gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Restaurar
              </Button>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export default VersionHistory;
