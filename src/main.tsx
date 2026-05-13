import { createRoot } from "react-dom/client";
import { onCLS, onFID, onLCP, onTTFB, onINP } from "web-vitals";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

// Initialize i18n
import "./i18n";

// Import global providers
import { AccessibilityProvider } from "./components/accessibility/SkipLinks";
import { OfflineProvider } from "./components/offline/OfflineMode";

// Performance Monitoring (Web Vitals to Sentry)
const sendToSentry = ({ name, delta, id, value }: unknown) => {
  Sentry.captureMessage(`Web Vital: ${name}`, {
    level: "info",
    extra: { delta, id, value },
    tags: { vital_name: name }
  });
};

onCLS(sendToSentry);
onFID(sendToSentry);
onLCP(sendToSentry);
onTTFB(sendToSentry);
onINP(sendToSentry);

createRoot(document.getElementById("root")!).render(
  <AccessibilityProvider>
    <OfflineProvider>
      <App />
    </OfflineProvider>
  </AccessibilityProvider>
);
