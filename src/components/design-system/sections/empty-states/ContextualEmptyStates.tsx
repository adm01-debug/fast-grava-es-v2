import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/ui/code-block';
import { Layers, TableIcon, CheckCircle, Upload, FolderOpen, Filter, X } from 'lucide-react';

export function ContextualEmptyStates() {
  return (
    <Card className="card-interactive card-shine">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" />Estados Contextuais</CardTitle>
        <CardDescription>Estados vazios específicos para diferentes contextos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/30 p-3 border-b">
              <div className="flex gap-4">
                <span className="text-xs font-medium text-muted-foreground w-20">ID</span>
                <span className="text-xs font-medium text-muted-foreground flex-1">Nome</span>
                <span className="text-xs font-medium text-muted-foreground w-24">Status</span>
              </div>
            </div>
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
              <TableIcon className="h-10 w-10 text-muted-foreground/50" />
              <div><p className="text-sm font-medium">Tabela vazia</p><p className="text-xs text-muted-foreground">Nenhum registro encontrado</p></div>
            </div>
          </div>
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between"><h4 className="text-sm font-medium">Alertas Recentes</h4><Badge variant="secondary">0</Badge></div>
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle className="h-10 w-10 text-success/50" />
              <div><p className="text-sm font-medium">Nenhum alerta</p><p className="text-xs text-muted-foreground">Sistema funcionando normalmente</p></div>
            </div>
          </div>
          <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><Upload className="h-6 w-6 text-muted-foreground" /></div>
            <div className="space-y-1"><p className="text-sm font-medium">Arraste arquivos aqui</p><p className="text-xs text-muted-foreground">ou clique para selecionar</p></div>
            <Button variant="outline" size="sm"><FolderOpen className="h-4 w-4" />Procurar</Button>
          </div>
          <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center"><Filter className="h-6 w-6 text-warning" /></div>
            <div className="space-y-1"><p className="text-sm font-medium">Filtros muito restritivos</p><p className="text-xs text-muted-foreground">Tente ajustar os filtros aplicados</p></div>
            <Button variant="ghost" size="sm"><X className="h-4 w-4" />Limpar Filtros</Button>
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={`<div className="border rounded-lg overflow-hidden">
  <div className="bg-muted/30 p-3 border-b">...</div>
  <div className="p-12 flex flex-col items-center text-center space-y-3">
    <TableIcon className="h-10 w-10 text-muted-foreground/50" />
    <p className="text-sm font-medium">Tabela vazia</p>
  </div>
</div>`} label="Tabela Vazia" />
            <CodeBlock code={`<div className="border rounded-lg p-6 flex flex-col items-center text-center space-y-4 border-dashed">
  <Upload className="h-6 w-6 text-muted-foreground" />
  <p className="text-sm font-medium">Arraste arquivos aqui</p>
  <Button variant="outline" size="sm">Procurar</Button>
</div>`} label="Upload Dropzone" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
