import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Type } from 'lucide-react';

export function TypographySection() {
  return (
    <>
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  Família de Fontes
                </CardTitle>
                <CardDescription>Plus Jakarta Sans - fonte principal do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Display / Títulos</h4>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="font-display text-2xl font-bold">Plus Jakarta Sans</p>
                      <p className="text-sm text-muted-foreground">font-family: Plus Jakarta Sans, system-ui, sans-serif</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-display</code></p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Body / Texto</h4>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="font-sans text-2xl">Plus Jakarta Sans</p>
                      <p className="text-sm text-muted-foreground">font-family: Plus Jakarta Sans, system-ui, sans-serif</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-sans</code></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Font Weights */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Pesos de Fonte</CardTitle>
                <CardDescription>Variações de peso disponíveis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-2xl font-normal">Regular</p>
                      <p className="text-xs text-muted-foreground">font-weight: 400</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-normal</code></p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-2xl font-medium">Medium</p>
                      <p className="text-xs text-muted-foreground">font-weight: 500</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-medium</code></p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-2xl font-semibold">Semibold</p>
                      <p className="text-xs text-muted-foreground">font-weight: 600</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-semibold</code></p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-2xl font-bold">Bold</p>
                      <p className="text-xs text-muted-foreground">font-weight: 700</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-bold</code></p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-2xl font-extrabold">Extra Bold</p>
                    <p className="text-xs text-muted-foreground">font-weight: 800</p>
                    <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-extrabold</code></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Font Sizes */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Tamanhos de Fonte</CardTitle>
                <CardDescription>Escala tipográfica do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Classe</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Tamanho</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Exemplo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-xs</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">12px / 0.75rem</td>
                          <td className="py-3 px-4 text-xs">Texto extra pequeno</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-sm</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">14px / 0.875rem</td>
                          <td className="py-3 px-4 text-sm">Texto pequeno</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-base</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">16px / 1rem</td>
                          <td className="py-3 px-4 text-base">Texto base (padrão)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-lg</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">18px / 1.125rem</td>
                          <td className="py-3 px-4 text-lg">Texto grande</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">20px / 1.25rem</td>
                          <td className="py-3 px-4 text-xl">Texto XL</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-2xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">24px / 1.5rem</td>
                          <td className="py-3 px-4 text-2xl">Título 2XL</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-3xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">30px / 1.875rem</td>
                          <td className="py-3 px-4 text-3xl">Título 3XL</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-4xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">36px / 2.25rem</td>
                          <td className="py-3 px-4 text-4xl">Título 4XL</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-5xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">48px / 3rem</td>
                          <td className="py-3 px-4 text-5xl">Título 5XL</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Headings */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Hierarquia de Títulos</CardTitle>
                <CardDescription>Estrutura semântica de headings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight">Heading 1 - Principal</h1>
                    <p className="text-xs text-muted-foreground">text-4xl font-bold tracking-tight</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h2 className="text-3xl font-semibold tracking-tight">Heading 2 - Seção</h2>
                    <p className="text-xs text-muted-foreground">text-3xl font-semibold tracking-tight</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h3 className="text-2xl font-semibold">Heading 3 - Subseção</h3>
                    <p className="text-xs text-muted-foreground">text-2xl font-semibold</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h4 className="text-xl font-medium">Heading 4 - Card Title</h4>
                    <p className="text-xs text-muted-foreground">text-xl font-medium</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h5 className="text-lg font-medium">Heading 5 - Item Title</h5>
                    <p className="text-xs text-muted-foreground">text-lg font-medium</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h6 className="text-base font-medium">Heading 6 - Label</h6>
                    <p className="text-xs text-muted-foreground">text-base font-medium</p>
                  </div>

                  {/* Code Examples for Headings */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <CodeBlock
                        code={'<h1 className="text-4xl font-bold tracking-tight">\n  Título Principal\n</h1>'}
                        label="Heading 1"
                      />
                      <CodeBlock
                        code={'<h2 className="text-3xl font-semibold tracking-tight">\n  Título de Seção\n</h2>'}
                        label="Heading 2"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <CodeBlock
                        code={'<h3 className="text-2xl font-semibold">\n  Subseção\n</h3>'}
                        label="Heading 3"
                      />
                      <CodeBlock
                        code={'<h4 className="text-xl font-medium">\n  Card Title\n</h4>'}
                        label="Heading 4"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Text Styles */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Estilos de Texto</CardTitle>
                <CardDescription>Variações e efeitos especiais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Estilos Básicos</h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-foreground">Texto padrão (foreground)</p>
                        <p className="text-xs text-muted-foreground mt-1">text-foreground</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground">Texto secundário (muted)</p>
                        <p className="text-xs text-muted-foreground mt-1">text-muted-foreground</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-primary font-medium">Texto primário (destaque)</p>
                        <p className="text-xs text-muted-foreground mt-1">text-primary</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="italic">Texto em itálico</p>
                        <p className="text-xs text-muted-foreground mt-1">italic</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="underline underline-offset-4">Texto sublinhado</p>
                        <p className="text-xs text-muted-foreground mt-1">underline underline-offset-4</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="line-through text-muted-foreground">Texto riscado</p>
                        <p className="text-xs text-muted-foreground mt-1">line-through</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Efeitos Especiais</h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold gradient-text">Texto com Gradiente</p>
                        <p className="text-xs text-muted-foreground mt-1">gradient-text</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="uppercase tracking-widest text-sm font-semibold">Texto Uppercase</p>
                        <p className="text-xs text-muted-foreground mt-1">uppercase tracking-widest</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="tracking-tight text-xl font-bold">Tracking Tight</p>
                        <p className="text-xs text-muted-foreground mt-1">tracking-tight</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="tracking-wide">Tracking Wide</p>
                        <p className="text-xs text-muted-foreground mt-1">tracking-wide</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="leading-relaxed">Texto com line-height relaxado para melhor legibilidade em parágrafos longos.</p>
                        <p className="text-xs text-muted-foreground mt-1">leading-relaxed</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="truncate w-48">Texto muito longo que será truncado com ellipsis no final</p>
                        <p className="text-xs text-muted-foreground mt-1">truncate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code & Mono */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Código e Monospace</CardTitle>
                <CardDescription>Estilos para código e dados técnicos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Inline code:</p>
                      <p>Use a classe <code className="px-1.5 py-0.5 rounded bg-muted text-primary text-sm font-mono">.gradient-primary</code> para gradientes.</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Code block:</p>
                      <pre className="p-4 rounded-lg bg-card border text-sm font-mono overflow-x-auto">
{`const theme = {
  primary: "hsl(24, 95%, 48%)",
  secondary: "hsl(210, 100%, 50%)",
  accent: "hsl(280, 80%, 50%)"
};`}
                      </pre>
                    </div>
                  </div>

                  {/* Code Examples */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <CodeBlock
                        code={'<code className="px-1.5 py-0.5 rounded bg-muted text-primary text-sm font-mono">\n  .classe-exemplo\n</code>'}
                        label="Inline Code"
                      />
                      <CodeBlock
                        code={'<pre className="p-4 rounded-lg bg-card border text-sm font-mono overflow-x-auto">\n  {codeString}\n</pre>'}
                        label="Code Block"
                      />
                    </div>
                    <CodeBlock
                      code={'<p className="text-2xl font-bold gradient-text">\n  Texto com Gradiente\n</p>'}
                      label="Gradient Text"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
    </>
  );
}
