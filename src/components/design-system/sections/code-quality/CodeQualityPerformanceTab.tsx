import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, Gauge, Zap, Activity, Timer } from 'lucide-react';

interface Props {
  performanceMetrics: {
    lighthouseScore: number; firstContentfulPaint: number; largestContentfulPaint: number;
    timeToInteractive: number; codeChunks: number;
  };
}

export function CodeQualityPerformanceTab({ performanceMetrics }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Lighthouse Score', value: performanceMetrics.lighthouseScore.toString(), icon: Gauge, color: 'success', sub: undefined },
          { label: 'FCP', value: `${(performanceMetrics.firstContentfulPaint / 1000).toFixed(1)}s`, icon: Zap, color: 'success', sub: 'First Contentful Paint' },
          { label: 'LCP', value: `${(performanceMetrics.largestContentfulPaint / 1000).toFixed(1)}s`, icon: Activity, color: 'warning', sub: 'Largest Contentful Paint' },
          { label: 'TTI', value: `${(performanceMetrics.timeToInteractive / 1000).toFixed(1)}s`, icon: Timer, color: 'warning', sub: 'Time to Interactive' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <Card key={label} variant="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold text-foreground">{value}</p></div>
                <div className={`h-10 w-10 rounded-full bg-${color}/10 flex items-center justify-center`}><Icon className={`h-5 w-5 text-${color}`} /></div>
              </div>
              {label === 'Lighthouse Score' && <Progress value={performanceMetrics.lighthouseScore} className="mt-2 h-2" />}
              {sub && <p className="text-xs text-muted-foreground mt-2">{sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card variant="elevated">
          <CardHeader><CardTitle className="text-lg">Core Web Vitals</CardTitle><CardDescription>Métricas de experiência do usuário</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'First Contentful Paint (FCP)', value: performanceMetrics.firstContentfulPaint, divisor: 30, status: 'Bom', statusColor: 'success', meta: '< 1.8s' },
                { label: 'Largest Contentful Paint (LCP)', value: performanceMetrics.largestContentfulPaint, divisor: 40, status: 'Precisa Melhorar', statusColor: 'warning', meta: '< 2.5s' },
                { label: 'Time to Interactive (TTI)', value: performanceMetrics.timeToInteractive, divisor: 50, status: 'Precisa Melhorar', statusColor: 'warning', meta: '< 3.8s' },
              ].map(({ label, value, divisor, status, statusColor, meta }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1"><span className="text-sm">{label}</span><Badge variant="secondary" className={`bg-${statusColor}/10 text-${statusColor}`}>{status}</Badge></div>
                  <Progress value={100 - (value / divisor)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Meta: {meta}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardHeader><CardTitle className="text-lg">Recomendações de Performance</CardTitle><CardDescription>Ações para melhorar a performance</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: AlertTriangle, color: 'warning', title: 'Otimizar imagens', desc: 'Use formatos modernos como WebP e lazy loading' },
                { icon: AlertTriangle, color: 'warning', title: 'Reduzir JavaScript não utilizado', desc: 'Remover dependências não utilizadas' },
                { icon: CheckCircle2, color: 'success', title: 'Code splitting implementado', desc: `${performanceMetrics.codeChunks} chunks criados` },
                { icon: CheckCircle2, color: 'success', title: 'Tree shaking ativo', desc: 'Código não utilizado removido automaticamente' },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className={`flex items-start gap-3 p-3 rounded-lg bg-${color}/10`}>
                  <Icon className={`h-4 w-4 text-${color} mt-0.5`} />
                  <div><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
