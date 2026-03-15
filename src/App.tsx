import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter } from "react-router-dom";
import { NavigationListener } from "@/components/navigation/NavigationListener";
import { PushNotificationPrompt } from "@/components/notifications/PushNotificationPrompt";
import { AppProviders } from "@/providers/AppProviders";
import { AnimatedRoutes } from "@/routes/AppRoutes";

const App = () => (
  <AppProviders>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <NavigationListener />
      <AnimatedRoutes />
      <PushNotificationPrompt delay={15000} />
    </BrowserRouter>
  </AppProviders>
);

export default App;
