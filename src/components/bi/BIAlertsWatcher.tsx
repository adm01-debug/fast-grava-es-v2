import { useOEEAlerts } from "@/features/productionAlerts";

export function BIAlertsWatcher() {
  useOEEAlerts();
  return null;
}
