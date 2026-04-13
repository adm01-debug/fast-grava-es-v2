import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/ui/code-block';
import { StatusBadge } from '@/components/ui/status-badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ChevronRight, Edit, Eye, HelpCircle, Layers, LayoutGrid, Minimize, MousePointer2, Settings, Tag, Trash2 } from 'lucide-react';

export function TablesSection() {
  const sampleData = [
    { id: "INV001", status: "Pago", method: "Cartão de Crédito", amount: "R$ 250,00" },
    { id: "INV002", status: "Pendente", method: "PayPal", amount: "R$ 150,00" },
    { id: "INV003", status: "Cancelado", method: "Transferência", amount: "R$ 350,00" },
    { id: "INV004", status: "Pago", method: "Cartão de Crédito", amount: "R$ 450,00" },
    { id: "INV005", status: "Pago", method: "PayPal", amount: "R$ 550,00" },
  ];

  const jobsData = [
    { order: "ORD-001", client: "Cliente Alpha", product: "Camiseta", technique: "Serigrafia", status: "production", priority: "high" },
    { order: "ORD-002", client: "Cliente Beta", product: "Caneca", technique: "Sublimação", status: "queue", priority: "medium" },
    { order: "ORD-003", client: "Cliente Gamma", product: "Adesivo", technique: "Vinil", status: "finished", priority: "low" },
    { order: "ORD-004", client: "Cliente Delta", product: "Boné", technique: "Bordado", status: "ready", priority: "urgent" },
    { order: "ORD-005", client: "Cliente Epsilon", product: "Squeeze", technique: "Laser", status: "delayed", priority: "high" },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      production: { label: "Em Produção", variant: "default" },
      queue: { label: "Na Fila", variant: "secondary" },
      finished: { label: "Finalizado", variant: "outline" },
      ready: { label: "Pronto", variant: "default" },
      delayed: { label: "Atrasado", variant: "destructive" },
    };
    const { label, variant } = statusMap[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; className: string }> = {
      urgent: { label: "Urgente", className: "bg-destructive text-destructive-foreground" },
      high: { label: "Alta", className: "bg-orange-500 text-white" },
      medium: { label: "Média", className: "bg-yellow-500 text-black" },
      low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
    };
    const { label, className } = priorityMap[priority] || { label: priority, className: "" };
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Basic Table */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Tabela Básica
          </CardTitle>
          <CardDescription>Tabela simples com caption e footer</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Lista de faturas recentes</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Fatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">R$ 1.750,00</TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tabela Básica"
              code={`<Table>
  <TableCaption>Lista de faturas</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Fatura</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Método</TableHead>
      <TableHead className="text-right">Valor</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.id}</TableCell>
        <TableCell>{item.status}</TableCell>
        <TableCell>{item.method}</TableCell>
        <TableCell className="text-right">{item.amount}</TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={3}>Total</TableCell>
      <TableCell className="text-right">R$ 1.750,00</TableCell>
    </TableRow>
  </TableFooter>
</Table>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Striped Table */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Tabela com Linhas Alternadas
          </CardTitle>
          <CardDescription>Estilo zebrado para melhor legibilidade</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((invoice, index) => (
                <TableRow key={invoice.id} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tabela Zebrada"
              code={`{/* Aplique bg-muted/50 em linhas alternadas */}
<TableBody>
  {data.map((item, index) => (
    <TableRow 
      key={item.id} 
      className={index % 2 === 0 ? "bg-muted/50" : ""}
    >
      <TableCell>{item.id}</TableCell>
      ...
    </TableRow>
  ))}
</TableBody>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table with Badges */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Tabela com Badges e Status
          </CardTitle>
          <CardDescription>Tabela estilizada com badges coloridos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Técnica</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobsData.map((job) => (
                <TableRow key={job.order}>
                  <TableCell className="font-medium">{job.order}</TableCell>
                  <TableCell>{job.client}</TableCell>
                  <TableCell>{job.product}</TableCell>
                  <TableCell>{job.technique}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>{getPriorityBadge(job.priority)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tabela com Badges"
              code={`{/* Helper function para badges de status */}
const getStatusBadge = (status: string) => {
  const statusMap = {
    production: { label: "Em Produção", variant: "default" },
    queue: { label: "Na Fila", variant: "secondary" },
    finished: { label: "Finalizado", variant: "outline" },
    delayed: { label: "Atrasado", variant: "destructive" },
  };
  const { label, variant } = statusMap[status];
  return <Badge variant={variant}>{label}</Badge>;
};

{/* Na tabela */}
<TableCell>{getStatusBadge(job.status)}</TableCell>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table with Actions */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Tabela com Ações
          </CardTitle>
          <CardDescription>Tabela com botões de ação em cada linha</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === "Pago" ? "default" : invoice.status === "Pendente" ? "secondary" : "destructive"}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tabela com Ações"
              code={`<TableHead className="text-center">Ações</TableHead>

<TableCell className="text-center">
  <div className="flex items-center justify-center gap-2">
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Eye className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Edit className="h-4 w-4" />
    </Button>
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</TableCell>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Compact Table */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Minimize className="h-5 w-5 text-primary" />
            Tabela Compacta
          </CardTitle>
          <CardDescription>Menor padding para visualização densa</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-2">Fatura</TableHead>
                <TableHead className="py-2">Status</TableHead>
                <TableHead className="py-2">Método</TableHead>
                <TableHead className="py-2 text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="py-2 font-medium">{invoice.id}</TableCell>
                  <TableCell className="py-2">{invoice.status}</TableCell>
                  <TableCell className="py-2">{invoice.method}</TableCell>
                  <TableCell className="py-2 text-right">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tabela com Seleção"
              code={`<TableHeader>
  <TableRow>
    <TableHead className="w-[50px]">
      <Checkbox 
        checked={allSelected}
        onCheckedChange={handleSelectAll}
      />
    </TableHead>
    ...
  </TableRow>
</TableHeader>

<TableBody>
  {data.map((item) => (
    <TableRow 
      key={item.id} 
      className="cursor-pointer"
      data-state={selected.includes(item.id) ? "selected" : undefined}
    >
      <TableCell>
        <Checkbox 
          checked={selected.includes(item.id)}
          onCheckedChange={() => handleSelect(item.id)}
        />
      </TableCell>
      ...
    </TableRow>
  ))}
</TableBody>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Hoverable Table with Selection */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer2 className="h-5 w-5 text-primary" />
            Tabela com Seleção
          </CardTitle>
          <CardDescription>Linhas selecionáveis com checkboxes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox />
                </TableHead>
                <TableHead>Fatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((invoice, index) => (
                <TableRow key={invoice.id} className="cursor-pointer" data-state={index === 1 ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox checked={index === 1} />
                  </TableCell>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Table with Pagination */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-primary" />
            Tabela com Paginação
          </CardTitle>
          <CardDescription>Navegação entre páginas de dados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.slice(0, 3).map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Paginação"
              code={`<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card className="card-interactive border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Guia de Uso
          </CardTitle>
          <CardDescription>Quando usar cada estilo de tabela</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tabela Básica</h4>
              <p className="text-xs text-muted-foreground">Listas simples de dados sem muita interação.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tabela Zebrada</h4>
              <p className="text-xs text-muted-foreground">Tabelas com muitas linhas para melhor legibilidade.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tabela com Badges</h4>
              <p className="text-xs text-muted-foreground">Quando há status ou categorias para destacar.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tabela com Ações</h4>
              <p className="text-xs text-muted-foreground">Quando cada linha requer operações CRUD.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tabela Compacta</h4>
              <p className="text-xs text-muted-foreground">Para exibir muitos dados em espaço limitado.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tabela com Seleção</h4>
              <p className="text-xs text-muted-foreground">Para ações em lote (excluir, exportar, etc).</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
