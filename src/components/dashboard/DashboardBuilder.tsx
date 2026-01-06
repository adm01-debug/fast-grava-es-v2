// Visual Dashboard Builder - Drag & Drop Widget Configuration
import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  LayoutGrid, Plus, Settings, Trash2, GripVertical, Maximize2,
  Minimize2, Eye, EyeOff, Save, Undo, Redo, Lock, Unlock,
  Copy, Layers, Palette, ChevronDown, X, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

// Types
interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  visible: boolean;
  locked: boolean;
  order: number;
  settings: Record<string, any>;
}

interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  columns: number;
  gap: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WidgetDefinition {
  type: string;
  name: string;
  description: string;
  icon: React.ElementType;
  defaultSettings: Record<string, any>;
  minSize: 'small' | 'medium' | 'large';
  component: React.ComponentType<{ config: WidgetConfig }>;
}

interface DashboardBuilderContextType {
  layout: DashboardLayout;
  isEditing: boolean;
  selectedWidget: string | null;
  setIsEditing: (editing: boolean) => void;
  selectWidget: (id: string | null) => void;
  addWidget: (type: string) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  reorderWidgets: (widgets: WidgetConfig[]) => void;
  duplicateWidget: (id: string) => void;
  saveLayout: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const DashboardBuilderContext = createContext<DashboardBuilderContextType | null>(null);

// Widget Registry
const widgetRegistry: Map<string, WidgetDefinition> = new Map();

export function registerWidget(definition: WidgetDefinition) {
  widgetRegistry.set(definition.type, definition);
}

// Provider
interface DashboardBuilderProviderProps {
  children: ReactNode;
  layoutId?: string;
  defaultLayout?: Partial<DashboardLayout>;
}

export function DashboardBuilderProvider({
  children,
  layoutId = 'default',
  defaultLayout
}: DashboardBuilderProviderProps) {
  const [savedLayouts, setSavedLayouts] = useLocalStorage<Record<string, DashboardLayout>>(
    'dashboard-layouts',
    {}
  );

  const initialLayout: DashboardLayout = savedLayouts[layoutId] || {
    id: layoutId,
    name: 'My Dashboard',
    widgets: [],
    columns: 3,
    gap: 16,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...defaultLayout
  };

  const [layout, setLayout] = useState<DashboardLayout>(initialLayout);
  const [history, setHistory] = useState<DashboardLayout[]>([initialLayout]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const pushHistory = useCallback((newLayout: DashboardLayout) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newLayout]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const addWidget = useCallback((type: string) => {
    const definition = widgetRegistry.get(type);
    if (!definition) return;

    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type,
      title: definition.name,
      size: definition.minSize,
      visible: true,
      locked: false,
      order: layout.widgets.length,
      settings: { ...definition.defaultSettings }
    };

    const newLayout = {
      ...layout,
      widgets: [...layout.widgets, newWidget],
      updatedAt: new Date()
    };

    setLayout(newLayout);
    pushHistory(newLayout);
  }, [layout, pushHistory]);

  const removeWidget = useCallback((id: string) => {
    const newLayout = {
      ...layout,
      widgets: layout.widgets.filter(w => w.id !== id),
      updatedAt: new Date()
    };
    setLayout(newLayout);
    pushHistory(newLayout);
  }, [layout, pushHistory]);

  const updateWidget = useCallback((id: string, updates: Partial<WidgetConfig>) => {
    const newLayout = {
      ...layout,
      widgets: layout.widgets.map(w => w.id === id ? { ...w, ...updates } : w),
      updatedAt: new Date()
    };
    setLayout(newLayout);
    pushHistory(newLayout);
  }, [layout, pushHistory]);

  const reorderWidgets = useCallback((widgets: WidgetConfig[]) => {
    const newLayout = {
      ...layout,
      widgets: widgets.map((w, i) => ({ ...w, order: i })),
      updatedAt: new Date()
    };
    setLayout(newLayout);
    pushHistory(newLayout);
  }, [layout, pushHistory]);

  const duplicateWidget = useCallback((id: string) => {
    const widget = layout.widgets.find(w => w.id === id);
    if (!widget) return;

    const newWidget: WidgetConfig = {
      ...widget,
      id: `widget-${Date.now()}`,
      title: `${widget.title} (Copy)`,
      order: layout.widgets.length
    };

    const newLayout = {
      ...layout,
      widgets: [...layout.widgets, newWidget],
      updatedAt: new Date()
    };

    setLayout(newLayout);
    pushHistory(newLayout);
  }, [layout, pushHistory]);

  const saveLayout = useCallback(() => {
    setSavedLayouts(prev => ({
      ...prev,
      [layout.id]: layout
    }));
  }, [layout, setSavedLayouts]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setLayout(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setLayout(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  return (
    <DashboardBuilderContext.Provider
      value={{
        layout,
        isEditing,
        selectedWidget,
        setIsEditing,
        selectWidget: setSelectedWidget,
        addWidget,
        removeWidget,
        updateWidget,
        reorderWidgets,
        duplicateWidget,
        saveLayout,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1
      }}
    >
      {children}
    </DashboardBuilderContext.Provider>
  );
}

export function useDashboardBuilder() {
  const context = useContext(DashboardBuilderContext);
  if (!context) throw new Error('useDashboardBuilder must be used within DashboardBuilderProvider');
  return context;
}

// Widget Wrapper
interface DraggableWidgetProps {
  config: WidgetConfig;
  children: ReactNode;
}

export function DraggableWidget({ config, children }: DraggableWidgetProps) {
  const { isEditing, selectedWidget, selectWidget, removeWidget, updateWidget, duplicateWidget } = useDashboardBuilder();

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-2',
    large: 'col-span-3',
    full: 'col-span-full'
  };

  if (!config.visible && !isEditing) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: config.visible ? 1 : 0.5, 
        scale: 1,
        filter: config.visible ? 'none' : 'grayscale(50%)'
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        sizeClasses[config.size],
        'relative group',
        isEditing && 'cursor-move',
        selectedWidget === config.id && 'ring-2 ring-primary'
      )}
      onClick={() => isEditing && selectWidget(config.id)}
    >
      {isEditing && (
        <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); duplicateWidget(config.id); }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); updateWidget(config.id, { visible: !config.visible }); }}
          >
            {config.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); removeWidget(config.id); }}
            disabled={config.locked}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {isEditing && (
        <div className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {config.locked && (
        <div className="absolute top-2 right-2 z-10">
          <Lock className="h-3 w-3 text-muted-foreground" />
        </div>
      )}

      {children}
    </motion.div>
  );
}

// Dashboard Grid
interface DashboardGridProps {
  children?: ReactNode;
}

export function DashboardGrid({ children }: DashboardGridProps) {
  const { layout, isEditing, reorderWidgets } = useDashboardBuilder();

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
    gap: `${layout.gap}px`
  };

  if (isEditing) {
    return (
      <Reorder.Group
        axis="y"
        values={layout.widgets}
        onReorder={reorderWidgets}
        style={gridStyle}
        className="min-h-[200px]"
      >
        <AnimatePresence>
          {layout.widgets.map(widget => {
            const definition = widgetRegistry.get(widget.type);
            if (!definition) return null;

            const WidgetComponent = definition.component;

            return (
              <Reorder.Item key={widget.id} value={widget}>
                <DraggableWidget config={widget}>
                  <WidgetComponent config={widget} />
                </DraggableWidget>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
        {children}
      </Reorder.Group>
    );
  }

  return (
    <div style={gridStyle} className="min-h-[200px]">
      <AnimatePresence>
        {layout.widgets.filter(w => w.visible).map(widget => {
          const definition = widgetRegistry.get(widget.type);
          if (!definition) return null;

          const WidgetComponent = definition.component;

          return (
            <DraggableWidget key={widget.id} config={widget}>
              <WidgetComponent config={widget} />
            </DraggableWidget>
          );
        })}
      </AnimatePresence>
      {children}
    </div>
  );
}

// Edit Toolbar
export function DashboardEditToolbar() {
  const {
    isEditing, setIsEditing, saveLayout, undo, redo, canUndo, canRedo, layout
  } = useDashboardBuilder();

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">{layout.name}</span>
        {isEditing && (
          <Badge variant="secondary" className="ml-2">
            Editing
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isEditing && (
          <>
            <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo}>
              <Redo className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <WidgetPicker />
            <LayoutSettings />
            <div className="w-px h-6 bg-border mx-2" />
          </>
        )}

        {isEditing ? (
          <>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={() => { saveLayout(); setIsEditing(false); }}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        )}
      </div>
    </div>
  );
}

// Widget Picker
function WidgetPicker() {
  const { addWidget } = useDashboardBuilder();
  const widgets = Array.from(widgetRegistry.values());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Widget
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {widgets.map(widget => (
          <DropdownMenuItem
            key={widget.type}
            onClick={() => addWidget(widget.type)}
            className="flex items-start gap-3 p-3"
          >
            <widget.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div>
              <div className="font-medium">{widget.name}</div>
              <div className="text-xs text-muted-foreground">{widget.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
        {widgets.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No widgets registered
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Layout Settings
function LayoutSettings() {
  const { layout } = useDashboardBuilder();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Layers className="h-4 w-4 mr-2" />
          Layout
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Layout Settings</SheetTitle>
          <SheetDescription>
            Customize your dashboard layout
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label>Dashboard Name</Label>
            <Input defaultValue={layout.name} />
          </div>

          <div className="space-y-2">
            <Label>Columns: {layout.columns}</Label>
            <Slider
              value={[layout.columns]}
              min={1}
              max={4}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Gap: {layout.gap}px</Label>
            <Slider
              value={[layout.gap]}
              min={8}
              max={32}
              step={4}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Widget Settings Panel
interface WidgetSettingsPanelProps {
  widgetId: string;
}

export function WidgetSettingsPanel({ widgetId }: WidgetSettingsPanelProps) {
  const { layout, updateWidget, selectWidget } = useDashboardBuilder();
  const widget = layout.widgets.find(w => w.id === widgetId);

  if (!widget) return null;

  const definition = widgetRegistry.get(widget.type);

  return (
    <Sheet open={true} onOpenChange={() => selectWidget(null)}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Widget Settings</SheetTitle>
          <SheetDescription>
            Configure {widget.title}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={widget.title}
              onChange={(e) => updateWidget(widgetId, { title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Size</Label>
            <div className="grid grid-cols-4 gap-2">
              {(['small', 'medium', 'large', 'full'] as const).map(size => (
                <Button
                  key={size}
                  variant={widget.size === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateWidget(widgetId, { size })}
                  disabled={definition && ['medium', 'large'].includes(definition.minSize) && size === 'small'}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Visible</Label>
            <Switch
              checked={widget.visible}
              onCheckedChange={(visible) => updateWidget(widgetId, { visible })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Locked</Label>
            <Switch
              checked={widget.locked}
              onCheckedChange={(locked) => updateWidget(widgetId, { locked })}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Pre-built Widget Templates
export function StatWidget({ config }: { config: WidgetConfig }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {config.settings.value || '0'}
        </div>
        {config.settings.change && (
          <p className="text-xs text-muted-foreground mt-1">
            {config.settings.change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ChartWidget({ config }: { config: WidgetConfig }) {
  return (
    <Card className="h-full min-h-[200px]">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          Chart Placeholder
        </div>
      </CardContent>
    </Card>
  );
}

export function ListWidget({ config }: { config: WidgetConfig }) {
  const items = config.settings.items || [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items</p>
          ) : (
            items.map((item: string, i: number) => (
              <div key={i} className="text-sm">{item}</div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State
export function DashboardEmptyState() {
  const { isEditing, addWidget } = useDashboardBuilder();

  if (!isEditing) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
        <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No widgets configured</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click Customize to add widgets to your dashboard
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center"
    >
      <Plus className="h-8 w-8 text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground mb-4">
        Click "Add Widget" to get started
      </p>
    </motion.div>
  );
}
