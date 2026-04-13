import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutGrid, Ruler } from 'lucide-react';

export function SpacingSection() {
  return (
    <>
            {/* Spacing Scale */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  Escala de Espaçamento
                </CardTitle>
                <CardDescription>Sistema de spacing baseado em múltiplos de 4px</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <div className="space-y-2 min-w-[500px]">
                      {[
                        { name: '0', value: '0px', class: 'p-0' },
                        { name: '0.5', value: '2px', class: 'p-0.5' },
                        { name: '1', value: '4px', class: 'p-1' },
                        { name: '1.5', value: '6px', class: 'p-1.5' },
                        { name: '2', value: '8px', class: 'p-2' },
                        { name: '3', value: '12px', class: 'p-3' },
                        { name: '4', value: '16px', class: 'p-4' },
                        { name: '5', value: '20px', class: 'p-5' },
                        { name: '6', value: '24px', class: 'p-6' },
                        { name: '8', value: '32px', class: 'p-8' },
                        { name: '10', value: '40px', class: 'p-10' },
                        { name: '12', value: '48px', class: 'p-12' },
                        { name: '16', value: '64px', class: 'p-16' },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center gap-4">
                          <div className="w-16 text-sm font-mono text-muted-foreground">{item.class}</div>
                          <div className="w-16 text-sm text-muted-foreground">{item.value}</div>
                          <div className="flex-1">
                            <div 
                              className="bg-primary/20 border border-primary/30 rounded"
                              style={{ width: item.value === '0px' ? '4px' : item.value, height: '24px' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gap Examples */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Gap (Espaçamento entre elementos)</CardTitle>
                <CardDescription>Classes gap-* para flex e grid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { name: 'gap-1', value: '4px' },
                    { name: 'gap-2', value: '8px' },
                    { name: 'gap-3', value: '12px' },
                    { name: 'gap-4', value: '16px' },
                    { name: 'gap-6', value: '24px' },
                  ].map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="text-primary text-sm">{item.name}</code>
                        <span className="text-xs text-muted-foreground">({item.value})</span>
                      </div>
                      <div className={`flex ${item.name}`}>
                        {[1, 2, 3, 4].map((n) => (
                          <div key={n} className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-medium">
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Grid System */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                  Sistema de Grid
                </CardTitle>
                <CardDescription>Layouts responsivos com CSS Grid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* 12 Column Grid */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Grid 12 Colunas</h4>
                  <div className="grid grid-cols-12 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-10 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">grid grid-cols-12 gap-2</code></p>
                </div>

                {/* Responsive Grid */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Grid Responsivo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="h-20 rounded-lg bg-secondary/20 border border-secondary/30 flex items-center justify-center font-medium">
                        Item {n}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4</code></p>
                </div>

                {/* Column Span */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Column Span</h4>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-6 h-12 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-sm">
                      col-span-6 (100%)
                    </div>
                    <div className="col-span-4 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-sm">
                      col-span-4
                    </div>
                    <div className="col-span-2 h-12 rounded-lg bg-secondary/20 border border-secondary/30 flex items-center justify-center text-sm">
                      col-span-2
                    </div>
                    <div className="col-span-3 h-12 rounded-lg bg-[hsl(var(--success))]/20 border border-[hsl(var(--success))]/30 flex items-center justify-center text-sm">
                      col-span-3
                    </div>
                    <div className="col-span-3 h-12 rounded-lg bg-[hsl(var(--warning))]/20 border border-[hsl(var(--warning))]/30 flex items-center justify-center text-sm">
                      col-span-3
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flexbox */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Flexbox Utilities</CardTitle>
                <CardDescription>Classes para alinhamento e distribuição</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Justify Content */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Justify Content</h4>
                  {[
                    { name: 'justify-start', label: 'Start' },
                    { name: 'justify-center', label: 'Center' },
                    { name: 'justify-end', label: 'End' },
                    { name: 'justify-between', label: 'Between' },
                    { name: 'justify-around', label: 'Around' },
                    { name: 'justify-evenly', label: 'Evenly' },
                  ].map((item) => (
                    <div key={item.name} className="space-y-1">
                      <code className="text-primary text-xs">{item.name}</code>
                      <div className={`flex ${item.name} p-3 rounded-lg bg-muted/50 border`}>
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="w-10 h-10 rounded bg-primary/30 border border-primary/50 flex items-center justify-center text-sm font-medium">
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Align Items */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Align Items</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'items-start', label: 'Start' },
                      { name: 'items-center', label: 'Center' },
                      { name: 'items-end', label: 'End' },
                    ].map((item) => (
                      <div key={item.name} className="space-y-1">
                        <code className="text-primary text-xs">{item.name}</code>
                        <div className={`flex ${item.name} gap-2 p-3 rounded-lg bg-muted/50 border h-24`}>
                          <div className="w-10 h-6 rounded bg-primary/30 border border-primary/50" />
                          <div className="w-10 h-10 rounded bg-primary/30 border border-primary/50" />
                          <div className="w-10 h-8 rounded bg-primary/30 border border-primary/50" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flex Direction */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Flex Direction</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <code className="text-primary text-xs">flex-row (padrão)</code>
                      <div className="flex flex-row gap-2 p-3 rounded-lg bg-muted/50 border">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="w-10 h-10 rounded bg-primary/30 border border-primary/50 flex items-center justify-center text-sm">{n}</div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <code className="text-primary text-xs">flex-col</code>
                      <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50 border">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="w-full h-8 rounded bg-primary/30 border border-primary/50 flex items-center justify-center text-sm">{n}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Container & Breakpoints */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Breakpoints Responsivos</CardTitle>
                <CardDescription>Pontos de quebra para layouts responsivos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Prefixo</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Min-width</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Exemplo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4"><code className="text-primary text-sm">sm:</code></td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">640px</td>
                        <td className="py-3 px-4 text-sm"><code className="text-muted-foreground">sm:grid-cols-2</code></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4"><code className="text-primary text-sm">md:</code></td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">768px</td>
                        <td className="py-3 px-4 text-sm"><code className="text-muted-foreground">md:grid-cols-3</code></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4"><code className="text-primary text-sm">lg:</code></td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">1024px</td>
                        <td className="py-3 px-4 text-sm"><code className="text-muted-foreground">lg:grid-cols-4</code></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4"><code className="text-primary text-sm">xl:</code></td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">1280px</td>
                        <td className="py-3 px-4 text-sm"><code className="text-muted-foreground">xl:grid-cols-5</code></td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4"><code className="text-primary text-sm">2xl:</code></td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">1536px</td>
                        <td className="py-3 px-4 text-sm"><code className="text-muted-foreground">2xl:grid-cols-6</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Border Radius */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Border Radius</CardTitle>
                <CardDescription>Escalas de arredondamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  {[
                    { name: 'rounded-none', value: '0' },
                    { name: 'rounded-sm', value: '2px' },
                    { name: 'rounded', value: '4px' },
                    { name: 'rounded-md', value: '6px' },
                    { name: 'rounded-lg', value: '8px' },
                    { name: 'rounded-xl', value: '12px' },
                    { name: 'rounded-2xl', value: '16px' },
                    { name: 'rounded-3xl', value: '24px' },
                    { name: 'rounded-full', value: '9999px' },
                  ].map((item) => (
                    <div key={item.name} className="text-center space-y-2">
                      <div className={`w-16 h-16 bg-primary/30 border-2 border-primary ${item.name}`} />
                      <p className="text-xs font-mono text-muted-foreground">{item.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
    </>
  );
}
