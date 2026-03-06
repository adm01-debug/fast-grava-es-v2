import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { AssistantButton } from '../assistant/AssistantButton';
import { NotificationIntegrator } from '../notifications/NotificationIntegrator';
import { RealtimeIndicator } from '../dashboard/RealtimeIndicator';
import { ThemeToggle } from './ThemeToggle';
import { OperatorMachinesIndicator } from './OperatorMachinesIndicator';
import { QuickFavoritesBar } from './QuickFavoritesBar';
import { OfflineReadyIndicator } from '../offline/OfflineReadyIndicator';
import { OfflineStatusBanner } from '../offline/OfflineStatusBanner';
import { MobileNavigation } from '../navigation/MobileNavigation';
import { MobileQuickActions } from '../navigation/MobileQuickActions';
import { SkipLinks, MainContent } from '../accessibility/SkipLinks';
import { NetworkStatusIndicator } from '@/hooks/useNetworkStatus';
import { SessionProvider } from '@/hooks/useSessionTimeout';

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
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
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
        
        {/* Global components - Assistant only on desktop to avoid FAB overlap on mobile */}
        {!isMobile && <AssistantButton />}
        <NotificationIntegrator />
      </div>
    </SessionProvider>
  );
}
