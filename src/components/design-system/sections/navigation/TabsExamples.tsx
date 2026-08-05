import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LayoutGrid, Settings } from 'lucide-react';

export function TabsExamples() {
  return (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><LayoutGrid className="h-5 w-5 text-primary" />Tabs</CardTitle>
        <CardDescription>Navegação por abas para organização de conteúdo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tabs Padrão</h4>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList><TabsTrigger value="tab1">Conta</TabsTrigger><TabsTrigger value="tab2">Senha</TabsTrigger><TabsTrigger value="tab3">Notificações</TabsTrigger></TabsList>
            <TabsContent value="tab1" className="p-4 border rounded-lg mt-2"><p className="text-sm text-muted-foreground">Conteúdo da aba Conta</p></TabsContent>
            <TabsContent value="tab2" className="p-4 border rounded-lg mt-2"><p className="text-sm text-muted-foreground">Conteúdo da aba Senha</p></TabsContent>
            <TabsContent value="tab3" className="p-4 border rounded-lg mt-2"><p className="text-sm text-muted-foreground">Conteúdo da aba Notificações</p></TabsContent>
          </Tabs>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tabs com Ícones</h4>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" />Visão Geral</TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2"><BarChart className="h-4 w-4" />Análises</TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2"><Settings className="h-4 w-4" />Configurações</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="p-4 border rounded-lg mt-2"><p className="text-sm text-muted-foreground">Visão geral do dashboard</p></TabsContent>
            <TabsContent value="analytics" className="p-4 border rounded-lg mt-2"><p className="text-sm text-muted-foreground">Dados analíticos</p></TabsContent>
            <TabsContent value="settings" className="p-4 border rounded-lg mt-2"><p className="text-sm text-muted-foreground">Configurações do sistema</p></TabsContent>
          </Tabs>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tabs com Gradiente</h4>
          <Tabs defaultValue="home" className="w-full">
            <TabsList className="flex flex-wrap gap-2 h-auto p-1">
              {['Home', 'Produtos', 'Pedidos', 'Clientes'].map(t => (
                <TabsTrigger key={t} value={t.toLowerCase()} className="data-[state=active]:gradient-primary data-[state=active]:text-white">{t}</TabsTrigger>
              ))}
            </TabsList>
            {['home', 'produtos', 'pedidos', 'clientes'].map(t => (
              <TabsContent key={t} value={t} className="p-4 border rounded-lg mt-2"><p className="text-sm text-muted-foreground">Conteúdo de {t}</p></TabsContent>
            ))}
          </Tabs>
        </div>
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
          <CodeBlock label="Tabs" code={`<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Aba 1</TabsTrigger>
    <TabsTrigger value="tab2">Aba 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Conteúdo</TabsContent>
</Tabs>`} />
        </div>
      </CardContent>
    </Card>
  );
}
