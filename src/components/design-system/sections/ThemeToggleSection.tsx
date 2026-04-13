import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function ThemeToggleSection() {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-warning" />
            <Moon className="h-5 w-5 text-primary" />
            Theme Toggle
          </CardTitle>
          <CardDescription>
            Componente para alternar entre temas claro e escuro com animações cinematográficas e feedback sonoro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Live Demo */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Demonstração</h4>
            <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-xl border">
              <ThemeToggle />
              <div className="text-sm text-muted-foreground">
                <p>Clique para trocar o tema ou use o dropdown para opções.</p>
                <p className="text-xs mt-1">Clique com botão direito ou pressione para ver menu com opção de som.</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recursos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/20 border space-y-2">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-warning animate-[spin_8s_linear_infinite]" />
                  <span className="font-medium">Animação Solar</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ícone do sol gira lentamente (8s) em modo claro com glow dourado.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/20 border space-y-2">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-primary animate-pulse" />
                  <span className="font-medium">Pulsação Lunar</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ícone da lua pulsa suavemente (3s) em modo escuro com glow azulado.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/20 border space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium">Overlay Cinematográfico</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Transição com gradiente radial e blur suave ao trocar de tema.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/20 border space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-success" />
                  <span className="font-medium">Feedback Sonoro</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sons distintos: chime ascendente (claro) e tom descendente (escuro).
                </p>
              </div>
            </div>
          </div>

          {/* Sound Control */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Controle de Som</h4>
            <div className="p-4 rounded-lg bg-muted/20 border">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted/40">
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Preferência Persistida</p>
                  <p className="text-sm text-muted-foreground">
                    A opção de som é salva em <code className="text-primary text-xs">localStorage</code> e 
                    persiste entre sessões. Um indicador visual aparece quando o som está desativado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Code */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Como Usar</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`import { ThemeToggle } from '@/components/layout/ThemeToggle';

// No seu componente:
<ThemeToggle />`}
              </pre>
            </div>
          </div>

          {/* Hook Usage */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Hook useThemeSound</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`import { useThemeSound } from '@/hooks/useThemeSound';

const { 
  playLightModeSound,  // Toca som de tema claro
  playDarkModeSound,   // Toca som de tema escuro
  soundEnabled,        // Estado atual do som
  toggleSound          // Alternar som on/off
} = useThemeSound();`}
              </pre>
            </div>
          </div>

          {/* Transitions */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Transições Globais</h4>
            <p className="text-sm text-muted-foreground">
              Ao trocar de tema, transições suaves são aplicadas automaticamente a:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">background-color</Badge>
              <Badge variant="outline">border-color</Badge>
              <Badge variant="outline">color</Badge>
              <Badge variant="outline">box-shadow</Badge>
              <Badge variant="outline">filter</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Duração: 0.3s-0.4s com <code className="text-primary">cubic-bezier(0.4, 0, 0.2, 1)</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Customization Examples Card */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Customização de Animações
          </CardTitle>
          <CardDescription>
            Exemplos de como personalizar as animações do ThemeToggle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom Sun Animation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Animação do Sol</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`/* Rotação lenta contínua - padrão */
.sun-icon {
  animation: spin 8s linear infinite;
  filter: drop-shadow(0 0 6px hsl(var(--warning) / 0.6));
}

/* Rotação mais rápida */
.sun-icon-fast {
  animation: spin 3s linear infinite;
}

/* Pulsação ao invés de rotação */
.sun-icon-pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* Brilho intermitente */
@keyframes sun-glow {
  0%, 100% { filter: drop-shadow(0 0 4px hsl(var(--warning) / 0.4)); }
  50% { filter: drop-shadow(0 0 12px hsl(var(--warning) / 0.8)); }
}
.sun-icon-glow {
  animation: sun-glow 2s ease-in-out infinite;
}`}
              </pre>
            </div>
          </div>

          {/* Custom Moon Animation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Animação da Lua</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`/* Pulsação suave - padrão */
.moon-icon {
  animation: pulse 3s ease-in-out infinite;
  filter: drop-shadow(0 0 8px hsl(var(--primary) / 0.6));
}

/* Flutuação vertical */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
.moon-icon-float {
  animation: float 3s ease-in-out infinite;
}

/* Brilho de estrelas ao redor */
@keyframes twinkle {
  0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px hsl(var(--primary) / 0.5)); }
  50% { opacity: 0.8; filter: drop-shadow(0 0 12px hsl(var(--primary) / 0.9)); }
}
.moon-icon-twinkle {
  animation: twinkle 2s ease-in-out infinite;
}`}
              </pre>
            </div>
          </div>

          {/* Custom Transition Overlay */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Overlay de Transição</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`/* Gradiente radial cinematográfico - padrão */
.theme-overlay-dark {
  background: radial-gradient(
    circle at center,
    hsl(var(--primary) / 0.15) 0%,
    hsl(222 47% 8% / 0.4) 100%
  );
  backdrop-filter: blur(2px);
}

.theme-overlay-light {
  background: radial-gradient(
    circle at center,
    hsl(var(--warning) / 0.2) 0%,
    hsl(220 20% 97% / 0.5) 100%
  );
}

/* Efeito de cortina horizontal */
@keyframes curtain {
  0% { transform: scaleX(0); transform-origin: left; }
  50% { transform: scaleX(1); transform-origin: left; }
  51% { transform-origin: right; }
  100% { transform: scaleX(0); transform-origin: right; }
}

/* Efeito de círculo expandindo */
@keyframes circle-expand {
  0% { clip-path: circle(0% at center); }
  100% { clip-path: circle(150% at center); }
}`}
              </pre>
            </div>
          </div>

          {/* Custom Sound Effects */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Efeitos Sonoros Customizados</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`// Customizar frequências e duração dos sons
const playCustomLightSound = () => {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  // Frequência inicial e final
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.2);
  
  // Envelope de volume
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
};

// Adicionar harmônicos para som mais rico
const addHarmonic = (ctx, baseFreq, multiplier, delay) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = baseFreq * multiplier;
  gain.gain.value = 0.02 / multiplier; // Harmônicos mais fracos
  // ... configurar envelope
};`}
              </pre>
            </div>
          </div>

          {/* CSS Variables */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variáveis CSS Relevantes</h4>
            <div className="p-4 rounded-lg bg-background border font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`:root {
  /* Cores principais para temas */
  --background: 220 20% 97%;      /* Fundo light mode */
  --foreground: 222 47% 12%;      /* Texto light mode */
  --primary: 222 47% 50%;         /* Cor primária (lua) */
  --warning: 38 92% 50%;          /* Cor de warning (sol) */
  
  /* Transições globais */
  --theme-transition: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark {
  --background: 222 47% 8%;       /* Fundo dark mode */
  --foreground: 220 20% 95%;      /* Texto dark mode */
}

/* Aplicar transições suaves */
html, body, .bg-background, .bg-card {
  transition: 
    background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}`}
              </pre>
            </div>
          </div>

          {/* Animation Timing Tips */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dicas de Timing</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/20 border space-y-2">
                <span className="font-medium">Easing Functions</span>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><code className="text-primary">ease-out</code> - Entrada rápida, saída suave</li>
                  <li><code className="text-primary">ease-in-out</code> - Suave nos dois lados</li>
                  <li><code className="text-primary">cubic-bezier(0.34,1.56,0.64,1)</code> - Efeito "bounce"</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/20 border space-y-2">
                <span className="font-medium">Durações Recomendadas</span>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><code className="text-primary">150ms</code> - Micro-interações</li>
                  <li><code className="text-primary">300-400ms</code> - Transições de tema</li>
                  <li><code className="text-primary">500-600ms</code> - Overlay cinematográfico</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Changelog Section Component
