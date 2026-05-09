import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Cpu, Zap, RefreshCw, AlertCircle, CheckCircle2, Target, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AutonomousEventLog() {
  const [logs, setLogs] = useState<any[]>([]);
  
  const events = [
    { type: 'optimization', message: 'Re-otimizando cronograma: Detectado atraso de 15m na Máquina 2.', icon: RefreshCw },
    { type: 'maintenance', message: 'Ordem de serviço automática gerada para Máquina 4 (Fator de Risco > 85%).', icon: Brain },
    { type: 'logistics', message: 'Solicitação de reposição de Tinta Azul enviada ao almoxarifado.', icon: Zap },
    { type: 'quality', message: 'Alerta SPC: Processo da Máquina 1 está tendendo ao limite superior. Ajuste sugerido.', icon: AlertCircle },
    { type: 'sync', message: 'Sincronização Bitrix24 concluída: 12 novas ordens processadas.', icon: CheckCircle2 },
    { type: 'efficiency', message: 'OEE Global atingiu 92% - Performance máxima detectada.', icon: Target },
    { type: 'security', message: 'Auditoria de integridade concluída: Nenhuma vulnerabilidade encontrada.', icon: ShieldCheck }
  ];

  useEffect(() => {
    // Add initial logs
    setLogs(events.slice(0, 3).map((e, i) => ({ ...e, id: i, time: new Date() })));

    const interval = setInterval(() => {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setLogs(prev => [
        { ...randomEvent, id: Date.now(), time: new Date() },
        ...prev.slice(0, 4)
      ]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="glass-card border-primary/20 bg-primary/5 overflow-hidden">
      <CardHeader className="py-3 border-b border-primary/20 bg-primary/10">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <Brain className="h-4 w-4 animate-pulse" />
          Orquestração Autônoma (IA)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-primary/10">
          {logs.map((log) => (
            <div key={log.id} className="p-3 flex items-start gap-3 hover:bg-primary/5 transition-colors group">
              <div className="mt-1 p-1.5 rounded-full bg-background border border-primary/20 text-primary group-hover:shadow-glow-primary transition-all">
                <log.icon className="h-3 w-3" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <Badge variant="outline" className="text-[8px] font-black uppercase py-0 px-1 border-primary/30">
                    {log.type}
                  </Badge>
                  <span className="text-[8px] text-muted-foreground font-mono">
                    {log.time.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[10px] font-medium leading-tight text-foreground/80">
                  {log.message}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-primary/10 bg-primary/5 flex justify-center">
           <span className="text-[8px] font-bold text-primary/60 uppercase animate-pulse">
             Monitorando 12 fluxos de decisão ativos
           </span>
        </div>
      </CardContent>
    </Card>
  );
}
