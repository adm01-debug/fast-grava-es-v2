import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Thermometer, Gauge, Zap } from 'lucide-react';

const mockTelemetryData = [
  { time: '10:00', temp: 180, pressure: 5.2, speed: 45 },
  { time: '10:05', temp: 182, pressure: 5.1, speed: 46 },
  { time: '10:10', temp: 185, pressure: 5.4, speed: 44 },
  { time: '10:15', temp: 179, pressure: 5.0, speed: 45 },
  { time: '10:20', temp: 181, pressure: 5.3, speed: 47 },
];

export function TechnicalTelemetryPanel() {
  return (
    <Card className="h-full border-l rounded-none border-y-0 border-r-0 glass-card">
      <CardHeader className="py-4 border-b border-border/50">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Telemetria em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground">Temperatura (°C)</span>
              <Thermometer className="h-3 w-3 text-orange-500" />
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTelemetryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground">Pressão (Bar)</span>
              <Gauge className="h-3 w-3 text-blue-500" />
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTelemetryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                  />
                  <Line type="monotone" dataKey="pressure" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-[9px] font-bold uppercase">Eficiência</span>
                </div>
                <p className="text-lg font-black">94.2%</p>
             </div>
             <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="h-3 w-3 text-emerald-500" />
                  <span className="text-[9px] font-bold uppercase">Cadência</span>
                </div>
                <p className="text-lg font-black">46 p/m</p>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
