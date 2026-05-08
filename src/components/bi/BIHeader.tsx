import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FavoriteButton, FavoritesDropdown } from '@/components/navigation/FavoritesManager';
import { BarChart3, Activity, GitCompare, Command } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BIHeaderProps {
  comparisonMode: boolean;
  setComparisonMode: (v: boolean) => void;
  onNavigate: (path: string) => void;
}

export function BIHeader({ comparisonMode, setComparisonMode, onNavigate }: BIHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl border border-border/40 shadow-inner">
        <Switch id="comparison-mode" checked={comparisonMode} onCheckedChange={setComparisonMode} />
        <Label htmlFor="comparison-mode" className="text-sm font-bold cursor-pointer flex items-center gap-2 text-foreground/80">
          <GitCompare className="h-4 w-4 text-primary" />
          Modo Comparativo
        </Label>
      </div>
      <Badge variant="outline" className="h-10 px-4 rounded-xl border-primary/20 bg-primary/5 animate-pulse-glow text-xs font-black tracking-widest uppercase text-primary">
        <Activity className="h-3.5 w-3.5 mr-2" />
        Real-time Matrix
      </Badge>
    </div>
  );
}
