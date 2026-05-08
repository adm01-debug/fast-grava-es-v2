import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, FileSpreadsheet, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LossesTableProps {
  jobs: any[];
  onExport: (format: 'csv' | 'pdf', type: string) => void;
}

export function LossesTable({ jobs, onExport }: LossesTableProps) {
  const navigate = useNavigate();

  return (
    <Card className="bg-black/40 border-primary/20 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-3">
          <Package className="h-5 w-5 text-primary" />
          <span className="font-display tracking-wider uppercase">Métricas de Perda por Pedido</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => onExport('csv', 'Perdas_Por_Pedido')}
          >
            <FileSpreadsheet className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => onExport('pdf', 'Perdas_Por_Pedido')}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs uppercase tracking-tighter">OS / Produto</TableHead>
                <TableHead className="text-center text-muted-foreground text-xs uppercase tracking-tighter">Perdas</TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-tighter">Motivo</TableHead>
                <TableHead className="text-right text-muted-foreground text-xs uppercase tracking-tighter">Custo Est.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length > 0 ? (
                jobs.map((job: any) => (
                  <TableRow key={job.id} className="border-white/5 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => navigate(`/job/${job.id}`)}>
                    <TableCell>
                      <div className="font-medium text-sm">{job.order_number || `OS-${job.id.slice(0, 5)}`}</div>
                      <div className="text-[10px] text-muted-foreground">{job.product_name || 'Produto'}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-rose-500 border-rose-500/30 bg-rose-500/5">
                        {job.lost_pieces} pcs
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-muted-foreground">
                        {job.loss_reason || 'Perda na Produção'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      R$ {(job.lost_pieces * 15.5).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma perda registrada</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
