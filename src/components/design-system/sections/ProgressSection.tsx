import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CodeBlock } from '@/components/ui/code-block';
import { TrendingUp, Check, AlertTriangle, X, Sparkles } from 'lucide-react';

export function ProgressSection() {
  return (
    <>
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Barras de Progresso
                </CardTitle>
                <CardDescription>Variantes com animações de gamificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Standard Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Padrão</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Default</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} />
                    </div>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">XP (Experiência)</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[hsl(var(--xp))]" />
                          Nível 12
                        </span>
                        <span>2,450 / 3,000 XP</span>
                      </div>
                      <Progress value={82} variant="xp" animated showGlow />
                    </div>
                  </div>
                </div>

                {/* Success Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sucesso</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-[hsl(var(--success))]" />
                          Concluído
                        </span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} variant="success" animated showGlow />
                    </div>
                  </div>
                </div>

                {/* Warning Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Atenção</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
                          Prazo próximo
                        </span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} variant="warning" animated />
                    </div>
                  </div>
                </div>

                {/* Destructive Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Crítico</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <X className="h-4 w-4 text-destructive" />
                          Capacidade excedida
                        </span>
                        <span>95%</span>
                      </div>
                      <Progress value={95} variant="destructive" animated showGlow />
                    </div>
                  </div>
                </div>

                {/* Code Examples */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CodeBlock
                      code={'<Progress value={65} />'}
                      label="Default"
                    />
                    <CodeBlock
                      code={'<Progress \n  value={82} \n  variant="xp" \n  animated \n  showGlow \n/>'}
                      label="XP com Animação e Glow"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CodeBlock
                      code={'<Progress \n  value={100} \n  variant="success" \n  animated \n  showGlow \n/>'}
                      label="Success"
                    />
                    <CodeBlock
                      code={'<Progress \n  value={75} \n  variant="warning" \n  animated \n/>'}
                      label="Warning"
                    />
                  </div>
                  <CodeBlock
                    code={'<Progress \n  value={95} \n  variant="destructive" \n  animated \n  showGlow \n/>'}
                    label="Destructive (Crítico)"
                  />
                </div>
              </CardContent>
            </Card>
    </>
  );
}
