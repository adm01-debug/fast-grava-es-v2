import { ReactNode, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { ThemeToggle } from './ThemeToggle';
import { OfflineStatusBanner } from '../offline/OfflineStatusBanner';
import { SkipLinks, MainContent } from '../accessibility/SkipLinks';
import { NetworkStatusIndicator } from '@/hooks/useNetworkStatus';
import { SessionProvider } from '@/hooks/useSessionTimeout';
import { SectionErrorBoundary } from '../ui/section-error-boundary';
import { usePageTitle } from '@/hooks/usePageTitle';

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

  // Dynamic page title for SEO
  usePageTitle();

  const shouldAnimate = !prefersReducedMotion;

  return (
    <SessionProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Skip Links for Accessibility */}
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
          </div>
          
          {/* Content with proper padding and safe-area insets */}
          <MainContent className={cn(
            "pt-12 md:pt-4",
            "pb-24 md:pb-4",
            "px-4 sm:px-6 lg:px-8",
            "min-h-0"
          )}>
            {shouldAnimate ? (
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            ) : (
              children
            )}
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
      </div>
    </SessionProvider>
  );
}
