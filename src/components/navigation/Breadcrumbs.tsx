import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Route to breadcrumb mapping
const routeLabels: Record<string, string> = {
  '': 'Início',
  'dashboard': 'Dashboard',
  'kanban': 'Kanban',
  'jobs': 'Jobs',
  'new-job': 'Novo Job',
  'operators': 'Operadores',
  'operator-view': 'Visão Operador',
  'operator-productivity': 'Produtividade',
  'machines': 'Máquinas',
  'efficiency': 'Eficiência',
  'energy': 'Energia',
  'tpm': 'TPM',
  'oee': 'OEE',
  'spc': 'SPC',
  'kpi': 'KPIs',
  'bi': 'Business Intelligence',
  'ml-predictions': 'Predições ML',
  'abc-costing': 'Custeio ABC',
  'gamification': 'Gamificação',
  'traceability': 'Rastreabilidade',
  'documents': 'Documentos',
  'security': 'Segurança',
  'settings': 'Configurações',
  'notifications': 'Notificações',
  'scanner': 'Scanner QR',
  'shift-handover': 'Passagem de Turno',
  'weekly-calendar': 'Calendário Semanal',
  'daily-calendar': 'Calendário Diário',
  'pending': 'Fila Pendente',
  'alerts': 'Alertas',
  'executive': 'Executivo',
  'technical-assistant': 'Assistente Técnico',
  'knowledge-base': 'Base de Conhecimento',
  'design-system': 'Design System',
  'code-quality': 'Qualidade de Código',
  'bitrix24-config': 'Bitrix24',
  'install-app': 'Instalar App',
};

export function Breadcrumbs({ className }: { className?: string }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on home page
  if (pathnames.length === 0) {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Início', href: '/' },
  ];

  let currentPath = '';
  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathnames.length - 1;
    
    breadcrumbs.push({
      label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: isLast ? undefined : currentPath,
    });
  });

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center gap-1 text-sm text-muted-foreground mb-4", className)}
    >
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
          )}
          {index === 0 && (
            <Home className="h-3.5 w-3.5 mr-0.5" />
          )}
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-foreground transition-colors hover:underline underline-offset-4"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
