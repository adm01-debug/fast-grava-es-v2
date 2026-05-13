import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Save, RotateCcw, Settings2 } from 'lucide-react';
import { useMachines, useTechniques } from '@/hooks/useJobs';
import { useState } from 'react';

interface AlertThresholds {
  lowBuffer: number; criticalBuffer: number; delayedJobMinutes: number;
  oeeWarning: number; oeeCritical: number; energyPeakKw: number;
  bottleneckRiskMinutes: number; estimatedLoadLimitPercentage: number;
}

interface SettingsAlertsTabProps {
  thresholds: AlertThresholds;
  onThresholdChange: (key: string, value: number) => void;
  onEntityThresholdChange?: (entityId: string, value: number) => void;
  onSave: () => void;
  onReset: () => void;
  entityThresholds?: Record<string, number>;
}

export function SettingsAlertsTab({ thresholds, onThresholdChange, onEntityThresholdChange, onSave, onReset, entityThresholds = {} }: SettingsAlertsTabProps) {
  const { data: machines } = useMachines();
  const { data: techniques } = useTechniques();
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [entityValue, setEntityValue] = useState<number>(480);
  const fields: Array<{ key: keyof AlertThresholds; label: string; desc: string }> = [
    { key: 'lowBuffer', label: 'Buffer Baixo (%)', desc: 'Alerta quando buffer ficar abaixo deste %' },
    { key: 'criticalBuffer', label: 'Buffer Crítico (%)', desc: 'Alerta crítico quando buffer muito baixo' },
    { key: 'delayedJobMinutes', label: 'Job Atrasado (minutos)', desc: 'Tempo para considerar um job atrasado' },
    { key: 'oeeWarning', label: 'OEE Warning (%)', desc: 'OEE abaixo deste valor gera warning' },
    { key: 'oeeCritical', label: 'OEE Crítico (%)', desc: 'OEE abaixo deste valor é crítico' },
    { key: 'energyPeakKw', label: 'Pico de Energia (kW)', desc: 'Alerta quando consumo ultrapassar' },
    { key: 'bottleneckRiskMinutes', label: 'Risco de Gargalo (min)', desc: 'Carga total na coluna para considerar gargalo' },
    { key: 'estimatedLoadLimitPercentage', label: 'Limite de Carga Máquina (%)', desc: 'Ocupação máxima recomendada por equipamento' },
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

        <Separator className="my-6" />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-bold">Configuração por Máquina ou Técnica</h4>
          </div>
          <p className="text-xs text-muted-foreground">Define limites de gargalo específicos para equipamentos ou processos específicos.</p>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Entidade</Label>
              <Select value={selectedEntity} onValueChange={(val) => {
                setSelectedEntity(val);
                setEntityValue(entityThresholds[val] || thresholds.bottleneckRiskMinutes);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma máquina ou técnica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_default" disabled>Técnicas</SelectItem>
                  {techniques?.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                  <SelectItem value="_default_m" disabled className="mt-2 border-t pt-2">Máquinas</SelectItem>
                  {machines?.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.code} - {m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-[150px]">
              <Label>Limite (min)</Label>
              <Input
                type="number"
                value={entityValue}
                onChange={(e) => setEntityValue(parseInt(e.target.value))}
                disabled={!selectedEntity}
              />
            </div>

            <Button
              variant="secondary"
              disabled={!selectedEntity}
              onClick={() => onEntityThresholdChange?.(selectedEntity, entityValue)}
            >
              Aplicar Limite
            </Button>
          </div>

          {Object.keys(entityThresholds).length > 0 && (
            <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
              {Object.entries(entityThresholds).map(([id, val]) => {
                const entityName = machines?.find(m => m.id === id)?.code || techniques?.find(t => t.id === id)?.name || id;
                return (
                  <div key={id} className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/50 text-xs">
                    <span className="truncate mr-2">{entityName}</span>
                    <Badge variant="outline" className="font-mono">{val}m</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={onReset}><RotateCcw className="h-4 w-4 mr-2" />Restaurar Padrão</Button>
          <Button onClick={onSave} className="gradient-primary"><Save className="h-4 w-4 mr-2" />Salvar Limites</Button>
        </div>
      </CardContent>
    </Card>
  );
}
