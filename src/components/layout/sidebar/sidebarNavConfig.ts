import {
  Calendar, CalendarDays, CalendarRange, LayoutGrid, List, AlertTriangle, Settings, Users, Home,
  BarChart3, Gauge, Coins, Wrench, Brain, Code2, Zap, Bot, QrCode, RefreshCw,
  BookOpen, Palette, Download, Bell, ArrowRightLeft, Package, Activity, FileDown,
  Trophy, BatteryCharging, FileText, Cog, TrendingUp, Cpu, UserCircle, ShieldCheck
} from 'lucide-react';
import { NavGroup } from './NavGroupComponent';
import { NavItem } from './NavButton';

export const navGroups: NavGroup[] = [
  { id: 'home', icon: Home, label: 'Control Center', items: [{ icon: Home, label: 'Performance Pulse', href: '/' }], defaultOpen: true },
  { id: 'planning', icon: Calendar, label: 'Operations Flow', items: [
    { icon: Calendar, label: 'Daily Operations', href: '/calendar/daily' },
    { icon: CalendarDays, label: 'Weekly Schedule', href: '/calendar/weekly' },
    { icon: CalendarRange, label: 'Monthly Roadmap', href: '/calendar/monthly' },
    { icon: LayoutGrid, label: 'Visual Kanban', href: '/kanban' },
    { icon: List, label: 'Operational Queue', href: '/pending' },
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
    { icon: Wrench, label: 'TPM Hub', href: '/tpm' },
    { icon: Cpu, label: 'Industrial Units', href: '/machines' },
    { icon: ArrowRightLeft, label: 'Machine Analytics', href: '/machines/compare' },
    { icon: BatteryCharging, label: 'Energy Management', href: '/energy' },
    { icon: Package, label: 'Full Traceability', href: '/traceability' },
  ]},
  { id: 'team', icon: Users, label: 'Human Capital', items: [
    { icon: Users, label: 'Specialist Directory', href: '/operators' },
    { icon: TrendingUp, label: 'Output Velocity', href: '/operators/productivity' },
    { icon: Activity, label: 'Execution Logs', href: '/operator-history' },
    { icon: Trophy, label: 'Achievement Board', href: '/gamification' },
    { icon: ArrowRightLeft, label: 'Shift Transition', href: '/shift-handover' },
    { icon: UserCircle, label: 'Field Console', href: '/operator' },
  ]},
  { id: 'intelligence', icon: Brain, label: 'Cognitive Engine', items: [
    { icon: Brain, label: 'ML Preditivo', href: '/ml-predictions' },
    { icon: Bot, label: 'AI Synthesis', href: '/assistant' },
    { icon: BookOpen, label: 'Knowledge Base', href: '/knowledge' },
    { icon: FileText, label: 'Technical Docs', href: '/documents' },
  ]},
  { id: 'system', icon: Cog, label: 'Global Systems', items: [
    { icon: AlertTriangle, label: 'Active Alerts', href: '/alerts' },
    { icon: Bell, label: 'Global Notifications', href: '/notifications' },
    { icon: ShieldCheck, label: 'Audit Trail', href: '/audit' },
    { icon: Users, label: 'Governance', href: '/admin/users' },
    { icon: QrCode, label: 'Scanner QR', href: '/scanner' },
    { icon: Settings, label: 'System Settings', href: '/settings' },
  ]},
];

export const adminNavItems: NavItem[] = [
  { icon: Code2, label: 'Optimization Engine', href: '/code-quality' },
  { icon: RefreshCw, label: 'Data Bridge', href: '/integrations/bitrix24' },
  { icon: Palette, label: 'Visual Language', href: '/design-system' },
  { icon: Download, label: 'Platform Deployment', href: '/install' },
];
