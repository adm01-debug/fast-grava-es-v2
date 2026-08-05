import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OperatorsStatsProps {
  total: number;
  active: number;
  inactive: number;
  isLoading: boolean;
}

export function OperatorsStats({ total, active, inactive, isLoading }: OperatorsStatsProps) {
  const cards = [
    {
      label: "Total de Operadores",
      value: total,
      icon: <Users className="h-6 w-6 text-primary-foreground" />,
      iconBg: "gradient-primary"
    },
    {
      label: "Ativos",
      value: active,
      icon: <UserCheck className="h-6 w-6 text-success" />,
      iconBg: "bg-success/20"
    },
    {
      label: "Inativos",
      value: inactive,
      icon: <UserX className="h-6 w-6 text-warning" />,
      iconBg: "bg-warning/20"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, i) => (
        <Card key={i} className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                {card.icon}
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{card.value}</p>
                )}
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
