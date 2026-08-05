import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MobileFABProps {
  to?: string;
  label?: string;
  className?: string;
}

/**
 * Floating Action Button for quick job creation on mobile.
 */
export function MobileFAB({ to = '/new-job', label = 'Novo agendamento', className }: MobileFABProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        'lg:hidden fixed bottom-24 right-5 z-40',
        'h-14 w-14 rounded-2xl bg-primary text-primary-foreground',
        'flex items-center justify-center shadow-2xl shadow-primary/30',
        'border border-primary/40 backdrop-blur-sm',
        'transition-all duration-200 active:scale-95 hover:scale-105',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
        'print:hidden',
        className
      )}
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}
