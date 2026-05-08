import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Printer, Plus, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { prefetchRoute } from '@/lib/prefetch';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useDevice } from '@/hooks/use-device';
import { useAlertCount } from '@/hooks/useAlertCount';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NavButton } from './sidebar/NavButton';
import { NavGroupComponent } from './sidebar/NavGroupComponent';
import { navGroups, adminNavItems } from './sidebar/sidebarNavConfig';

export function AppSidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(['home', 'planning']);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut, isCoordinator } = useAuth();
  const { isMobile } = useDevice();
  const alertCount = useAlertCount();

  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroups(prev => prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]);
  }, []);

  useEffect(() => {
    const activeGroup = navGroups.find(g => g.items.some(i => i.href === '/' ? location.pathname === '/' : location.pathname.startsWith(i.href)));
    if (activeGroup && !openGroups.includes(activeGroup.id)) setOpenGroups(prev => [...prev, activeGroup.id]);
  }, [location.pathname]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => { if (!isMobile) setMobileOpen(false); }, [isMobile]);

  const handleSignOut = useCallback(async () => { await signOut(); navigate('/auth'); }, [signOut, navigate]);

  const filteredNavGroups = useMemo(() => {
    const opPaths = ['/operator', '/alerts', '/assistant', '/scanner', '/knowledge', '/shift-handover'];
    const mgrPaths = ['/', '/bi', '/executive', '/calendar/daily', '/calendar/weekly', '/calendar/monthly', '/kpis', '/oee', '/abc', '/spc', '/tpm', '/ml-predictions', '/alerts', '/notifications', '/efficiency', '/operators', '/operators/productivity', '/machines', '/energy', '/traceability', '/assistant', '/knowledge', '/documents', '/shift-handover', '/gamification', '/settings', '/security', '/kanban', '/new-job', '/audit', '/admin/users'];
    return navGroups.map(g => ({ ...g, items: g.items.filter(i => { if (role === 'operator') return opPaths.includes(i.href); if (role === 'manager') return mgrPaths.includes(i.href); return true; }) })).filter(g => g.items.length > 0);
  }, [role]);

  const filteredAdminNavItems = isCoordinator ? adminNavItems : [];
  const isActive = useCallback((href: string) => href === '/' ? location.pathname === '/' : location.pathname.startsWith(href), [location.pathname]);
  const handleNewJobPrefetch = useCallback(() => { prefetchRoute('/new-job'); }, []);

  const { ref: swipeRef } = useSwipeGesture<HTMLDivElement>({ onSwipeRight: () => { if (isMobile && !mobileOpen) setMobileOpen(true); }, onSwipeLeft: () => { if (isMobile && mobileOpen) setMobileOpen(false); }, threshold: 50, disabled: !isMobile });
  const focusTrapRef = useFocusTrap<HTMLElement>({ enabled: isMobile && mobileOpen, autoFocus: true, restoreFocus: true });

  return (
    <>
      <div className={cn('fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300', mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')} onClick={() => setMobileOpen(false)} aria-hidden="true" />
      {isMobile && !mobileOpen && <div ref={swipeRef} className="fixed inset-y-0 left-0 w-8 z-30 md:hidden" aria-hidden="true" />}

      <aside
        ref={isMobile ? focusTrapRef : undefined}
        className={cn(
          'flex flex-col h-screen bg-sidebar transition-all duration-500 ease-in-out',
          'dark:bg-gradient-to-b dark:from-sidebar/95 dark:to-background',
          'backdrop-blur-xl border-r border-sidebar-border/40',
          'shadow-[1px_0_10px_-2px_hsl(var(--primary)/0.05)] dark:shadow-[4px_0_24px_-4px_hsl(0_0%_0%/0.4)]',
          'hidden md:flex', collapsed ? 'w-20' : 'w-72',
          isMobile && 'fixed inset-y-0 left-0 z-50 w-80',
          isMobile && (mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'),
          isMobile && 'flex'
        )}
        role="navigation" aria-label="Menu principal" id="navigation"
      >
        {/* Header */}
        <div className={cn('flex items-center h-20 px-6 border-b border-sidebar-border/30', collapsed && !isMobile ? 'justify-center' : 'justify-between')}>
          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-4 animate-in fade-in duration-500">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg shadow-primary/20 ring-4 ring-primary/10">
                <Printer className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="space-y-0.5">
                <h1 className="font-display font-extrabold text-sidebar-foreground text-lg tracking-tight leading-none">Fast Gravações</h1>
                <p className="text-[10px] font-black text-primary/70 uppercase tracking-[0.2em]">Master Control</p>
              </div>
            </div>
          )}
          {!isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'} className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-muted focus:ring-2 focus:ring-primary">
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {role !== 'operator' && (
          <div className={cn('p-5', collapsed && !isMobile && 'px-3')}>
            <Link to="/new-job" onMouseEnter={handleNewJobPrefetch} onFocus={handleNewJobPrefetch}>
              <Button className={cn(
                'w-full h-12 gap-2 bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow-primary transition-all duration-300 shadow-lg rounded-xl font-bold border-0',
                collapsed && !isMobile && 'px-0 justify-center'
              )}>
                <Plus className="h-5 w-5" />{(!collapsed || isMobile) && <span>Novo Agendamento</span>}
              </Button>
            </Link>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1" id="main-navigation">
          {filteredNavGroups.map(group => <NavGroupComponent key={group.id} group={group} collapsed={collapsed} isMobile={isMobile} isActive={isActive} alertCount={alertCount} openGroups={openGroups} toggleGroup={toggleGroup} />)}
          {filteredAdminNavItems.length > 0 && (
            <>
              <div className="my-4 border-t border-sidebar-border/50" />
              {(!collapsed || isMobile) && <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] px-5 py-3">Core Infrastructure</p>}
              {filteredAdminNavItems.map(item => <NavButton key={item.href} item={item} collapsed={collapsed} isMobile={isMobile} isActive={isActive(item.href)} />)}
            </>
          )}
        </nav>

        <div className={cn('p-3 border-t border-sidebar-border/50', collapsed && !isMobile && 'p-2')}>
          {(!collapsed || isMobile) && <div className="mb-4 px-1 scale-110 origin-left"><LanguageSwitcher /></div>}
          <div className={cn('flex items-center gap-3 rounded-lg p-2', collapsed && !isMobile && 'justify-center p-2')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-lg border border-primary/10 shadow-sm">{profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}</div>
            {(!collapsed || isMobile) && <div className="flex-1 min-w-0"><p className="text-sm font-bold text-sidebar-foreground truncate tracking-tight">{profile?.full_name || 'Usuário'}</p><p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">{role === 'coordinator' ? 'System Architect' : role === 'manager' ? 'Global Manager' : 'Field Operator'}</p></div>}
          </div>
          <Button variant="ghost" size={(collapsed && !isMobile) ? "icon" : "sm"} onClick={handleSignOut} className={cn('w-full h-11 mt-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all font-bold', collapsed && !isMobile && 'px-0')}>
            <LogOut className="h-5 w-5" />{(!collapsed || isMobile) && <span className="ml-2">Sair do Sistema</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
