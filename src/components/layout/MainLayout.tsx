import { ReactNode, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { ThemeToggle } from './ThemeToggle';
import { OfflineStatusBanner } from '../offline/OfflineStatusBanner';
import { SkipLinks, MainContent } from '../accessibility/SkipLinks';
import { NetworkStatusIndicator } from '@/hooks/useNetworkStatus';
import { SessionProvider } from '@/hooks/useSessionTimeout';

// Lazy-load non-critical layout components
const AssistantButton = lazy(() => import('../assistant/AssistantButton').then(m => ({ default: m.AssistantButton })));
const NotificationIntegrator = lazy(() => import('../notifications/NotificationIntegrator').then(m => ({ default: m.NotificationIntegrator })));
const RealtimeIndicator = lazy(() => import('../dashboard/RealtimeIndicator').then(m => ({ default: m.RealtimeIndicator })));
const OperatorMachinesIndicator = lazy(() => import('./OperatorMachinesIndicator').then(m => ({ default: m.OperatorMachinesIndicator })));
const QuickFavoritesBar = lazy(() => import('./QuickFavoritesBar').then(m => ({ default: m.QuickFavoritesBar })));
const OfflineReadyIndicator = lazy(() => import('../offline/OfflineReadyIndicator').then(m => ({ default: m.OfflineReadyIndicator })));
const MobileNavigation = lazy(() => import('../navigation/MobileNavigation').then(m => ({ default: m.MobileNavigation })));
const MobileQuickActions = lazy(() => import('../navigation/MobileQuickActions').then(m => ({ default: m.MobileQuickActions })));

import { useDevice } from '@/hooks/use-device';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};

export function MainLayout({ children }: MainLayoutProps) {
  const { isMobile, prefersReducedMotion } = useDevice();
  const location = useLocation();

  // Enable animations unless user prefers reduced motion
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
          role="main"
        >
          <OfflineStatusBanner />
          
          {/* Desktop top bar */}
          <div className="fixed top-4 right-4 z-40 hidden md:flex items-center gap-2">
            <QuickFavoritesBar />
            <OperatorMachinesIndicator />
            <NetworkStatusIndicator />
            <OfflineReadyIndicator />
            <ThemeToggle />
            <RealtimeIndicator />
          </div>
          
          {/* Mobile/Tablet top bar */}
          <div className="fixed top-4 right-4 z-40 flex md:hidden items-center gap-2">
            <NetworkStatusIndicator />
            <OfflineReadyIndicator />
            <ThemeToggle />
          </div>
          
          {/* Content with proper padding */}
          <MainContent className={cn(
            // Mobile: top padding for header, bottom for nav
            "pt-16 md:pt-4",
            "pb-24 md:pb-4",
            // Horizontal padding
            "px-4 sm:px-6 lg:px-8",
            // Ensure content can scroll
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
        
        {/* Mobile navigation - only render on mobile */}
        <MobileNavigation />
        
        {/* Mobile FAB for quick actions */}
        <MobileQuickActions />
        
        {/* Global components */}
        <AssistantButton />
        <NotificationIntegrator />
      </div>
    </SessionProvider>
  );
}
