import { Link } from 'react-router-dom';
import { Plus, Calendar, LayoutGrid, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const actions = [
  { icon: Plus, label: 'Novo Job', href: '/new-job', variant: 'default' as const },
  { icon: Calendar, label: 'Ver Calendário', href: '/calendar/daily', variant: 'outline' as const },
  { icon: LayoutGrid, label: 'Ver Kanban', href: '/kanban', variant: 'outline' as const },
  { icon: BarChart3, label: 'Relatórios', href: '/occupancy', variant: 'outline' as const },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} to={action.href}>
              <Button 
                variant={action.variant} 
                className="w-full h-auto py-3 flex-col gap-2"
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{action.label}</span>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
