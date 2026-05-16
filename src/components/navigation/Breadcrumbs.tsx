import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import { useCallback } from 'react';

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
  'abc-costing': 'Custeio ABC',
  'compare': 'Comparação',
  'audit': 'Auditoria',
  'master-api': 'Master API',
  'telemetria': 'Telemetria',
  'kiosk': 'Kiosk',
  'track': 'Rastreio Público'
};

export function Breadcrumbs({ className }: { className?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { trigger } = useHapticFeedback();
  const pathnames = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on home page or auth pages
  if (pathnames.length === 0 || location.pathname === '/auth') {
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

  const handleBack = useCallback(() => {
    trigger('light');
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate, trigger]);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground no-export animate-in fade-in slide-in-from-left-4 duration-300",
        className
      )}
    >
      {/* Retirado botão ArrowLeft pois agora temos o BackButton centralizado no MainLayout */}


      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none whitespace-nowrap px-1 scroll-smooth mask-fade-right">
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 opacity-40 text-muted-foreground/60" />
            )}
            {index === 0 ? (
              <Link
                to="/"
                onClick={() => trigger('light')}
                className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-primary/15 hover:text-foreground transition-all hover:scale-110 active:scale-95 shadow-sm border border-transparent hover:border-primary/30 group/home"
                aria-label="Ir para o início"

              >
                <Home className="h-4 w-4 transition-transform group-hover/home:rotate-[-5deg]" />
              </Link>
            ) : item.href ? (
              <Link
                to={item.href}
                onClick={() => trigger('light')}
                className="px-2.5 py-1 rounded-md hover:bg-primary/15 hover:text-foreground transition-all hover:scale-105 active:scale-95 hover:underline underline-offset-4 border border-transparent hover:border-primary/30 font-medium text-muted-foreground/80"
              >

                {item.label}
              </Link>
            ) : (
              <span className="px-3 py-1 text-foreground font-bold tracking-tight bg-primary/10 rounded-md border border-primary/20 shadow-sm animate-in zoom-in-95 duration-300">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}