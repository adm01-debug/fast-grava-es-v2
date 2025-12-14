import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { AssistantButton } from '../assistant/AssistantButton';
import { NotificationIntegrator } from '../notifications/NotificationIntegrator';
import { RealtimeIndicator } from '../dashboard/RealtimeIndicator';
import { ThemeToggle } from './ThemeToggle';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto relative md:ml-0">
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
          <ThemeToggle />
          <RealtimeIndicator />
        </div>
        {/* Add top padding on mobile for hamburger menu */}
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </main>
      <AssistantButton />
      <NotificationIntegrator />
    </div>
  );
}
