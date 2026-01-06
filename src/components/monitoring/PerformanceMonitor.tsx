// Performance Monitoring Dashboard
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Cpu, HardDrive, Gauge, Timer, Zap, AlertTriangle,
  TrendingUp, TrendingDown, RefreshCw, Settings, Eye, EyeOff,
  ChevronDown, ChevronUp, BarChart2, Clock, Database, Wifi,
  MonitorSmartphone, MemoryStick, Layers, XCircle, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@/components/ui/collapsible';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

// Types
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold: { warning: number; critical: number };
  trend?: 'up' | 'down' | 'stable';
  history: Array<{ value: number; timestamp: Date }>;
}

interface WebVital {
  name: string;
  fullName: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  description: string;
}

interface ResourceTiming {
  name: string;
  type: string;
  duration: number;
  size: number;
  initiator: string;
}

interface PerformanceSnapshot {
  timestamp: Date;
  metrics: Record<string, number>;
  webVitals: Record<string, number>;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  connectionInfo?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

interface PerformanceMonitorContextType {
  isMonitoring: boolean;
  metrics: PerformanceMetric[];
  webVitals: WebVital[];
  snapshots: PerformanceSnapshot[];
  resourceTimings: ResourceTiming[];
  startMonitoring: () => void;
  stopMonitoring: () => void;
  takeSnapshot: () => void;
  clearHistory: () => void;
}

const PerformanceMonitorContext = createContext<PerformanceMonitorContextType | null>(null);

// Provider
interface PerformanceMonitorProviderProps {
  children: ReactNode;
  sampleInterval?: number;
  maxSnapshots?: number;
}

export function PerformanceMonitorProvider({
  children,
  sampleInterval = 5000,
  maxSnapshots = 100
}: PerformanceMonitorProviderProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [webVitals, setWebVitals] = useState<WebVital[]>([]);
  const [snapshots, setSnapshots] = useState<PerformanceSnapshot[]>([]);
  const [resourceTimings, setResourceTimings] = useState<ResourceTiming[]>([]);

  // Collect performance metrics
  const collectMetrics = useCallback(() => {
    const perf = performance;
    const nav = perf.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const paint = perf.getEntriesByType('paint');
    
    const newMetrics: PerformanceMetric[] = [];

    // Page Load Time
    if (nav) {
      const pageLoadTime = nav.loadEventEnd - nav.startTime;
      newMetrics.push({
        name: 'Page Load',
        value: Math.round(pageLoadTime),
        unit: 'ms',
        status: pageLoadTime < 2000 ? 'good' : pageLoadTime < 4000 ? 'warning' : 'critical',
        threshold: { warning: 2000, critical: 4000 },
        trend: 'stable',
        history: []
      });

      // DOM Content Loaded
      const dcl = nav.domContentLoadedEventEnd - nav.startTime;
      newMetrics.push({
        name: 'DOM Ready',
        value: Math.round(dcl),
        unit: 'ms',
        status: dcl < 1000 ? 'good' : dcl < 2000 ? 'warning' : 'critical',
        threshold: { warning: 1000, critical: 2000 },
        trend: 'stable',
        history: []
      });

      // TTFB
      const ttfb = nav.responseStart - nav.requestStart;
      newMetrics.push({
        name: 'TTFB',
        value: Math.round(ttfb),
        unit: 'ms',
        status: ttfb < 200 ? 'good' : ttfb < 500 ? 'warning' : 'critical',
        threshold: { warning: 200, critical: 500 },
        trend: 'stable',
        history: []
      });
    }

    // First Paint
    const fp = paint.find(p => p.name === 'first-paint');
    if (fp) {
      newMetrics.push({
        name: 'First Paint',
        value: Math.round(fp.startTime),
        unit: 'ms',
        status: fp.startTime < 1000 ? 'good' : fp.startTime < 2500 ? 'warning' : 'critical',
        threshold: { warning: 1000, critical: 2500 },
        trend: 'stable',
        history: []
      });
    }

    // FCP
    const fcp = paint.find(p => p.name === 'first-contentful-paint');
    if (fcp) {
      newMetrics.push({
        name: 'FCP',
        value: Math.round(fcp.startTime),
        unit: 'ms',
        status: fcp.startTime < 1800 ? 'good' : fcp.startTime < 3000 ? 'warning' : 'critical',
        threshold: { warning: 1800, critical: 3000 },
        trend: 'stable',
        history: []
      });
    }

    // Memory (if available)
    const memory = (performance as any).memory;
    if (memory) {
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.jsHeapSizeLimit / 1048576);
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      newMetrics.push({
        name: 'Memory',
        value: usedMB,
        unit: 'MB',
        status: usagePercent < 50 ? 'good' : usagePercent < 80 ? 'warning' : 'critical',
        threshold: { warning: totalMB * 0.5, critical: totalMB * 0.8 },
        trend: 'stable',
        history: []
      });
    }

    setMetrics(newMetrics);

    // Collect resource timings
    const resources = perf.getEntriesByType('resource') as PerformanceResourceTiming[];
    const resourceData: ResourceTiming[] = resources.slice(-20).map(r => ({
      name: r.name.split('/').pop() || r.name,
      type: r.initiatorType,
      duration: Math.round(r.duration),
      size: r.transferSize || 0,
      initiator: r.initiatorType
    }));
    setResourceTimings(resourceData);

  }, []);

  // Collect Web Vitals
  const collectWebVitals = useCallback(() => {
    const vitals: WebVital[] = [];

    // Using web-vitals library data if available
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      const value = fcpEntry.startTime;
      vitals.push({
        name: 'FCP',
        fullName: 'First Contentful Paint',
        value: Math.round(value),
        rating: value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor',
        description: 'Time to first content render'
      });
    }

    setWebVitals(vitals);
  }, []);

  // Take snapshot
  const takeSnapshot = useCallback(() => {
    const memory = (performance as any).memory;
    const connection = (navigator as any).connection;

    const snapshot: PerformanceSnapshot = {
      timestamp: new Date(),
      metrics: metrics.reduce((acc, m) => ({ ...acc, [m.name]: m.value }), {}),
      webVitals: webVitals.reduce((acc, v) => ({ ...acc, [v.name]: v.value }), {}),
      memoryUsage: memory ? {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      } : undefined,
      connectionInfo: connection ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      } : undefined
    };

    setSnapshots(prev => [...prev.slice(-(maxSnapshots - 1)), snapshot]);
  }, [metrics, webVitals, maxSnapshots]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    collectMetrics();
    collectWebVitals();
  }, [collectMetrics, collectWebVitals]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setSnapshots([]);
  }, []);

  // Periodic collection
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      collectMetrics();
      collectWebVitals();
      takeSnapshot();
    }, sampleInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, sampleInterval, collectMetrics, collectWebVitals, takeSnapshot]);

  return (
    <PerformanceMonitorContext.Provider
      value={{
        isMonitoring,
        metrics,
        webVitals,
        snapshots,
        resourceTimings,
        startMonitoring,
        stopMonitoring,
        takeSnapshot,
        clearHistory
      }}
    >
      {children}
    </PerformanceMonitorContext.Provider>
  );
}

export function usePerformanceMonitor() {
  const context = useContext(PerformanceMonitorContext);
  if (!context) throw new Error('usePerformanceMonitor must be used within PerformanceMonitorProvider');
  return context;
}

// Status colors
const statusColors = {
  good: 'text-green-500',
  warning: 'text-yellow-500',
  critical: 'text-red-500'
};

const statusBgColors = {
  good: 'bg-green-500/10',
  warning: 'bg-yellow-500/10',
  critical: 'bg-red-500/10'
};

// Metric Card
interface MetricCardProps {
  metric: PerformanceMetric;
}

function MetricCard({ metric }: MetricCardProps) {
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Activity;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'p-4 rounded-lg border',
        statusBgColors[metric.status]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{metric.name}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={cn('text-2xl font-bold', statusColors[metric.status])}>
              {metric.value}
            </span>
            <span className="text-sm text-muted-foreground">{metric.unit}</span>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <TrendIcon className={cn('h-4 w-4', statusColors[metric.status])} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Warning: {metric.threshold.warning}{metric.unit}</p>
              <p>Critical: {metric.threshold.critical}{metric.unit}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Progress 
        value={Math.min((metric.value / metric.threshold.critical) * 100, 100)} 
        className="h-1 mt-3"
      />
    </motion.div>
  );
}

// Web Vital Card
interface WebVitalCardProps {
  vital: WebVital;
}

function WebVitalCard({ vital }: WebVitalCardProps) {
  const ratingColors = {
    good: 'bg-green-500',
    'needs-improvement': 'bg-yellow-500',
    poor: 'bg-red-500'
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
      <div className={cn('h-3 w-3 rounded-full', ratingColors[vital.rating])} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">{vital.name}</p>
          <span className="text-sm font-mono">{vital.value}ms</span>
        </div>
        <p className="text-xs text-muted-foreground">{vital.fullName}</p>
      </div>
    </div>
  );
}

// Resource Timing Row
interface ResourceRowProps {
  resource: ResourceTiming;
}

function ResourceRow({ resource }: ResourceRowProps) {
  const typeIcons: Record<string, React.ElementType> = {
    script: Layers,
    css: Layers,
    img: MonitorSmartphone,
    fetch: Wifi,
    xmlhttprequest: Wifi
  };

  const Icon = typeIcons[resource.type] || Database;

  return (
    <div className="flex items-center gap-3 py-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 truncate" title={resource.name}>
        {resource.name}
      </span>
      <Badge variant="outline" className="text-xs">
        {resource.type}
      </Badge>
      <span className="font-mono text-xs w-16 text-right">
        {resource.duration}ms
      </span>
    </div>
  );
}

// Performance Dashboard
export function PerformanceDashboard() {
  const {
    isMonitoring,
    metrics,
    webVitals,
    resourceTimings,
    startMonitoring,
    stopMonitoring,
    takeSnapshot
  } = usePerformanceMonitor();

  const [showResources, setShowResources] = useState(false);

  const overallStatus = useMemo(() => {
    if (metrics.some(m => m.status === 'critical')) return 'critical';
    if (metrics.some(m => m.status === 'warning')) return 'warning';
    return 'good';
  }, [metrics]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-full',
              statusBgColors[overallStatus]
            )}>
              <Activity className={cn('h-5 w-5', statusColors[overallStatus])} />
            </div>
            <div>
              <CardTitle>Performance Monitor</CardTitle>
              <CardDescription>Real-time performance metrics</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={takeSnapshot}
              disabled={!isMonitoring}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Snapshot
            </Button>
            <Button
              variant={isMonitoring ? 'destructive' : 'default'}
              size="sm"
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
            >
              {isMonitoring ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {metrics.map(metric => (
              <MetricCard key={metric.name} metric={metric} />
            ))}
          </AnimatePresence>
        </div>

        {/* Web Vitals */}
        {webVitals.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Core Web Vitals
            </h4>
            <div className="grid gap-2">
              {webVitals.map(vital => (
                <WebVitalCard key={vital.name} vital={vital} />
              ))}
            </div>
          </div>
        )}

        {/* Resource Timings */}
        <Collapsible open={showResources} onOpenChange={setShowResources}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Resource Timings ({resourceTimings.length})
              </span>
              {showResources ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 divide-y">
              {resourceTimings.map((resource, i) => (
                <ResourceRow key={i} resource={resource} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Floating Performance Indicator
export function PerformanceIndicator() {
  const { isMonitoring, metrics, startMonitoring, stopMonitoring } = usePerformanceMonitor();
  const [expanded, setExpanded] = useState(false);

  const overallStatus = useMemo(() => {
    if (!metrics.length) return 'good';
    if (metrics.some(m => m.status === 'critical')) return 'critical';
    if (metrics.some(m => m.status === 'warning')) return 'warning';
    return 'good';
  }, [metrics]);

  return (
    <Popover open={expanded} onOpenChange={setExpanded}>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'fixed bottom-4 left-4 z-50 p-2 rounded-full shadow-lg',
            'flex items-center justify-center',
            statusBgColors[overallStatus],
            'border'
          )}
        >
          <Activity className={cn('h-5 w-5', statusColors[overallStatus])} />
          {isMonitoring && (
            <motion.div
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </motion.button>
      </PopoverTrigger>

      <PopoverContent className="w-80" side="top" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Performance</h4>
            <Switch
              checked={isMonitoring}
              onCheckedChange={(checked) => checked ? startMonitoring() : stopMonitoring()}
            />
          </div>

          {metrics.length > 0 ? (
            <div className="space-y-2">
              {metrics.slice(0, 4).map(metric => (
                <div key={metric.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{metric.name}</span>
                  <span className={cn('font-mono', statusColors[metric.status])}>
                    {metric.value}{metric.unit}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Start monitoring to see metrics
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Memory Usage Widget
export function MemoryUsageWidget() {
  const [memory, setMemory] = useState<{ used: number; total: number; limit: number } | null>(null);

  useEffect(() => {
    const updateMemory = () => {
      const mem = (performance as any).memory;
      if (mem) {
        setMemory({
          used: Math.round(mem.usedJSHeapSize / 1048576),
          total: Math.round(mem.totalJSHeapSize / 1048576),
          limit: Math.round(mem.jsHeapSizeLimit / 1048576)
        });
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!memory) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MemoryStick className="h-4 w-4" />
          <span className="text-sm">Memory info not available</span>
        </div>
      </Card>
    );
  }

  const usagePercent = (memory.used / memory.limit) * 100;
  const status = usagePercent < 50 ? 'good' : usagePercent < 80 ? 'warning' : 'critical';

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-full', statusBgColors[status])}>
          <MemoryStick className={cn('h-4 w-4', statusColors[status])} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Memory</span>
            <span className="text-xs text-muted-foreground">
              {memory.used}MB / {memory.limit}MB
            </span>
          </div>
          <Progress value={usagePercent} className="h-2" />
        </div>
      </div>
    </Card>
  );
}

// Network Status Widget
export function NetworkStatusWidget() {
  const [connection, setConnection] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null>(null);

  useEffect(() => {
    const conn = (navigator as any).connection;
    if (!conn) return;

    const updateConnection = () => {
      setConnection({
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      });
    };

    updateConnection();
    conn.addEventListener('change', updateConnection);
    return () => conn.removeEventListener('change', updateConnection);
  }, []);

  if (!connection) {
    return null;
  }

  const typeColors: Record<string, string> = {
    '4g': 'text-green-500',
    '3g': 'text-yellow-500',
    '2g': 'text-orange-500',
    'slow-2g': 'text-red-500'
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Wifi className={cn('h-5 w-5', typeColors[connection.effectiveType] || 'text-muted-foreground')} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium uppercase">{connection.effectiveType}</span>
            {connection.saveData && (
              <Badge variant="secondary" className="text-xs">Data Saver</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <span>{connection.downlink} Mbps</span>
            <span>{connection.rtt}ms RTT</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
