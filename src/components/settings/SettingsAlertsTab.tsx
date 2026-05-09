import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Save, RotateCcw } from 'lucide-react';

interface AlertThresholds {
  lowBuffer: number; criticalBuffer: number; delayedJobMinutes: number;
  oeeWarning: number; oeeCritical: number; energyPeakKw: number;
  bottleneckRiskMinutes: number; estimatedLoadLimitPercentage: number;
}

interface SettingsAlertsTabProps {
  thresholds: AlertThresholds;
  onThresholdChange: (key: string, value: number) => void;
  onSave: () => void;
  onReset: () => void;
}

export function SettingsAlertsTab({ thresholds, onThresholdChange, onSave, onReset }: SettingsAlertsTabProps) {
  const fields: Array<{ key: keyof AlertThresholds; label: string; desc: string }> = [
    { key: 'lowBuffer', label: 'Buffer Baixo (%)', desc: 'Alerta quando buffer ficar abaixo deste %' },
    { key: 'criticalBuffer', label: 'Buffer Crítico (%)', desc: 'Alerta crítico quando buffer muito baixo' },
    { key: 'delayedJobMinutes', label: 'Job Atrasado (minutos)', desc: 'Tempo para considerar um job atrasado' },
    { key: 'oeeWarning', label: 'OEE Warning (%)', desc: 'OEE abaixo deste valor gera warning' },
    { key: 'oeeCritical', label: 'OEE Crítico (%)', desc: 'OEE abaixo deste valor é crítico' },
    { key: 'energyPeakKw', label: 'Pico de Energia (kW)', desc: 'Alerta quando consumo ultrapassar' },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" />Limites de Alerta</CardTitle>
        <CardDescription>Configure quando os alertas devem ser disparados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(f => (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              <Input type="number" value={thresholds[f.key]} onChange={(e) => onThresholdChange(f.key, parseInt(e.target.value))} />
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onReset}><RotateCcw className="h-4 w-4 mr-2" />Restaurar Padrão</Button>
          <Button onClick={onSave} className="gradient-primary"><Save className="h-4 w-4 mr-2" />Salvar Limites</Button>
        </div>
      </CardContent>
    </Card>
  );
}
