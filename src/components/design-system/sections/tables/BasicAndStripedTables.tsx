import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Layers, LayoutGrid } from 'lucide-react';

const sampleData = [
  { id: "INV001", status: "Pago", method: "Cartão de Crédito", amount: "R$ 250,00" },
  { id: "INV002", status: "Pendente", method: "PayPal", amount: "R$ 150,00" },
  { id: "INV003", status: "Cancelado", method: "Transferência", amount: "R$ 350,00" },
  { id: "INV004", status: "Pago", method: "Cartão de Crédito", amount: "R$ 450,00" },
  { id: "INV005", status: "Pago", method: "PayPal", amount: "R$ 550,00" },
];

export function BasicTable() {
  return (
    <Card className="card-interactive card-shine">
      <CardHeader><CardTitle className="flex items-center gap-2"><LayoutGrid className="h-5 w-5 text-primary" />Tabela Básica</CardTitle><CardDescription>Tabela simples com caption e footer</CardDescription></CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Lista de faturas recentes</TableCaption>
          <TableHeader><TableRow><TableHead className="w-[100px]">Fatura</TableHead><TableHead>Status</TableHead><TableHead>Método</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
          <TableBody>{sampleData.map((invoice) => (<TableRow key={invoice.id}><TableCell className="font-medium">{invoice.id}</TableCell><TableCell>{invoice.status}</TableCell><TableCell>{invoice.method}</TableCell><TableCell className="text-right">{invoice.amount}</TableCell></TableRow>))}</TableBody>
          <TableFooter><TableRow><TableCell colSpan={3}>Total</TableCell><TableCell className="text-right">R$ 1.750,00</TableCell></TableRow></TableFooter>
        </Table>
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
          <CodeBlock label="Tabela Básica" code={`<Table>
  <TableCaption>Lista de faturas</TableCaption>
  <TableHeader><TableRow><TableHead>Fatura</TableHead>...</TableRow></TableHeader>
  <TableBody>{data.map(item => (<TableRow key={item.id}>...</TableRow>))}</TableBody>
  <TableFooter><TableRow><TableCell colSpan={3}>Total</TableCell><TableCell>R$ 1.750,00</TableCell></TableRow></TableFooter>
</Table>`} />
        </div>
      </CardContent>
    </Card>
  );
}

export function StripedTable() {
  return (
    <Card className="card-interactive">
      <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" />Tabela com Linhas Alternadas</CardTitle><CardDescription>Estilo zebrado para melhor legibilidade</CardDescription></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Fatura</TableHead><TableHead>Status</TableHead><TableHead>Método</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
          <TableBody>{sampleData.map((invoice, index) => (<TableRow key={invoice.id} className={index % 2 === 0 ? "bg-muted/50" : ""}><TableCell className="font-medium">{invoice.id}</TableCell><TableCell>{invoice.status}</TableCell><TableCell>{invoice.method}</TableCell><TableCell className="text-right">{invoice.amount}</TableCell></TableRow>))}</TableBody>
        </Table>
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
          <CodeBlock label="Tabela Zebrada" code={`<TableRow className={index % 2 === 0 ? "bg-muted/50" : ""}>...</TableRow>`} />
        </div>
      </CardContent>
    </Card>
  );
}
