import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";

// Initialize i18n
import "./i18n";

// Import global providers
import { AccessibilityProvider } from "./components/accessibility/AccessibilityEnhancements";
import { OfflineProvider } from "./components/offline/OfflineMode";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <AccessibilityProvider>
      <OfflineProvider>
        <App />
      </OfflineProvider>
    </AccessibilityProvider>
  </ThemeProvider>
);
