import { cn } from '@/lib/utils';

interface BITooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  prefix?: string;
}

export function BITooltip({ active, payload, label, prefix = '' }: BITooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-primary/30 backdrop-blur-xl p-3 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 border-b border-white/10 pb-1">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-white/80">{entry.name}:</span>
              </div>
              <span className="text-xs font-bold font-mono">
                {prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}
