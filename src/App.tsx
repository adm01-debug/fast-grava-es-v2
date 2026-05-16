import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { PushNotificationPrompt } from "@/components/notifications/PushNotificationPrompt";
import { NetworkStatusToaster } from "@/components/offline/NetworkStatusToaster";
import { AppProviders } from "@/providers/AppProviders";
import { AnimatedRoutes } from "@/routes/AppRoutes";

const App = () => (
  <AppProviders>
    <Toaster />
    <Sonner />
    <NetworkStatusToaster />
    <AnimatedRoutes />
    <PushNotificationPrompt delay={15000} />
  </AppProviders>
);

export default App;
