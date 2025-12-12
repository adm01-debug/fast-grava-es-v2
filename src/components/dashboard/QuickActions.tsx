import { Link } from 'react-router-dom';
import { Plus, Calendar, LayoutGrid, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const actions = [
  { icon: Plus, label: 'Novo Job', href: '/new-job', primary: true },
  { icon: Calendar, label: 'Calendário', href: '/calendar/daily', primary: false },
  { icon: LayoutGrid, label: 'Kanban', href: '/kanban', primary: false },
  { icon: BarChart3, label: 'Relatórios', href: '/occupancy', primary: false },
];

export function QuickActions() {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display gradient-text">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} to={action.href}>
              <Button 
                variant="outline"
                className={cn(
                  "w-full h-auto py-4 flex-col gap-2 border-border/30 hover:border-primary/50 transition-all",
                  action.primary && "gradient-primary border-0 text-primary-foreground hover:opacity-90 glow-primary"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
