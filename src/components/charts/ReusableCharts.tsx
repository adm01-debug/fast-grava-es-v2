import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// ============================================
// COMMON TYPES
// ============================================

interface ChartWrapperProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  height?: number;
}

// ============================================
// CHART WRAPPER
// ============================================

function ChartWrapper({
  title,
  description,
  children,
  className,
  height = 300
}: ChartWrapperProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="pt-0">
        <div style={{ height }}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// THEME COLORS
// ============================================

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 217 91% 60%))',
  'hsl(var(--chart-3, 142 71% 45%))',
  'hsl(var(--chart-4, 43 96% 56%))',
  'hsl(var(--chart-5, 0 84% 60%))',
  'hsl(var(--accent))',
];

// ============================================
// LINE CHART
// ============================================

interface SimpleLineChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
  title?: string;
  description?: string;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  curved?: boolean;
  height?: number;
  className?: string;
}

export function SimpleLineChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  colors = CHART_COLORS,
  showGrid = true,
  showLegend = true,
  curved = true,
  height = 300,
  className
}: SimpleLineChartProps) {
  return (
    <ChartWrapper title={title} description={description} height={height} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border" />}
          <XAxis 
            dataKey={xKey} 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Line
              key={key}
              type={curved ? 'monotone' : 'linear'}
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ============================================
// AREA CHART
// ============================================

interface SimpleAreaChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
  title?: string;
  description?: string;
  colors?: string[];
  stacked?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  height?: number;
  className?: string;
}

export function SimpleAreaChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  colors = CHART_COLORS,
  stacked = false,
  showGrid = true,
  showLegend = true,
  height = 300,
  className
}: SimpleAreaChartProps) {
  return (
    <ChartWrapper title={title} description={description} height={height} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border" />}
          <XAxis 
            dataKey={xKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId={stacked ? 'stack' : undefined}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.3}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ============================================
// BAR CHART
// ============================================

interface SimpleBarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
  title?: string;
  description?: string;
  colors?: string[];
  stacked?: boolean;
  horizontal?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  height?: number;
  className?: string;
}

export function SimpleBarChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  colors = CHART_COLORS,
  stacked = false,
  horizontal = false,
  showGrid = true,
  showLegend = true,
  height = 300,
  className
}: SimpleBarChartProps) {
  return (
    <ChartWrapper title={title} description={description} height={height} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border" />}
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis dataKey={xKey} type="category" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              stackId={stacked ? 'stack' : undefined}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ============================================
// PIE CHART
// ============================================

interface SimplePieChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  description?: string;
  colors?: string[];
  showLegend?: boolean;
  donut?: boolean;
  height?: number;
  className?: string;
}

export function SimplePieChart({
  data,
  title,
  description,
  colors = CHART_COLORS,
  showLegend = true,
  donut = false,
  height = 300,
  className
}: SimplePieChartProps) {
  return (
    <ChartWrapper title={title} description={description} height={height} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={donut ? '60%' : 0}
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ============================================
// RADIAL PROGRESS CHART
// ============================================

interface RadialProgressProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  size?: number;
  thickness?: number;
  className?: string;
}

export function RadialProgress({
  value,
  max = 100,
  label,
  color = 'hsl(var(--primary))',
  size = 120,
  thickness = 12,
  className
}: RadialProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const data = [{ name: label || 'Progress', value: percentage, fill: color }];

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={`${100 - (thickness / size) * 100 * 2}%`}
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          data={data}
        >
          <RadialBar
            dataKey="value"
            background={{ fill: 'hsl(var(--muted))' }}
            cornerRadius={thickness / 2}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

// ============================================
// SPARKLINE
// ============================================

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showArea?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  color = 'hsl(var(--primary))',
  height = 40,
  width = 100,
  showArea = false,
  className
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        {showArea ? (
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              strokeWidth={1.5}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// MINI STAT CARD WITH CHART
// ============================================

interface MiniStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  data?: number[];
  icon?: React.ReactNode;
  className?: string;
}

export function MiniStatCard({
  title,
  value,
  change,
  data,
  icon,
  className
}: MiniStatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <p className={cn(
              'text-xs font-medium',
              isPositive && 'text-green-500',
              isNegative && 'text-red-500'
            )}>
              {isPositive ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
          {data && (
            <Sparkline
              data={data}
              color={isPositive ? 'hsl(142 71% 45%)' : isNegative ? 'hsl(0 84% 60%)' : 'hsl(var(--primary))'}
              showArea
            />
          )}
        </div>
      </div>
    </Card>
  );
}
