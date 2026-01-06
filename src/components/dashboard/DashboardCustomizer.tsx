import * as React from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Settings2, 
  GripVertical, 
  Eye, 
  EyeOff, 
  RotateCcw,
  LayoutGrid,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardWidget {
  id: string;
  title: string;
  icon?: React.ReactNode;
  visible: boolean;
  size: "small" | "medium" | "large";
  order: number;
}

interface DashboardConfig {
  widgets: DashboardWidget[];
  layout: "grid" | "list";
  compactMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

const DEFAULT_CONFIG: DashboardConfig = {
  widgets: [],
  layout: "grid",
  compactMode: false,
  autoRefresh: true,
  refreshInterval: 30000,
};

const STORAGE_KEY = "dashboard_config";

export function useDashboardConfig(defaultWidgets: DashboardWidget[]) {
  const [config, setConfig] = React.useState<DashboardConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with default widgets to handle new widgets
        const mergedWidgets = defaultWidgets.map((widget) => {
          const saved = parsed.widgets?.find((w: DashboardWidget) => w.id === widget.id);
          return saved ? { ...widget, ...saved } : widget;
        });
        return { ...DEFAULT_CONFIG, ...parsed, widgets: mergedWidgets };
      } catch {
        return { ...DEFAULT_CONFIG, widgets: defaultWidgets };
      }
    }
    return { ...DEFAULT_CONFIG, widgets: defaultWidgets };
  });

  const saveConfig = React.useCallback((newConfig: DashboardConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  }, []);

  const resetConfig = React.useCallback(() => {
    const reset = { ...DEFAULT_CONFIG, widgets: defaultWidgets };
    setConfig(reset);
    localStorage.removeItem(STORAGE_KEY);
  }, [defaultWidgets]);

  const toggleWidget = React.useCallback((widgetId: string) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        widgets: prev.widgets.map((w) =>
          w.id === widgetId ? { ...w, visible: !w.visible } : w
        ),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      return newConfig;
    });
  }, []);

  const reorderWidgets = React.useCallback((newOrder: DashboardWidget[]) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        widgets: newOrder.map((w, i) => ({ ...w, order: i })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      return newConfig;
    });
  }, []);

  const updateLayout = React.useCallback((layout: "grid" | "list") => {
    setConfig((prev) => {
      const newConfig = { ...prev, layout };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      return newConfig;
    });
  }, []);

  const visibleWidgets = config.widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  return {
    config,
    saveConfig,
    resetConfig,
    toggleWidget,
    reorderWidgets,
    updateLayout,
    visibleWidgets,
  };
}

interface DashboardCustomizerProps {
  widgets: DashboardWidget[];
  onReorder: (widgets: DashboardWidget[]) => void;
  onToggle: (widgetId: string) => void;
  onReset: () => void;
  layout: "grid" | "list";
  onLayoutChange: (layout: "grid" | "list") => void;
}

export function DashboardCustomizer({
  widgets,
  onReorder,
  onToggle,
  onReset,
  layout,
  onLayoutChange,
}: DashboardCustomizerProps) {
  const { toast } = useToast();
  const [localWidgets, setLocalWidgets] = React.useState(widgets);

  React.useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  const handleSave = () => {
    onReorder(localWidgets);
    toast({
      title: "Dashboard salvo",
      description: "Suas preferências foram salvas com sucesso.",
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Personalizar
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Personalizar Dashboard
          </SheetTitle>
          <SheetDescription>
            Arraste para reordenar e alterne a visibilidade dos widgets.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Layout toggle */}
          <div className="flex items-center justify-between">
            <Label>Layout</Label>
            <div className="flex gap-2">
              <Button
                variant={layout === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => onLayoutChange("grid")}
              >
                Grade
              </Button>
              <Button
                variant={layout === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => onLayoutChange("list")}
              >
                Lista
              </Button>
            </div>
          </div>

          {/* Widgets list */}
          <div className="space-y-2">
            <Label>Widgets</Label>
            <Reorder.Group
              axis="y"
              values={localWidgets}
              onReorder={setLocalWidgets}
              className="space-y-2"
            >
              <AnimatePresence>
                {localWidgets.map((widget) => (
                  <Reorder.Item
                    key={widget.id}
                    value={widget}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <Card
                      className={`cursor-grab active:cursor-grabbing ${
                        !widget.visible ? "opacity-50" : ""
                      }`}
                    >
                      <CardContent className="flex items-center gap-3 p-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        
                        {widget.icon && (
                          <div className="flex-shrink-0">{widget.icon}</div>
                        )}
                        
                        <span className="flex-1 text-sm font-medium truncate">
                          {widget.title}
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggle(widget.id);
                          }}
                        >
                          {widget.visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onReset} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Widget wrapper with animation
interface AnimatedWidgetProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedWidget({ children, delay = 0, className }: AnimatedWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Dashboard grid layout
interface DashboardGridProps {
  children: React.ReactNode;
  layout?: "grid" | "list";
  columns?: number;
}

export function DashboardGrid({ children, layout = "grid", columns = 4 }: DashboardGridProps) {
  if (layout === "list") {
    return <div className="space-y-4">{children}</div>;
  }

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}
