import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ChevronRight, File, FileText, Folder, Home } from 'lucide-react';

export function BreadcrumbExamples() {
  return (
    <Card className="card-interactive card-shine">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ChevronRight className="h-5 w-5 text-primary" />Breadcrumbs</CardTitle>
        <CardDescription>Navegação hierárquica para mostrar localização do usuário</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Breadcrumb Básico</h4>
          <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="#">Documentos</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Configurações</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Com Ícones</h4>
          <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#" className="flex items-center gap-1"><Home className="h-4 w-4" />Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="#" className="flex items-center gap-1"><Folder className="h-4 w-4" />Projetos</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="#" className="flex items-center gap-1"><FileText className="h-4 w-4" />Relatórios</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage className="flex items-center gap-1"><File className="h-4 w-4" />Documento.pdf</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        </div>
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
          <CodeBlock label="Breadcrumb" code={`<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbPage>Página Atual</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`} />
        </div>
      </CardContent>
    </Card>
  );
}
