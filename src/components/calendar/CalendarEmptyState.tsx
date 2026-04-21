import { CalendarPlus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface CalendarEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export function CalendarEmptyState({ hasFilters, onClearFilters }: CalendarEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
        <div className="relative w-20 h-20 rounded-2xl bg-card border border-border/40 flex items-center justify-center">
          <Calendar className="h-10 w-10 text-muted-foreground" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {hasFilters ? 'Nenhum agendamento encontrado' : 'Agenda vazia para esta data'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {hasFilters
          ? 'Tente ajustar ou limpar os filtros aplicados para ver mais resultados.'
          : 'Crie seu primeiro agendamento ou navegue para outro dia para visualizar a produção.'}
      </p>
      <div className="flex gap-2">
        {hasFilters && onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Limpar filtros
          </Button>
        )}
        <Button asChild>
          <Link to="/new-job">
            <CalendarPlus className="h-4 w-4 mr-2" />
            Novo agendamento
          </Link>
        </Button>
      </div>
    </div>
  );
}
