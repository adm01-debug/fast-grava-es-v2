import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  'operator': 'Visão Operador',
  'operator-view': 'Visão Operador',
  'productivity': 'Produtividade',
  'machines': 'Máquinas',
  'efficiency': 'Eficiência',
  'energy': 'Energia',
  'tpm': 'TPM',
  'oee': 'OEE',
  'spc': 'SPC',
  'kpis': 'KPIs',
  'bi': 'Business Intelligence',
  'ml-predictions': 'Predições ML',
  'abc': 'Custeio ABC',
  'gamification': 'Gamificação',
  'traceability': 'Rastreabilidade',
  'documents': 'Documentos',
  'security': 'Segurança',
  'settings': 'Configurações',
  'notifications': 'Notificações',
  'scanner': 'Scanner QR',
  'shift-handover': 'Passagem de Turno',
  'weekly': 'Semanal',
  'daily': 'Diário',
  'calendar': 'Calendário',
  'pending': 'Fila Pendente',
  'alerts': 'Alertas',
  'executive': 'Fábrica Autônoma',
  'assistant': 'Assistente Técnico',
  'knowledge': 'Base de Conhecimento',
  'design-system': 'Design System',
  'code-quality': 'Qualidade de Código',
  'integrations': 'Integrações',
  'bitrix24': 'Bitrix24',
  'install': 'Instalar App',
  'auth': 'Autenticação',
  'reset-password': 'Redefinir Senha',
};

export function Breadcrumbs({ className }: { className?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2 text-sm text-muted-foreground mb-4", className)}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Voltar"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
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
      </div>
    </nav>
  );
}
