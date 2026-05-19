import { Card, CardContent } from '@/components/ui/card';
import { Bell, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

interface NotificationStats {
  total: number;
  critical: number;
  warning: number;
  unresolved: number;
}

export function NotificationStatsCards({ stats }: { stats: NotificationStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
            <Bell className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Críticos</p><p className="text-2xl font-bold text-destructive">{stats.critical}</p></div>
            <AlertTriangle className="h-8 w-8 text-destructive/50" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Atenção</p><p className="text-2xl font-bold text-warning">{stats.warning}</p></div>
            <TrendingUp className="h-8 w-8 text-warning/50" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Pendentes</p><p className="text-2xl font-bold">{stats.unresolved}</p></div>
            <Clock className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
