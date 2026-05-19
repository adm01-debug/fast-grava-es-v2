import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { PushNotificationPrompt } from "@/components/notifications/PushNotificationPrompt";
import { NetworkStatusToaster } from "@/components/offline/NetworkStatusToaster";
import { AppProviders } from "@/providers/AppProviders";
import { AnimatedRoutes } from "@/routes/AppRoutes";
import { GlobalErrorBoundary } from "@/components/error/GlobalErrorBoundary";

const App = () => (
  <GlobalErrorBoundary>
    <AppProviders>
      {/* Skip Link para Acessibilidade */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
      >
        Ir para conteúdo principal
      </a>
      
      <Toaster />
      <Sonner />
      <NetworkStatusToaster />
      <AnimatedRoutes />
      <PushNotificationPrompt delay={15000} />
    </AppProviders>
  </GlobalErrorBoundary>
);

export default App;
