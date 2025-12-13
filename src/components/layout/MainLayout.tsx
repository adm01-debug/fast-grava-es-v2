import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { AssistantButton } from '../assistant/AssistantButton';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <AssistantButton />
    </div>
  );
}
