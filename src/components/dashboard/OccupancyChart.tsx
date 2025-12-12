import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { techniques } from '@/data/mockData';

interface OccupancyData {
  technique: string;
  shortName: string;
  occupancy: number;
  color: string;
}

const mockOccupancyData: OccupancyData[] = techniques.slice(0, 10).map((tech) => ({
  technique: tech.name,
  shortName: tech.shortName,
  occupancy: Math.floor(Math.random() * 60) + 30,
  color: tech.color,
}));

export function OccupancyChart() {
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display">Ocupação por Técnica</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockOccupancyData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                tickFormatter={(value) => `${value}%`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                type="category" 
                dataKey="shortName" 
                width={70}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Ocupação']}
                labelFormatter={(label) => mockOccupancyData.find(d => d.shortName === label)?.technique || label}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="occupancy" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {mockOccupancyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.occupancy >= 80 ? 'hsl(var(--accent))' : entry.occupancy >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
