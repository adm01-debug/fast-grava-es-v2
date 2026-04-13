import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ShadowsSection() {
  const boxShadows = [
    { name: 'shadow-sm', class: 'shadow-sm', desc: 'Sombra pequena' },
    { name: 'shadow', class: 'shadow', desc: 'Sombra padrão' },
    { name: 'shadow-md', class: 'shadow-md', desc: 'Sombra média' },
    { name: 'shadow-lg', class: 'shadow-lg', desc: 'Sombra grande' },
    { name: 'shadow-xl', class: 'shadow-xl', desc: 'Sombra extra grande' },
    { name: 'shadow-2xl', class: 'shadow-2xl', desc: 'Sombra 2XL' },
  ];

  const customShadows = [
    { name: 'card-shadow', class: 'card-shadow', desc: 'Sombra para cards' },
    { name: 'glow-primary', class: 'glow-primary', desc: 'Glow primário' },
    { name: 'glow-secondary', class: 'glow-secondary', desc: 'Glow secundário' },
    { name: 'glow-success', class: 'glow-success', desc: 'Glow sucesso' },
    { name: 'glow-accent', class: 'glow-accent', desc: 'Glow accent' },
    { name: 'glow-warning', class: 'glow-warning', desc: 'Glow warning' },
  ];

  const borderWidths = [
    { name: 'border-0', width: '0px' },
    { name: 'border', width: '1px' },
    { name: 'border-2', width: '2px' },
    { name: 'border-4', width: '4px' },
    { name: 'border-8', width: '8px' },
  ];

  const borderStyles = [
    { name: 'border-solid', style: 'solid' },
    { name: 'border-dashed', style: 'dashed' },
    { name: 'border-dotted', style: 'dotted' },
    { name: 'border-double', style: 'double' },
  ];

  const borderRadius = [
    { name: 'rounded-none', radius: '0px' },
    { name: 'rounded-sm', radius: '0.125rem' },
    { name: 'rounded', radius: '0.25rem' },
    { name: 'rounded-md', radius: '0.375rem' },
    { name: 'rounded-lg', radius: '0.5rem' },
    { name: 'rounded-xl', radius: '0.75rem' },
    { name: 'rounded-2xl', radius: '1rem' },
    { name: 'rounded-3xl', radius: '1.5rem' },
    { name: 'rounded-full', radius: '9999px' },
  ];

  const borderColors = [
    { name: 'border-border', colorClass: 'border-border', desc: 'Padrão' },
    { name: 'border-primary', colorClass: 'border-primary', desc: 'Primário' },
    { name: 'border-secondary', colorClass: 'border-secondary', desc: 'Secundário' },
    { name: 'border-accent', colorClass: 'border-accent', desc: 'Accent' },
    { name: 'border-destructive', colorClass: 'border-destructive', desc: 'Destructive' },
    { name: 'border-success', colorClass: 'border-[hsl(var(--success))]', desc: 'Success' },
    { name: 'border-warning', colorClass: 'border-[hsl(var(--warning))]', desc: 'Warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Box Shadows - Tailwind */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Box Shadows (Tailwind)
          </CardTitle>
          <CardDescription>Sombras padrão do Tailwind CSS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {boxShadows.map((shadow) => (
              <div key={shadow.name} className="space-y-2 text-center">
                <div className={`h-20 rounded-lg bg-card border border-border ${shadow.class} flex items-center justify-center`}>
                  <Square className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs font-mono text-primary">.{shadow.name}</p>
                <p className="text-xs text-muted-foreground">{shadow.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Shadows & Glows */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Sombras Customizadas & Glows
          </CardTitle>
          <CardDescription>Efeitos de glow e sombras especiais do design system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {customShadows.map((shadow) => (
              <div key={shadow.name} className="space-y-2 text-center">
                <div className={`h-20 rounded-lg bg-card border border-border ${shadow.class} flex items-center justify-center`}>
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs font-mono text-primary">.{shadow.name}</p>
                <p className="text-xs text-muted-foreground">{shadow.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Shadow Examples */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Sombras Interativas (Hover)
          </CardTitle>
          <CardDescription>Efeitos de sombra ativados no hover</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-card border border-border hover-lift cursor-pointer flex items-center justify-center">
                <span className="text-sm font-medium">Hover Lift</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.hover-lift</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-card border border-border hover-glow cursor-pointer flex items-center justify-center">
                <span className="text-sm font-medium">Hover Glow</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.hover-glow</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-card border border-border card-interactive cursor-pointer flex items-center justify-center">
                <span className="text-sm font-medium">Card Interactive</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.card-interactive</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-card border border-border card-float cursor-pointer flex items-center justify-center">
                <span className="text-sm font-medium">Card Float</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.card-float</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Border Widths */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Square className="h-5 w-5 text-primary" />
            Espessura de Bordas
          </CardTitle>
          <CardDescription>Diferentes espessuras de borda disponíveis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 items-end">
            {borderWidths.map((border) => (
              <div key={border.name} className="space-y-2 text-center">
                <div className={`w-16 h-16 rounded-lg bg-muted ${border.name} border-primary flex items-center justify-center`}>
                  <span className="text-xs font-medium">{border.width}</span>
                </div>
                <p className="text-xs font-mono text-primary">.{border.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Styles */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Estilos de Borda
          </CardTitle>
          <CardDescription>Diferentes estilos de linha para bordas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {borderStyles.map((style) => (
              <div key={style.name} className="space-y-2 text-center">
                <div className={`h-16 rounded-lg bg-muted border-2 border-primary ${style.name} flex items-center justify-center`}>
                  <span className="text-sm font-medium capitalize">{style.style}</span>
                </div>
                <p className="text-xs font-mono text-primary">.{style.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Circle className="h-5 w-5 text-primary" />
            Border Radius
          </CardTitle>
          <CardDescription>Diferentes raios de borda para arredondamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
            {borderRadius.map((radius) => (
              <div key={radius.name} className="space-y-2 text-center">
                <div className={`w-14 h-14 bg-primary ${radius.name} mx-auto`} />
                <p className="text-xs font-mono text-primary">.{radius.name}</p>
                <p className="text-xs text-muted-foreground">{radius.radius}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Colors */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Cores de Borda
          </CardTitle>
          <CardDescription>Cores semânticas para bordas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {borderColors.map((color) => (
              <div key={color.name} className="space-y-2 text-center">
                <div className={`h-16 rounded-lg bg-muted border-2 ${color.colorClass} flex items-center justify-center`}>
                  <span className="text-xs font-medium">{color.desc}</span>
                </div>
                <p className="text-xs font-mono text-primary">.{color.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Special Border Effects */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Efeitos Especiais de Borda
          </CardTitle>
          <CardDescription>Bordas animadas e efeitos especiais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-card card-pulse-border flex items-center justify-center">
                <span className="text-sm font-medium">Pulse Border</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.card-pulse-border</p>
              <p className="text-xs text-muted-foreground text-center">Borda com animação pulsante</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-card neon-border border border-border flex items-center justify-center">
                <span className="text-sm font-medium">Neon Border</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.neon-border</p>
              <p className="text-xs text-muted-foreground text-center">Efeito neon no hover (dark mode)</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-xl bg-card card-shine border border-border/50 flex items-center justify-center">
                <span className="text-sm font-medium">Card Shine</span>
              </div>
              <p className="text-xs font-mono text-primary text-center">.card-shine</p>
              <p className="text-xs text-muted-foreground text-center">Efeito de brilho passando</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dividers */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Divisores
          </CardTitle>
          <CardDescription>Linhas divisórias e separadores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Horizontal (border-t)</p>
            <div className="border-t border-border" />
            <p className="text-xs font-mono text-muted-foreground">.border-t .border-border</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Com margem (divide-y)</p>
            <div className="divide-y divide-border">
              <div className="py-3">Item 1</div>
              <div className="py-3">Item 2</div>
              <div className="py-3">Item 3</div>
            </div>
            <p className="text-xs font-mono text-muted-foreground">.divide-y .divide-border</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Vertical (divide-x)</p>
            <div className="flex divide-x divide-border">
              <div className="px-4">Col 1</div>
              <div className="px-4">Col 2</div>
              <div className="px-4">Col 3</div>
            </div>
            <p className="text-xs font-mono text-muted-foreground">.divide-x .divide-border</p>
          </div>
        </CardContent>
      </Card>

      {/* Ring (Focus) */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Ring (Focus States)
          </CardTitle>
          <CardDescription>Anéis de foco para estados de interação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 text-center">
              <div className="h-16 rounded-lg bg-muted ring-1 ring-ring flex items-center justify-center">
                <span className="text-xs">ring-1</span>
              </div>
              <p className="text-xs font-mono text-primary">.ring-1 .ring-ring</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="h-16 rounded-lg bg-muted ring-2 ring-ring flex items-center justify-center">
                <span className="text-xs">ring-2</span>
              </div>
              <p className="text-xs font-mono text-primary">.ring-2 .ring-ring</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="h-16 rounded-lg bg-muted ring-2 ring-primary flex items-center justify-center">
                <span className="text-xs">ring-primary</span>
              </div>
              <p className="text-xs font-mono text-primary">.ring-2 .ring-primary</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="h-16 rounded-lg bg-muted ring-2 ring-offset-2 ring-offset-background ring-primary flex items-center justify-center">
                <span className="text-xs">ring-offset</span>
              </div>
              <p className="text-xs font-mono text-primary">.ring-offset-2</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
