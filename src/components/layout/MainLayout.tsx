import { ReactNode } from 'react';
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
import { useDevice } from '@/hooks/use-device';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isMobile } = useDevice();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto relative md:ml-0">
        <OfflineStatusBanner />
        {/* Desktop top bar */}
        <div className="fixed top-4 right-4 z-40 hidden md:flex items-center gap-2">
          <QuickFavoritesBar />
          <OperatorMachinesIndicator />
          <OfflineReadyIndicator />
          <ThemeToggle />
          <RealtimeIndicator />
        </div>
        {/* Mobile top bar - simplified, positioned to not overlap hamburger */}
        {isMobile && (
          <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
            <OfflineReadyIndicator />
            <ThemeToggle />
          </div>
        )}
        {/* Content with proper padding for mobile nav */}
        <div className={cn(
          "pt-16 md:pt-0",
          isMobile && "pb-24" // Extra padding for bottom navigation + safe area
        )}>
          {children}
        </div>
        {/* Mobile bottom navigation */}
        <MobileNavigation />
      </main>
      <AssistantButton />
      <NotificationIntegrator />
    </div>
  );
}
