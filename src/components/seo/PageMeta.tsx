import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageMetaProps {
  title?: string;
  description?: string;
  noIndex?: boolean;
}

// Route to meta mapping
const routeMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Dashboard',
    description: 'Visão geral da produção e métricas principais',
  },
  '/calendar/daily': {
    title: 'Agenda Diária',
    description: 'Visualize e gerencie os jobs programados para hoje',
  },
  '/calendar/weekly': {
    title: 'Agenda Semanal',
    description: 'Planejamento semanal de produção',
  },
  '/kanban': {
    title: 'Kanban',
    description: 'Gerencie o fluxo de trabalho com visualização Kanban',
  },
  '/pending': {
    title: 'Fila de Espera',
    description: 'Jobs aguardando agendamento',
  },
  '/alerts': {
    title: 'Alertas',
    description: 'Notificações e alertas do sistema',
  },
  '/kpis': {
    title: 'KPIs',
    description: 'Indicadores de desempenho da produção',
  },
  '/operator': {
    title: 'Painel do Operador',
    description: 'Área do operador para registro de produção',
  },
  '/operators': {
    title: 'Operadores',
    description: 'Gerenciamento de operadores',
  },
  '/operators/productivity': {
    title: 'Produtividade',
    description: 'Análise de produtividade dos operadores',
  },
  '/efficiency': {
    title: 'Eficiência',
    description: 'Dashboard de eficiência operacional',
  },
  '/oee': {
    title: 'OEE',
    description: 'Overall Equipment Effectiveness - Eficiência Global dos Equipamentos',
  },
  '/abc': {
    title: 'Custos ABC',
    description: 'Custeio baseado em atividades',
  },
  '/tpm': {
    title: 'TPM',
    description: 'Total Productive Maintenance - Manutenção Produtiva Total',
  },
  '/ml-predictions': {
    title: 'Predições ML',
    description: 'Previsões baseadas em Machine Learning',
  },
  '/bi': {
    title: 'Business Intelligence',
    description: 'Análises e relatórios gerenciais',
  },
  '/spc': {
    title: 'Controle Estatístico',
    description: 'SPC - Statistical Process Control',
  },
  '/executive': {
    title: 'Dashboard Executivo',
    description: 'Visão executiva consolidada',
  },
  '/energy': {
    title: 'Energia',
    description: 'Monitoramento de consumo energético',
  },
  '/gamification': {
    title: 'Gamificação',
    description: 'Rankings, conquistas e recompensas',
  },
  '/traceability': {
    title: 'Rastreabilidade',
    description: 'Rastreamento de lotes e componentes',
  },
  '/documents': {
    title: 'Documentos',
    description: 'Documentos técnicos e fichas de produção',
  },
  '/knowledge': {
    title: 'Base de Conhecimento',
    description: 'Documentação técnica e tutoriais',
  },
  '/assistant': {
    title: 'Assistente Técnico',
    description: 'Assistente inteligente para suporte técnico',
  },
  '/scanner': {
    title: 'QR Scanner',
    description: 'Escaneie QR codes para rastreamento',
  },
  '/shift-handover': {
    title: 'Passagem de Turno',
    description: 'Registro de passagem de turno',
  },
  '/notifications': {
    title: 'Notificações',
    description: 'Central de notificações',
  },
  '/settings': {
    title: 'Configurações',
    description: 'Configurações do sistema',
  },
  '/security': {
    title: 'Segurança',
    description: 'Configurações de segurança e auditoria',
  },
  '/machines': {
    title: 'Máquinas',
    description: 'Gerenciamento de máquinas',
  },
  '/new-job': {
    title: 'Novo Job',
    description: 'Criar novo job de produção',
  },
  '/install': {
    title: 'Instalar App',
    description: 'Instale o FastGrava como aplicativo',
  },
  '/kiosk': {
    title: 'Modo Kiosk',
    description: 'Modo simplificado para operadores',
  },
  '/auth': {
    title: 'Login',
    description: 'Acesse sua conta FastGrava',
  },
  '/reset-password': {
    title: 'Redefinir Senha',
    description: 'Redefina sua senha de acesso',
  },
};

const APP_NAME = 'FastGrava';

export function PageMeta({ title, description, noIndex }: PageMetaProps) {
  const location = useLocation();
  
  useEffect(() => {
    // Get meta from route or use props
    const routeInfo = routeMeta[location.pathname];
    const pageTitle = title || routeInfo?.title;
    const pageDescription = description || routeInfo?.description;
    
    // Update document title
    if (pageTitle) {
      document.title = `${pageTitle} | ${APP_NAME}`;
    } else {
      document.title = APP_NAME;
    }
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    if (pageDescription) {
      metaDescription.setAttribute('content', pageDescription);
    }
    
    // Handle noIndex
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (robotsMeta) {
      robotsMeta.remove();
    }
    
    // Cleanup
    return () => {
      document.title = APP_NAME;
    };
  }, [location.pathname, title, description, noIndex]);
  
  return null;
}

// Hook for programmatic title updates
export function usePageTitle(title?: string) {
  const location = useLocation();
  
  useEffect(() => {
    const routeInfo = routeMeta[location.pathname];
    const pageTitle = title || routeInfo?.title;
    
    if (pageTitle) {
      document.title = `${pageTitle} | ${APP_NAME}`;
    } else {
      document.title = APP_NAME;
    }
    
    return () => {
      document.title = APP_NAME;
    };
  }, [location.pathname, title]);
}

// Get page info for current route
export function usePageInfo() {
  const location = useLocation();
  const routeInfo = routeMeta[location.pathname];
  
  return {
    title: routeInfo?.title || 'FastGrava',
    description: routeInfo?.description || '',
    pathname: location.pathname,
  };
}

export default PageMeta;
