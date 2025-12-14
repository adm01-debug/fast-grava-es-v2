import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Loader2,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBufferStatus, BufferTechniqueStatus } from '@/hooks/useJobs';
import { useAutoBufferPromotion } from '@/hooks/useAutoBufferPromotion';
import { Skeleton } from '@/components/ui/skeleton';

const BUFFER_TARGET = 3;

interface BufferRowProps {
  data: BufferTechniqueStatus;
  onPromote: () => void;
  isPromoting: boolean;
}

const BufferRow = memo(function BufferRow({ data, onPromote, isPromoting }: BufferRowProps) {
  const { technique, readyCount, queueCount, isHealthy, isCritical } = data;
  const progress = Math.min((readyCount / BUFFER_TARGET) * 100, 100);
  const canPromote = !isHealthy && queueCount > 0;
  
  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all duration-200",
        isCritical && "bg-red-500/10 border-red-500/30",
        !isCritical && !isHealthy && "bg-amber-500/10 border-amber-500/30",
        isHealthy && "bg-green-500/10 border-green-500/30"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: technique.color }}
          />
          <span className="font-medium text-sm">{technique.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Fila:</span>
            <span className="font-semibold text-foreground">{queueCount}</span>
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <div className={cn(
            "flex items-center gap-1",
            isCritical && "text-red-400",
            !isCritical && !isHealthy && "text-amber-400",
            isHealthy && "text-green-400"
          )}>
            <span>Prontos:</span>
            <span className="font-bold">{readyCount}/{BUFFER_TARGET}</span>
          </div>
        </div>
      </div>
      
      <Progress 
        value={progress} 
        className={cn(
          "h-2",
          isCritical && "[&>div]:bg-red-500",
          !isCritical && !isHealthy && "[&>div]:bg-amber-500",
          isHealthy && "[&>div]:bg-green-500"
        )}
      />
      
      <div className="flex items-center justify-between mt-2">
        <div>
          {isCritical && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Buffer vazio! Preparar jobs urgentemente.
            </p>
          )}
          {!isCritical && !isHealthy && (
            <p className="text-xs text-amber-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Buffer abaixo do ideal. Preparar mais {BUFFER_TARGET - readyCount} job(s).
            </p>
          )}
        </div>
        {canPromote && (
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-6 text-xs",
              isCritical && "text-red-400 hover:text-red-300 hover:bg-red-500/10",
              !isCritical && "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
            )}
            onClick={onPromote}
            disabled={isPromoting}
          >
            {isPromoting ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Zap className="h-3 w-3 mr-1" />
            )}
            Promover
          </Button>
        )}
      </div>
    </div>
  );
});
BufferRow.displayName = 'BufferRow';

function BufferStatusWidgetComponent() {
  const { bufferByTechnique, isLoading } = useBufferStatus();
  const { triggerPromotion, promoteForTechnique, isPromoting } = useAutoBufferPromotion({ 
    enabled: true, 
    showToasts: true 
  });

  const { criticalCount, warningCount, healthyCount, hasUnhealthyTechniques } = useMemo(() => ({
    criticalCount: bufferByTechnique.filter(b => b.isCritical).length,
    warningCount: bufferByTechnique.filter(b => b.isWarning).length,
    healthyCount: bufferByTechnique.filter(b => b.isHealthy).length,
    hasUnhealthyTechniques: bufferByTechnique.some(b => !b.isHealthy && b.queueCount > 0),
  }), [bufferByTechnique]);

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-400" />
            Buffer "No Jeito"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card card-interactive card-shine animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:0.1s]">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center dark:glow-warning">
              <Package className="h-4 w-4 text-warning" />
            </div>
            <span className="gradient-text">Buffer "No Jeito"</span>
          </CardTitle>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {hasUnhealthyTechniques && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                onClick={() => triggerPromotion()}
                disabled={isPromoting}
              >
                {isPromoting ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Promover Todos
              </Button>
            )}
            {criticalCount > 0 && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <AlertCircle className="h-3 w-3" />
                {criticalCount}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="border-amber-500 text-amber-500 gap-1 text-xs">
                <AlertTriangle className="h-3 w-3" />
                {warningCount}
              </Badge>
            )}
            {healthyCount > 0 && (
              <Badge variant="outline" className="border-green-500 text-green-500 gap-1 text-xs">
                <CheckCircle2 className="h-3 w-3" />
                {healthyCount}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Meta: manter {BUFFER_TARGET} jobs preparados por técnica (promoção automática ativada)
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {bufferByTechnique.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Nenhum job na fila ou preparado</p>
          </div>
        ) : (
          bufferByTechnique.map((data) => (
            <BufferRow 
              key={data.technique.id} 
              data={data}
              onPromote={() => promoteForTechnique(data.technique.id)}
              isPromoting={isPromoting}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

export const BufferStatusWidget = memo(BufferStatusWidgetComponent);
BufferStatusWidget.displayName = 'BufferStatusWidget';
