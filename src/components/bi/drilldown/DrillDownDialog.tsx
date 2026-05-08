import { useMemo, useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, FileText, Search, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";


interface DrillDownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  jobs: any[];
  onExport: (format: 'csv' | 'pdf') => void;
}

export function DrillDownDialog({ open, onOpenChange, title, jobs, onExport }: DrillDownDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-black/90 border-primary/30 backdrop-blur-2xl text-white">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle className="text-2xl font-display tracking-widest text-primary uppercase">
              {title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Lista detalhada de pedidos e métricas de execução para o segmento selecionado.
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 pr-8">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-2 bg-white/5 border-white/10 hover:bg-primary/20 text-xs text-white"
              onClick={() => onExport('csv')}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-2 bg-white/5 border-white/10 hover:bg-primary/20 text-xs text-white"
              onClick={() => onExport('pdf')}
            >
              <FileText className="h-3.5 w-3.5" /> PDF
            </Button>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-primary text-xs uppercase font-bold">OS</TableHead>
                  <TableHead className="text-primary text-xs uppercase font-bold">Produto</TableHead>
                  <TableHead className="text-primary text-xs uppercase font-bold text-center">Status</TableHead>
                  <TableHead className="text-primary text-xs uppercase font-bold text-center">Qtd</TableHead>
                  <TableHead className="text-primary text-xs uppercase font-bold text-right">Eficiência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length > 0 ? (
                  jobs.map((job: any) => (
                    <TableRow key={job.id} className="border-white/10 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => navigate(`/job/${job.id}`)}>
                      <TableCell className="font-mono text-sm">{job.order_number}</TableCell>
                      <TableCell className="text-xs">{job.product}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn(
                          "text-[10px] uppercase",
                          job.status === 'finished' ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/5" :
                          job.status === 'production' ? "text-blue-400 border-blue-400/30 bg-blue-400/5" :
                          "text-amber-400 border-amber-400/30 bg-amber-400/5"
                        )}>
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold">{job.quantity}</TableCell>
                      <TableCell className="text-right font-mono">
                        {job.efficiency}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      Nenhum pedido encontrado para este filtro.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
