import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { AssistantButton } from '../assistant/AssistantButton';
import { NotificationIntegrator } from '../notifications/NotificationIntegrator';
import { RealtimeIndicator } from '../dashboard/RealtimeIndicator';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="fixed top-4 right-4 z-50">
          <RealtimeIndicator />
        </div>
        {children}
      </main>
      <AssistantButton />
      <NotificationIntegrator />
    </div>
  );
}
