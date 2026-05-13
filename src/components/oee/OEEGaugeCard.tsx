import { useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OEEGaugeCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  benchmark?: number;
  size?: 'sm' | 'md' | 'lg';
  trend?: number;
  className?: string;
  variant?: 'default' | 'glass';
}

export const OEEGaugeCard = memo(function OEEGaugeCard({ 
  title, 
  value, 
  icon, 
  description,
  benchmark = 85,
  size = 'md',
   trend,
   className,
   variant = 'default'
 }: OEEGaugeCardProps) {

  const gaugeData = useMemo(() => {
    const percentage = Math.min(100, Math.max(0, value));
    const rotation = (percentage / 100) * 180;
    
    let color = 'hsl(var(--primary))';
    if (percentage >= 85) color = 'hsl(var(--success))';
    else if (percentage >= 75) color = 'hsl(142 76% 46%)';
    else if (percentage >= 65) color = 'hsl(48 96% 53%)';
    else if (percentage >= 50) color = 'hsl(25 95% 53%)';
    
    return { percentage, rotation, color };
  }, [value]);

  const sizeConfig = {
    sm: { gauge: 80, stroke: 8, text: 'text-xl' },
    md: { gauge: 120, stroke: 12, text: 'text-3xl' },
    lg: { gauge: 160, stroke: 16, text: 'text-4xl' }
  };

  const config = sizeConfig[size];
  const radius = (config.gauge - config.stroke) / 2;
  const circumference = Math.PI * radius;
  const progress = (gaugeData.percentage / 100) * circumference;

  return (
    <Card className={cn("relative overflow-hidden", className)} variant={variant}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {/* Semi-circular gauge */}
        <div className="relative" style={{ width: config.gauge, height: config.gauge / 2 + 10 }}>
          <svg
            width={config.gauge}
            height={config.gauge / 2 + 10}
            viewBox={`0 0 ${config.gauge} ${config.gauge / 2 + 10}`}
            className="overflow-visible"
          >
            {/* Background arc */}
            <path
              d={`M ${config.stroke / 2} ${config.gauge / 2} A ${radius} ${radius} 0 0 1 ${config.gauge - config.stroke / 2} ${config.gauge / 2}`}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={config.stroke}
              strokeLinecap="round"
            />
            
            {/* Progress arc */}
            <path
              d={`M ${config.stroke / 2} ${config.gauge / 2} A ${radius} ${radius} 0 0 1 ${config.gauge - config.stroke / 2} ${config.gauge / 2}`}
              fill="none"
              stroke={gaugeData.color}
              strokeWidth={config.stroke}
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              className="transition-all duration-1000 ease-out"
            />
            
            {/* Benchmark marker */}
            {benchmark && (
              <g transform={`rotate(${(benchmark / 100) * 180 - 180}, ${config.gauge / 2}, ${config.gauge / 2})`}>
                <line
                  x1={config.gauge / 2}
                  y1={config.stroke / 2 + 2}
                  x2={config.gauge / 2}
                  y2={config.stroke + 6}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </g>
            )}
          </svg>
          
          {/* Value text */}
          <div className="absolute inset-0 flex items-end justify-center pb-2">
            <span className={cn("font-bold font-display leading-none", config.text)} style={{ color: gaugeData.color }}>
              {value.toFixed(1)}%
            </span>
          </div>
        </div>

        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1",
            trend > 0 ? "bg-success/10 text-success" : trend < 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
          )}>
            {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}% MoM
          </div>
        )}
        
        {description && (
          <p className="text-[10px] text-muted-foreground text-center mt-2 leading-tight px-2">{description}</p>
        )}
        
        {/* Scale labels */}
        <div className="flex justify-between w-full text-xs text-muted-foreground mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </CardContent>
      
      {/* Glow effect based on value */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at center bottom, ${gaugeData.color} 0%, transparent 70%)`
        }}
      />
    </Card>
  );
});
