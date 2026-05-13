import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { CodeBlock } from '@/components/ui/code-block';
import { Award, Sparkles, Coins, Flame, Trophy, Star } from 'lucide-react';

export function BadgesSection() {
  return (
    <>
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Variantes de Badges
                </CardTitle>
                <CardDescription>Todas as variantes incluindo gamificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Standard Variants */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes Padrão</h4>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                  </div>
                </div>

                {/* Gamification Variants */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes Gamificação</h4>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="xp" animated><Sparkles className="h-3 w-3" /> +150 XP</Badge>
                    <Badge variant="coins" animated><Coins className="h-3 w-3" /> 500 Coins</Badge>
                    <Badge variant="streak" animated><Flame className="h-3 w-3" /> 7 Dias</Badge>
                    <Badge variant="gold" animated><Trophy className="h-3 w-3" /> Ouro</Badge>
                    <Badge variant="silver" animated><Award className="h-3 w-3" /> Prata</Badge>
                    <Badge variant="bronze" animated><Star className="h-3 w-3" /> Bronze</Badge>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status Badges (9 variantes)</h4>
                  <p className="text-xs text-muted-foreground">Badges específicas para status de jobs no sistema de agendamento</p>
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge status="queue" />
                    <StatusBadge status="ready" />
                    <StatusBadge status="scheduled" />
                    <StatusBadge status="production" />
                    <StatusBadge status="finished" />
                    <StatusBadge status="paused" />
                    <StatusBadge status="cancelled" />
                    <StatusBadge status="delayed" />
                    <StatusBadge status="rework" />
                  </div>
                </div>

                {/* StatusBadge Sizes */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tamanhos de StatusBadge</h4>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <StatusBadge status="production" size="sm" />
                      <span className="text-xs text-muted-foreground">sm</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <StatusBadge status="production" size="md" />
                      <span className="text-xs text-muted-foreground">md (default)</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <StatusBadge status="production" size="lg" />
                      <span className="text-xs text-muted-foreground">lg</span>
                    </div>
                  </div>
                </div>

                {/* StatusBadge with Animation */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">StatusBadge Animadas</h4>
                  <p className="text-xs text-muted-foreground">Prop <code className="text-primary">animated</code> ativa animações específicas por status</p>
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge status="ready" animated />
                    <StatusBadge status="production" animated />
                    <StatusBadge status="delayed" animated />
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Animações por status:</strong><br />
                      • <code className="text-primary">ready</code>: pulse suave (animate-pulse-soft)<br />
                      • <code className="text-primary">production</code>: streak de fogo (streak-fire)<br />
                      • <code className="text-primary">delayed</code>: streak de fogo (streak-fire)
                    </p>
                  </div>
                </div>

                {/* StatusBadge without Icon */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">StatusBadge sem Ícone</h4>
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge status="production" showIcon={false} />
                    <StatusBadge status="finished" showIcon={false} />
                    <StatusBadge status="delayed" showIcon={false} />
                  </div>
                </div>

                {/* StatusBadge Pop Animation */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Animação Pop Automática</h4>
                  <p className="text-xs text-muted-foreground">StatusBadge detecta mudanças de status e aplica <code className="text-primary">animate-pop</code> automaticamente</p>
                  <div className="p-3 rounded-lg bg-info/10 border border-info/30">
                    <p className="text-xs text-info">
                      Quando o status muda, a badge automaticamente executa uma animação pop para chamar atenção do usuário.
                    </p>
                  </div>
                </div>

                {/* Code Examples */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>

                  {/* Standard Badges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <CodeBlock
                      code={'<Badge variant="default">Label</Badge>'}
                      label="Default"
                    />
                    <CodeBlock
                      code={'<Badge variant="success">Sucesso</Badge>'}
                      label="Success"
                    />
                    <CodeBlock
                      code={'<Badge variant="destructive">Erro</Badge>'}
                      label="Destructive"
                    />
                  </div>

                  {/* Gamification Badges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CodeBlock
                      code={'<Badge variant="xp" animated>\n  <Sparkles className="h-3 w-3" />\n  +150 XP\n</Badge>'}
                      label="XP Badge"
                    />
                    <CodeBlock
                      code={'<Badge variant="gold" animated>\n  <Trophy className="h-3 w-3" />\n  Ouro\n</Badge>'}
                      label="Gold Badge"
                    />
                  </div>

                  {/* Status Badges - Expanded */}
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">StatusBadge Props</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <CodeBlock
                      code={'<StatusBadge status="production" />'}
                      label="Básico"
                    />
                    <CodeBlock
                      code={'<StatusBadge \n  status="production" \n  size="lg" \n/>'}
                      label="Com tamanho"
                    />
                    <CodeBlock
                      code={'<StatusBadge \n  status="production" \n  animated \n/>'}
                      label="Com animação"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CodeBlock
                      code={'<StatusBadge \n  status="finished" \n  showIcon={false} \n/>'}
                      label="Sem ícone"
                    />
                    <CodeBlock
                      code={'// Status disponíveis:\n// queue, ready, scheduled,\n// production, finished, paused,\n// cancelled, delayed, rework'}
                      label="Lista de status"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
    </>
  );
}
