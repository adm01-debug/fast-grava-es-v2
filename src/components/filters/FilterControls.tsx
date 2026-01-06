import { RotateCcw, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { copyFiltersUrl } from '@/hooks/useUrlFilters';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FilterControlsProps {
  onReset: () => void;
  hasActiveFilters: boolean;
  activeFilterCount?: number;
  className?: string;
}

export function FilterControls({
  onReset,
  hasActiveFilters,
  activeFilterCount,
  className,
}: FilterControlsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const success = await copyFiltersUrl();
    if (success) {
      setCopied(true);
      toast.success('Link copiado para a área de transferência');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Erro ao copiar link');
    }
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        {hasActiveFilters && activeFilterCount !== undefined && (
          <Badge variant="secondary" className="text-xs">
            {activeFilterCount} filtro(s) ativo(s)
          </Badge>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-8 w-8"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Compartilhar filtros</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              disabled={!hasActiveFilters}
              className="h-8 w-8"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Limpar filtros</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
