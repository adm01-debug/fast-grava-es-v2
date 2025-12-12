import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { techniques } from '@/data/mockData';

interface OccupancyData {
  technique: string;
  shortName: string;
  occupancy: number;
  color: string;
}

// Cores vibrantes como na referência
const vibrantColors = [
  'hsl(145, 80%, 45%)',   // Verde vibrante
  'hsl(24, 100%, 50%)',   // Laranja
  'hsl(180, 100%, 45%)',  // Ciano
  'hsl(280, 85%, 55%)',   // Roxo
  'hsl(48, 100%, 50%)',   // Amarelo
  'hsl(330, 85%, 55%)',   // Rosa/Magenta
  'hsl(210, 100%, 55%)',  // Azul
  'hsl(145, 80%, 45%)',   // Verde
  'hsl(24, 100%, 50%)',   // Laranja
  'hsl(195, 100%, 50%)',  // Ciano claro
];

const mockOccupancyData: OccupancyData[] = techniques.slice(0, 10).map((tech, index) => ({
  technique: tech.name,
  shortName: tech.shortName,
  occupancy: Math.floor(Math.random() * 60) + 30,
  color: vibrantColors[index % vibrantColors.length],
}));

export function OccupancyChart() {
  return (
    <Card className="col-span-2 bg-card border border-border/40 rounded-xl animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:0.1s] transition-all duration-300 hover:border-[hsl(145,80%,45%)]/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display gradient-text">Ocupação por Técnica</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockOccupancyData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true} 
                vertical={false} 
                stroke="hsl(222, 15%, 18%)" 
              />
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                tickFormatter={(value) => `${value}%`}
                stroke="hsl(220, 10%, 45%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category" 
                dataKey="shortName" 
                width={75}
                stroke="hsl(220, 10%, 55%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Ocupação']}
                labelFormatter={(label) => mockOccupancyData.find(d => d.shortName === label)?.technique || label}
                contentStyle={{
                  backgroundColor: 'hsl(222, 18%, 10%)',
                  border: '1px solid hsl(222, 15%, 20%)',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px -4px rgb(0 0 0 / 0.5)',
                  color: 'hsl(0, 0%, 95%)',
                }}
                labelStyle={{ color: 'hsl(0, 0%, 95%)' }}
              />
              <Bar dataKey="occupancy" radius={[0, 6, 6, 0]} maxBarSize={24}>
                {mockOccupancyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    style={{ filter: 'brightness(1.1)' }}
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
