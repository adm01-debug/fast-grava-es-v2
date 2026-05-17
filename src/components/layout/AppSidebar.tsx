import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Printer, Plus, LogOut, ArrowLeft } from 'lucide-react';
import { SoundFeedback } from '@/lib/soundFeedback';
import { cn } from '@/lib/utils';
import { prefetchRoute } from '@/lib/prefetch';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useDevice } from '@/hooks/use-device';
import { useAlertCount } from '@/hooks/useAlertCount';
import { useNotifications } from '@/hooks/useNotifications';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NavButton } from './sidebar/NavButton';
import { NavGroupComponent } from './sidebar/NavGroupComponent';
import { navGroups, adminNavItems } from './sidebar/sidebarNavConfig';
import { StaggeredList } from '../ui/micro-interactions';

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
  const { unreadCount: notificationCount } = useNotifications();

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
    const mgrPaths = ['/', '/bi', '/executive', '/calendar/daily', '/calendar/weekly', '/calendar/monthly', '/kpis', '/oee', '/abc', '/spc', '/tpm', '/ml-predictions', '/alerts', '/notifications', '/efficiency', '/operators', '/operators/productivity', '/machines', '/energy', '/traceability', '/assistant', '/knowledge', '/documents', '/shift-handover', '/gamification', '/settings', '/security', '/kanban', '/new-job'];
    return navGroups.map(g => ({ ...g, items: g.items.filter(i => { if (role === 'operator') return opPaths.includes(i.href); if (role === 'manager') return mgrPaths.includes(i.href); return true; }) })).filter(g => g.items.length > 0);
  }, [role]);

  const filteredAdminNavItems = isCoordinator ? adminNavItems : [];
  const isActive = useCallback((href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  const activeGroup = useMemo(() => {
    return navGroups.find(g => g.items.some(i => isActive(i.href)));
  }, [isActive]);

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
          'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
          'dark:bg-gradient-to-b dark:from-sidebar dark:via-sidebar dark:to-background',
          'shadow-[2px_0_12px_-4px_hsl(220_10%_12%/0.08)] dark:shadow-[2px_0_20px_-4px_hsl(0_0%_0%/0.3)]',
          'hidden md:flex', collapsed ? 'w-16' : 'w-64',
          isMobile && 'fixed inset-y-0 left-0 z-50 w-72',
          isMobile && (mobileOpen ? 'translate-x-0' : '-translate-x-full'),
          isMobile && 'flex'
        )}
        role="navigation" aria-label="Menu principal" id="main-navigation"
        tabIndex={-1}

      >
        {/* Header */}
        <div className={cn('flex items-center h-16 px-4 border-b border-sidebar-border relative', collapsed && !isMobile ? 'justify-center' : 'justify-between')}>
          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-3 overflow-hidden">
              <AnimatePresence mode="wait">
                {location.pathname !== '/' && location.pathname !== '/operator' && location.pathname !== '/auth' ? (
                  <motion.div
                    key="back-icon"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="flex-shrink-0"
                  >
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        SoundFeedback.navBack();
                        navigate(-1);
                      }}
                      className="h-9 w-9 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="logo-icon"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="w-13 h-13 rounded-xl gradient-primary flex items-center justify-center glow-primary shadow-lg flex-shrink-0"
                    style={{ width: 52, height: 52 }}
                  >
                    <Printer className="w-6 h-6 text-primary-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div layout className="flex-1 min-w-0">
                <h1 className="font-display font-black text-sidebar-foreground text-xl tracking-tight truncate uppercase">FAST GRAVAÇÕES</h1>
                <p className="text-[13px] font-semibold text-primary/70 uppercase tracking-widest truncate">Gestão de Gravação</p>
              </motion.div>
            </div>
          )}
          {!isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'} className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-muted focus:ring-2 focus:ring-primary">
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {role !== 'operator' && (
          <div className={cn('p-3', collapsed && !isMobile && 'px-2')}>
            <Link to="/new-job" onMouseEnter={handleNewJobPrefetch} onFocus={handleNewJobPrefetch}>
              <Button className={cn('w-full gap-2 gradient-primary hover:opacity-90 transition-opacity glow-primary focus:ring-2 focus:ring-primary focus:ring-offset-2', collapsed && !isMobile && 'px-0')}>
                <Plus className="h-4 w-4" />{(!collapsed || isMobile) && <span>Novo Agendamento</span>}
              </Button>
            </Link>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1 relative focus:outline-none" id="main-navigation">
          <StaggeredList staggerDelay={0.03}>
            {filteredNavGroups.map((group) => {
              const isGroupActive = activeGroup?.id === group.id;
              return (
                <div key={group.id} className="relative py-0.5">
                  {isGroupActive && !collapsed && (
                    <motion.div
                      layoutId="active-group-indicator"
                      className="absolute -left-2 top-0.5 bottom-0.5 w-1.5 gradient-primary rounded-r-full z-10 shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                  <NavGroupComponent
                    group={group}
                    collapsed={collapsed}
                    isMobile={isMobile}
                    isActive={isActive}
                    alertCount={alertCount}
                    notificationCount={notificationCount}
                    openGroups={openGroups}
                    toggleGroup={toggleGroup}
                  />
                </div>
              );
            })}
          </StaggeredList>
          {filteredAdminNavItems.length > 0 && (
            <>
              <div className="my-4 border-t border-sidebar-border/50" />
              {(!collapsed || isMobile) && <p className="text-xs font-medium text-sidebar-foreground/30 uppercase tracking-wider px-3 py-2">Administração</p>}
              {filteredAdminNavItems.map(item => <NavButton key={item.href} item={item} collapsed={collapsed} isMobile={isMobile} isActive={isActive(item.href)} />)}
            </>
          )}
        </nav>

        <div className={cn('p-3 border-t border-sidebar-border/50', collapsed && !isMobile && 'p-2')}>
          {(!collapsed || isMobile) && <div className="mb-2 px-1"><LanguageSwitcher /></div>}
          <div className={cn('flex items-center gap-3 rounded-lg p-2', collapsed && !isMobile && 'justify-center p-2')}>
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">{profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}</div>
            {(!collapsed || isMobile) && <div className="flex-1 min-w-0"><p className="text-sm font-bold text-sidebar-foreground truncate tracking-tight">{profile?.full_name || 'Usuário'}</p><p className="text-[10px] font-black text-primary/60 uppercase tracking-widest truncate">{role === 'coordinator' ? 'Coordenação' : role === 'manager' ? 'Gestão' : 'Operação'}</p></div>}
          </div>
          <Button variant="ghost" size={(collapsed && !isMobile) ? "icon" : "sm"} onClick={handleSignOut} className={cn('w-full mt-3 font-bold text-xs uppercase tracking-widest text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 focus:ring-2 focus:ring-destructive focus:ring-offset-2 transition-all duration-300', collapsed && !isMobile && 'px-0')}>
            <LogOut className="h-3.5 w-3.5" />{(!collapsed || isMobile) && <span className="ml-2">{t('common.logout')}</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
