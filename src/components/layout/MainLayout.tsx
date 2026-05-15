import { ReactNode, lazy, Suspense } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { ThemeToggle } from './ThemeToggle';
import { OfflineStatusBanner } from '../offline/OfflineStatusBanner';
import { SkipLinks, MainContent } from '../accessibility/SkipLinks';
import { NetworkStatusIndicator } from '@/hooks/useNetworkStatus';
import { SessionProvider } from '@/hooks/useSessionTimeout';
import { SectionErrorBoundary } from '../ui/section-error-boundary';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useNotifications } from '@/hooks/useNotifications';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

// Lazy-load non-critical layout components
const AssistantButton = lazy(() => import('../assistant/AssistantButton').then(m => ({ default: m.AssistantButton })));
const NotificationIntegrator = lazy(() => import('../notifications/NotificationIntegrator').then(m => ({ default: m.NotificationIntegrator })));
const RealtimeIndicator = lazy(() => import('../dashboard/RealtimeIndicator').then(m => ({ default: m.RealtimeIndicator })));
const OperatorMachinesIndicator = lazy(() => import('./OperatorMachinesIndicator').then(m => ({ default: m.OperatorMachinesIndicator })));
const QuickFavoritesBar = lazy(() => import('./QuickFavoritesBar').then(m => ({ default: m.QuickFavoritesBar })));
const OfflineReadyIndicator = lazy(() => import('../offline/OfflineReadyIndicator').then(m => ({ default: m.OfflineReadyIndicator })));
const MobileNavigation = lazy(() => import('../navigation/MobileNavigation').then(m => ({ default: m.MobileNavigation })));
const MobileQuickActions = lazy(() => import('../navigation/MobileQuickActions').then(m => ({ default: m.MobileQuickActions })));
const CommandPaletteAdvanced = lazy(() => import('../navigation/CommandPaletteAdvanced').then(m => ({ default: m.CommandPaletteAdvanced })));
const SystemOnboarding = lazy(() => import('../onboarding/SystemOnboarding').then(m => ({ default: m.SystemOnboarding })));

import { useDevice } from '@/hooks/use-device';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

/** Inline fallback for lazy layout widgets — renders nothing */
const EmptyFallback = null;

export function MainLayout({ children }: MainLayoutProps) {
  const { isMobile, prefersReducedMotion } = useDevice();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  // Dynamic page title for SEO
  usePageTitle();

  const shouldAnimate = !prefersReducedMotion;

  return (
    <SessionProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Skip Links for Accessibility */}
        <a href="#main-navigation" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md outline-none ring-2 ring-primary ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-glow-primary">
          Pular para navegação
        </a>

        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-40 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md outline-none ring-2 ring-primary ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-glow-primary">
          Pular para conteúdo principal
        </a>

        <SkipLinks />

        {/* Sidebar - hidden on mobile, shown on tablet+ */}
        <AppSidebar />

        <main
          className={cn(
            "flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative",
            "h-full scrollbar-thin"
          )}
        >
          <OfflineStatusBanner />

          {/* Desktop top bar */}
          <div className="fixed top-4 right-4 z-40 hidden md:flex items-center gap-2" role="toolbar" aria-label="Ações rápidas">
            <SectionErrorBoundary section="Favoritos" compact>
              <Suspense fallback={EmptyFallback}>
                <QuickFavoritesBar />
              </Suspense>
            </SectionErrorBoundary>
            <SectionErrorBoundary section="Máquinas" compact>
              <Suspense fallback={EmptyFallback}>
                <OperatorMachinesIndicator />
              </Suspense>
            </SectionErrorBoundary>
            <Suspense fallback={EmptyFallback}>
              <NetworkStatusIndicator />
            </Suspense>
            <Suspense fallback={EmptyFallback}>
              <OfflineReadyIndicator />
            </Suspense>
            <ThemeToggle />

            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-background">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <SectionErrorBoundary section="Realtime" compact>
              <Suspense fallback={EmptyFallback}>
                <RealtimeIndicator />
              </Suspense>
            </SectionErrorBoundary>
          </div>

          {/* Mobile/Tablet top bar */}
          <div className="fixed top-2 right-3 z-40 flex md:hidden items-center gap-1.5 safe-area-top" role="toolbar" aria-label="Ações rápidas mobile">
            <Suspense fallback={EmptyFallback}>
              <NetworkStatusIndicator />
            </Suspense>
            <Suspense fallback={EmptyFallback}>
              <OfflineReadyIndicator />
            </Suspense>
            <ThemeToggle />

            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-0.5 -right-0.5 h-3.5 min-w-[14px] px-0.5 rounded-full flex items-center justify-center text-[8px] font-black border border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>

          {/* Content with proper padding and safe-area insets */}
          <MainContent className={cn(
            "pt-12 md:pt-4",
            "pb-24 md:pb-4",
            "px-4 sm:px-6 lg:px-8",
            "min-h-0"
          )}>
            {/* Render direct children as PageTransition is handled in AppRoutes for better SPA experience */}
            {children}

          </MainContent>

          {/* Mobile navigation spacer */}
          {isMobile && <div className="h-20 shrink-0" aria-hidden="true" />}
        </main>

        {/* Mobile navigation */}
        <SectionErrorBoundary section="Navegação mobile" compact>
          <Suspense fallback={EmptyFallback}>
            <MobileNavigation />
          </Suspense>
        </SectionErrorBoundary>

        {/* Mobile FAB */}
        <SectionErrorBoundary section="Ações rápidas" compact>
          <Suspense fallback={EmptyFallback}>
            <MobileQuickActions />
          </Suspense>
        </SectionErrorBoundary>

        {/* Global components */}
        <SectionErrorBoundary section="Assistente" compact>
          <Suspense fallback={EmptyFallback}>
            <AssistantButton />
          </Suspense>
        </SectionErrorBoundary>
        <Suspense fallback={EmptyFallback}>
          <NotificationIntegrator />
        </Suspense>
        <Suspense fallback={EmptyFallback}>
          <CommandPaletteAdvanced />
        </Suspense>
        <Suspense fallback={EmptyFallback}>
          <SystemOnboarding />
        </Suspense>
      </div>
    </SessionProvider>
  );
}
