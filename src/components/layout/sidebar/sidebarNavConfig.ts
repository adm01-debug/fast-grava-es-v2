import {
  Calendar, CalendarDays, LayoutGrid, List, AlertTriangle, Settings, Users, Home,
  BarChart3, Gauge, Coins, Wrench, Brain, Code2, Zap, Bot, QrCode, RefreshCw,
  BookOpen, Palette, Download, Bell, ArrowRightLeft, Package, Activity, FileDown,
  Trophy, BatteryCharging, FileText, Cog, TrendingUp, Cpu, UserCircle
} from 'lucide-react';
import { NavGroup } from './NavGroupComponent';
import { NavItem } from './NavButton';

export const navGroups: NavGroup[] = [
  { id: 'home', icon: Home, label: 'Início', items: [{ icon: Home, label: 'Dashboard', href: '/' }], defaultOpen: true },
  { id: 'planning', icon: Calendar, label: 'Planejamento', items: [
    { icon: Calendar, label: 'Calendário Diário', href: '/calendar/daily' },
    { icon: CalendarDays, label: 'Calendário Semanal', href: '/calendar/weekly' },
    { icon: LayoutGrid, label: 'Kanban', href: '/kanban' },
    { icon: List, label: 'Pendências', href: '/pending' },
  ]},
  { id: 'analytics', icon: BarChart3, label: 'Analytics', items: [
    { icon: BarChart3, label: 'BI Executivo', href: '/bi' },
    { icon: FileDown, label: 'Dashboard Executivo', href: '/executive' },
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
    { icon: Bot, label: 'Assistente IA', href: '/assistant' },
    { icon: BookOpen, label: 'Base de Conhecimento', href: '/knowledge' },
    { icon: FileText, label: 'Documentos', href: '/documents' },
  ]},
  { id: 'system', icon: Cog, label: 'Sistema', items: [
    { icon: AlertTriangle, label: 'Alertas', href: '/alerts' },
    { icon: Bell, label: 'Notificações', href: '/notifications' },
    { icon: QrCode, label: 'Scanner QR', href: '/scanner' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
  ]},
];

export const adminNavItems: NavItem[] = [
  { icon: Code2, label: 'Qualidade de Código', href: '/code-quality' },
  { icon: RefreshCw, label: 'Bitrix24', href: '/integrations/bitrix24' },
  { icon: Palette, label: 'Design System', href: '/design-system' },
  { icon: Download, label: 'Instalar App', href: '/install' },
];
