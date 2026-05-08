import {
  Calendar, CalendarDays, CalendarRange, LayoutGrid, List, AlertTriangle, Settings, Users, Home,
  BarChart3, Gauge, Coins, Wrench, Brain, Code2, Zap, Bot, QrCode, RefreshCw,
  BookOpen, Palette, Download, Bell, ArrowRightLeft, Package, Activity, FileDown,
  Trophy, BatteryCharging, FileText, Cog, TrendingUp, Cpu, UserCircle, ShieldCheck
} from 'lucide-react';
import { NavGroup } from './NavGroupComponent';
import { NavItem } from './NavButton';

export const navGroups: NavGroup[] = [
  { id: 'home', icon: Home, label: 'Control Center', items: [{ icon: Home, label: 'Executive Pulse', href: '/' }], defaultOpen: true },
  { id: 'planning', icon: Calendar, label: 'Operations Flow', items: [
    { icon: Calendar, label: 'Calendário Diário', href: '/calendar/daily' },
    { icon: CalendarDays, label: 'Calendário Semanal', href: '/calendar/weekly' },
    { icon: CalendarRange, label: 'Calendário Mensal', href: '/calendar/monthly' },
    { icon: LayoutGrid, label: 'Kanban', href: '/kanban' },
    { icon: List, label: 'Pendências', href: '/pending' },
  ]},
  { id: 'analytics', icon: BarChart3, label: 'Strategic Insights', items: [
    { icon: BarChart3, label: 'Executive Intelligence', href: '/bi' },
    { icon: FileDown, label: 'Strategic Pulse', href: '/executive' },
    { icon: TrendingUp, label: 'Performance & Load', href: '/kpis' },
    { icon: Gauge, label: 'OEE Real-time', href: '/oee' },
    { icon: Zap, label: 'Efficiency Analytics', href: '/efficiency' },
    { icon: Activity, label: 'Quality Control (SPC)', href: '/spc' },
    { icon: Coins, label: 'Economic Value (ABC)', href: '/abc' },
  ]},
  { id: 'operations', icon: Wrench, label: 'Performance Units', items: [
    { icon: Wrench, label: 'TPM', href: '/tpm' },
    { icon: Cpu, label: 'Máquinas', href: '/machines' },
    { icon: ArrowRightLeft, label: 'Comparativo Máquinas', href: '/machines/compare' },
    { icon: BatteryCharging, label: 'Energia', href: '/energy' },
    { icon: Package, label: 'Rastreabilidade', href: '/traceability' },
  ]},
  { id: 'team', icon: Users, label: 'Human Capital', items: [
    { icon: Users, label: 'Operadores', href: '/operators' },
    { icon: TrendingUp, label: 'Produtividade', href: '/operators/productivity' },
    { icon: Activity, label: 'Histórico de Ações', href: '/operator-history' },
    { icon: Trophy, label: 'Gamificação', href: '/gamification' },
    { icon: ArrowRightLeft, label: 'Passagem de Turno', href: '/shift-handover' },
    { icon: UserCircle, label: 'Visão Operador', href: '/operator' },
  ]},
  { id: 'intelligence', icon: Brain, label: 'Cognitive Engine', items: [
    { icon: Brain, label: 'ML Preditivo', href: '/ml-predictions' },
    { icon: Bot, label: 'Assistente IA', href: '/assistant' },
    { icon: BookOpen, label: 'Base de Conhecimento', href: '/knowledge' },
    { icon: FileText, label: 'Documentos', href: '/documents' },
  ]},
  { id: 'system', icon: Cog, label: 'Global Systems', items: [
    { icon: AlertTriangle, label: 'Alertas', href: '/alerts' },
    { icon: Bell, label: 'Notificações', href: '/notifications' },
    { icon: ShieldCheck, label: 'Audit Trail', href: '/audit' },
    { icon: Users, label: 'Governance', href: '/admin/users' },
    { icon: QrCode, label: 'Scanner QR', href: '/scanner' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
  ]},
];

export const adminNavItems: NavItem[] = [
  { icon: Code2, label: 'Optimization Engine', href: '/code-quality' },
  { icon: RefreshCw, label: 'Data Bridge', href: '/integrations/bitrix24' },
  { icon: Palette, label: 'Visual Language', href: '/design-system' },
  { icon: Download, label: 'Platform Deployment', href: '/install' },
];
