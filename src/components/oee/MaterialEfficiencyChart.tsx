import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MaterialOEE, getOEEColor } from '@/hooks/useOEE';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { Layers } from 'lucide-react';

interface MaterialEfficiencyChartProps {
  materials: MaterialOEE[];
}

export function MaterialEfficiencyChart({ materials }: MaterialEfficiencyChartProps) {
  const sortedData = [...materials].sort((a, b) => b.oee - a.oee);

  return (
    <Card className="border-primary/20 bg-muted/5">
      <CardHeader>
        <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Eficiência por Material (FAST GRAVAÇÕES)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} layout="vertical" margin={{ left: 40, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                dataKey="material" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 'bold', fill: 'rgba(255,255,255,0.5)' }}
                width={80}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ 
                  backgroundColor: '#000', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="oee" radius={[0, 4, 4, 0]} barSize={20}>
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getOEEColor(entry.oee)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 border-t border-white/5 pt-6">
          {sortedData.slice(0, 4).map((m) => (
            <div key={m.material} className="text-center">
              <p className="text-xs font-black uppercase text-muted-foreground truncate">{m.material}</p>
              <p className="text-lg font-black" style={{ color: getOEEColor(m.oee) }}>{m.oee.toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
