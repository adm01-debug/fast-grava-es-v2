import { Moon, Sun, Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAutoTheme } from '@/hooks/useAutoTheme';
import { cn } from '@/lib/utils';

interface AutoThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function AutoThemeToggle({ className, compact = false }: AutoThemeToggleProps) {
  const { config, setConfig, isAutoThemeEnabled } = useAutoTheme();

  if (compact) {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="auto-theme" className="text-sm cursor-pointer">
            Tema automático
          </Label>
        </div>
        <Switch
          id="auto-theme"
          checked={isAutoThemeEnabled}
          onCheckedChange={(enabled) => setConfig({ enabled })}
        />
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Tema Automático</CardTitle>
              <CardDescription className="text-xs">
                Alterna entre claro e escuro baseado no horário
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={isAutoThemeEnabled}
            onCheckedChange={(enabled) => setConfig({ enabled })}
          />
        </div>
      </CardHeader>

      {isAutoThemeEnabled && (
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <Moon className="h-3 w-3" />
                Escuro a partir de
              </Label>
              <Select
                value={String(config.darkStartHour)}
                onValueChange={(v) => setConfig({ darkStartHour: parseInt(v, 10) })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {String(i).padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <Sun className="h-3 w-3" />
                Claro a partir de
              </Label>
              <Select
                value={String(config.darkEndHour)}
                onValueChange={(v) => setConfig({ darkEndHour: parseInt(v, 10) })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {String(i).padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            🌙 {String(config.darkStartHour).padStart(2, '0')}:00 → ☀️ {String(config.darkEndHour).padStart(2, '0')}:00
          </p>
        </CardContent>
      )}
    </Card>
  );
}
