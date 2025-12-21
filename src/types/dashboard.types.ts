export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config?: Record<string, any>;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  columns: number;
}
