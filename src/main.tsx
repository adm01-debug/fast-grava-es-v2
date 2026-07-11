import { createRoot } from "react-dom/client";
import { onCLS, onFID, onLCP, onTTFB, onINP } from "web-vitals";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

// Initialize i18n
import "./i18n";

// Import global providers
import { AccessibilityProvider } from "./components/accessibility/AccessibilityProvider";
import { OfflineProvider } from "./hooks/useLocalStorage";

// Performance Monitoring (Web Vitals to Sentry)
const sendToSentry = ({ name, delta, id, value }: any) => {
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

// Register Service Worker for PWA / push notifications.
// The hooks in features/notifications/* aguardam `navigator.serviceWorker.ready`,
// portanto sem registro elas ficariam esperando indefinidamente.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <AccessibilityProvider>
    <OfflineProvider>
      <App />
    </OfflineProvider>
  </AccessibilityProvider>
);
