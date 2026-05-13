import { useState, useMemo } from 'react';
import { useFuseSearch } from '@/hooks/useFuseSearch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Search, TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react';
import { MachineOEE, getOEEColor } from '@/hooks/useOEE';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MachineTPMPanel } from '@/components/tpm/MachineTPMPanel';
import { MachineReliabilityTab } from '@/components/machines/MachineReliabilityTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OEEMachineTableProps {
  machines: MachineOEE[];
}

type SortField = 'oee' | 'availability' | 'performance' | 'quality' | 'machineName';
type SortDirection = 'asc' | 'desc';

import { memo } from 'react';

export const OEEMachineTable = memo(function OEEMachineTable({ machines }: OEEMachineTableProps) {

  const [search, setSearch] = useState('');
  const [techniqueFilter, setTechniqueFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('oee');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const techniques = [...new Set(machines.map(m => m.techniqueId))];
  const techniqueNames = machines.reduce((acc, m) => {
    acc[m.techniqueId] = m.techniqueName;
    return acc;
  }, {} as Record<string, string>);

  // Apply Fuse.js fuzzy search for machines
  const fuseSearchedMachines = useFuseSearch(machines, search, {
    keys: ['machineName', 'machineCode'],
    threshold: 0.3,
  });

  const filteredMachines = useMemo(() => {
    return fuseSearchedMachines
      .filter(m => {
        const matchesTechnique = techniqueFilter === 'all' || m.techniqueId === techniqueFilter;
        return matchesTechnique;
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const dir = sortDirection === 'asc' ? 1 : -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * dir;
        }
        return ((aVal as number) - (bVal as number)) * dir;
      });
  }, [fuseSearchedMachines, techniqueFilter, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getOEEBadgeVariant = (oeeClass: MachineOEE['oeeClass']) => {
    switch (oeeClass) {
      case 'world-class': return 'default';
      case 'excellent': return 'secondary';
      case 'good': return 'outline';
      case 'acceptable': return 'outline';
      case 'poor': return 'destructive';
    }
  };

  const getOEEClassLabel = (oeeClass: MachineOEE['oeeClass']) => {
    switch (oeeClass) {
      case 'world-class': return 'World Class';
      case 'excellent': return 'Excelente';
      case 'good': return 'Bom';
      case 'acceptable': return 'Aceitável';
      case 'poor': return 'Crítico';
    }
  };

  const renderMetricCell = (value: number, benchmark: number = 85) => {
    const color = getOEEColor(value);
    const trend = value >= benchmark ? 'up' : value >= benchmark - 10 ? 'stable' : 'down';

    // Using CSS custom property for progress color
    const progressStyle: React.CSSProperties & { '--progress-color'?: string } = {
      '--progress-color': color
    };

    return (
      <div className="flex items-center gap-2">
        <Progress
          value={value}
          className="h-2 w-16"
          style={progressStyle}
        />
        <span className="text-sm font-medium w-12" style={{ color }}>
          {value.toFixed(1)}%
        </span>
        {trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
        {trend === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
        {trend === 'stable' && <Minus className="h-3 w-3 text-muted-foreground" />}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>OEE por Máquina</span>
          <span className="text-sm font-normal text-muted-foreground">
            {filteredMachines.length} de {machines.length} máquinas
          </span>
        </CardTitle>

        {/* Filters */}
        <div className="flex gap-3 mt-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar máquina..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={techniqueFilter} onValueChange={setTechniqueFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Técnica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Técnicas</SelectItem>
              {techniques.map(t => (
                <SelectItem key={t} value={t}>{techniqueNames[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('machineName')}>
                    Máquina
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Técnica</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('availability')}>
                    Disponibilidade
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('performance')}>
                    Performance
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('quality')}>
                    Qualidade
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('oee')}>
                    OEE
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Classificação</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhuma máquina encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredMachines.map(machine => (
                  <TableRow key={machine.machineId} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{machine.machineName}</div>
                        <div className="text-xs text-muted-foreground">{machine.machineCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: machine.techniqueColor,
                          color: machine.techniqueColor
                        }}
                      >
                        {machine.techniqueName}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderMetricCell(machine.availability)}</TableCell>
                    <TableCell>{renderMetricCell(machine.performance)}</TableCell>
                    <TableCell>{renderMetricCell(machine.quality, 95)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-lg font-bold"
                          style={{ color: getOEEColor(machine.oee) }}
                        >
                          {machine.oee.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{machine.completedJobs}</span>
                        <span className="text-muted-foreground"> finalizados</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getOEEBadgeVariant(machine.oeeClass)}>
                        {getOEEClassLabel(machine.oeeClass)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedMachineId(machine.machineId);
                          setDetailsOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Detalhes da Máquina</DialogTitle>
            <DialogDescription>Dados de performance e manutenção</DialogDescription>
          </DialogHeader>

          {selectedMachineId && (
            <Tabs defaultValue="tpm" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tpm">Manutenção (TPM)</TabsTrigger>
                <TabsTrigger value="reliability">Confiabilidade</TabsTrigger>
              </TabsList>
              <TabsContent value="tpm" className="flex-1 overflow-auto pt-4">
                <MachineTPMPanel machineId={selectedMachineId} />
              </TabsContent>
              <TabsContent value="reliability" className="flex-1 overflow-auto pt-4">
                <MachineReliabilityTab machineId={selectedMachineId} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
});
