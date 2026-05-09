import {
  Calendar, CalendarDays, CalendarRange, LayoutGrid, List, AlertTriangle, Settings, Users, Home,
  BarChart3, Gauge, Coins, Wrench, Brain, Code2, Zap, Bot, QrCode, RefreshCw,
  BookOpen, Palette, Download, Bell, ArrowRightLeft, Package, Activity, FileDown,
  Trophy, BatteryCharging, FileText, Cog, TrendingUp, Cpu, UserCircle, ShieldCheck,
  Factory
} from 'lucide-react';
import { NavGroup } from './NavGroupComponent';
import { NavItem } from './NavButton';

export const navGroups: NavGroup[] = [
  { id: 'home', icon: Home, label: 'Início', items: [{ icon: Home, label: 'Dashboard', href: '/' }], defaultOpen: true },
  { id: 'planning', icon: Calendar, label: 'Planejamento', items: [
    { icon: Calendar, label: 'Calendário Diário', href: '/calendar/daily' },
    { icon: CalendarDays, label: 'Calendário Semanal', href: '/calendar/weekly' },
    { icon: CalendarRange, label: 'Calendário Mensal', href: '/calendar/monthly' },
    { icon: LayoutGrid, label: 'Kanban', href: '/kanban' },
    { icon: List, label: 'Pendências', href: '/pending' },
  ]},
  { id: 'analytics', icon: BarChart3, label: 'Analytics', items: [
    { icon: BarChart3, label: 'BI Executivo', href: '/bi' },
    { icon: Factory, label: 'Fábrica 13/10', href: '/executive' },
    { icon: FileText, label: 'Construtor de Relatórios', href: '/report-builder' },
    { icon: TrendingUp, label: 'KPIs e Ocupação', href: '/kpis' },
    { icon: Gauge, label: 'OEE', href: '/oee' },
    { icon: Zap, label: 'Eficiência', href: '/efficiency' },
    { icon: Activity, label: 'SPC Qualidade', href: '/spc' },
    { icon: Coins, label: 'Custeio ABC', href: '/abc' },
  ]},
  { id: 'operations', icon: Wrench, label: 'Operações', items: [
    { icon: Wrench, label: 'TPM', href: '/tpm' },
    { icon: Cpu, label: 'Máquinas', href: '/machines' },
    { icon: ArrowRightLeft, label: 'Comparativo Máquinas', href: '/machines/compare' },
    { icon: BatteryCharging, label: 'Energia', href: '/energy' },
    { icon: Package, label: 'Estoque', href: '/inventory' },
    { icon: Package, label: 'Rastreabilidade', href: '/traceability' },
  ]},
  { id: 'team', icon: Users, label: 'Equipe', items: [
    { icon: Users, label: 'Operadores', href: '/operators' },
    { icon: TrendingUp, label: 'Produtividade', href: '/operators/productivity' },
    { icon: Activity, label: 'Histórico de Ações', href: '/operator-history' },
    { icon: Trophy, label: 'Gamificação', href: '/gamification' },
    { icon: ArrowRightLeft, label: 'Passagem de Turno', href: '/shift-handover' },
    { icon: UserCircle, label: 'Visão Operador', href: '/operator' },
  ]},
  { id: 'intelligence', icon: Brain, label: 'Inteligência', items: [
    { icon: Brain, label: 'ML Preditivo', href: '/ml-predictions' },
    { icon: Cpu, label: 'Digital Twin', href: '/digital-twin' },
    { icon: Bot, label: 'Assistente IA', href: '/assistant' },
    { icon: BookOpen, label: 'Base de Conhecimento', href: '/knowledge' },
    { icon: FileText, label: 'Documentos', href: '/documents' },
  ]},
  { id: 'system', icon: Cog, label: 'Sistema', items: [
    { icon: AlertTriangle, label: 'Alertas', href: '/alerts' },
    { icon: Bell, label: 'Notificações', href: '/notifications' },
    { icon: ShieldCheck, label: 'Trilha de Auditoria', href: '/audit' },
    { icon: QrCode, label: 'Scanner QR', href: '/scanner' },
    { icon: Code2, label: 'Master API Hub', href: '/master-api' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
  ]},
];

export const adminNavItems: NavItem[] = [
  { icon: Code2, label: 'Qualidade de Código', href: '/code-quality' },
  { icon: RefreshCw, label: 'Bitrix24', href: '/integrations/bitrix24' },
  { icon: Palette, label: 'Design System', href: '/design-system' },
  { icon: Download, label: 'Instalar App', href: '/install' },
];
