import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const APP_NAME = '52 STÚDIOS DE GRAVAÇÃO';

/**
 * Map of route paths to page titles.
 * Supports exact and prefix matching.
 */
const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/auth': 'Login',
  '/reset-password': 'Redefinir Senha',
  '/calendar/daily': 'Calendário Diário',
  '/calendar/weekly': 'Calendário Semanal',
  '/pending': 'Fila de Espera',
  '/alerts': 'Alertas',
  '/kanban': 'Kanban',
  '/new-job': 'Nova Ordem',
  '/kpis': 'KPIs',
  '/efficiency': 'Eficiência',
  '/oee': 'OEE',
  '/spc': 'SPC',
  '/executive': 'Dashboard Executivo',
  '/bi': 'Business Intelligence',
  '/abc-costing': 'Custeio ABC',
  '/tpm': 'TPM',
  '/ml-predictions': 'Predições ML',
  '/operator': 'Painel do Operador',
  '/operators': 'Operadores',
  '/operator-productivity': 'Produtividade',
  '/operator-history': 'Histórico do Operador',
  '/machines': 'Máquinas',
  '/machines/compare': 'Comparação de Máquinas',
  '/energy': 'Energia',
  '/traceability': 'Rastreabilidade',
  '/assistant': 'Assistente Técnico',
  '/knowledge': 'Base de Conhecimento',
  '/documents': 'Documentos',
  '/scanner': 'QR Scanner',
  '/shift-handover': 'Passagem de Turno',
  '/gamification': 'Gamificação',
  '/notifications': 'Notificações',
  '/integrations/bitrix24': 'Integração Bitrix24',
  '/settings': 'Configurações',
  '/security': 'Segurança',
  '/code-quality': 'Qualidade de Código',
  '/admin/telemetria': 'Telemetria',
  '/kiosk': 'Kiosk',
  '/install': 'Instalar App',
  '/design-system': 'Design System',
};

/**
 * Sets document.title based on current route.
 * Usage: call once in AppRoutes or in a layout component.
 */
export function usePageTitle(customTitle?: string) {
  const location = useLocation();

  useEffect(() => {
    if (customTitle) {
      document.title = `${customTitle} | ${APP_NAME}`;
      return;
    }

    const title = ROUTE_TITLES[location.pathname];
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [location.pathname, customTitle]);
}
