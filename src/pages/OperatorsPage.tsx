import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserCheck, Phone, Calendar, Settings2, Search, X, UserPlus, Pencil } from 'lucide-react';
import { useOperators, OperatorWithProfile } from '@/hooks/useOperators';
import { useOperatorPresence } from '@/hooks/useOperatorPresence';
import { useOperatorMachines } from '@/hooks/useOperatorMachines';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { MachineAssignmentModal } from '@/components/operators/MachineAssignmentModal';
import { CreateOperatorModal } from '@/components/operators/CreateOperatorModal';
import { EditOperatorModal } from '@/components/operators/EditOperatorModal';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function OperatorsPage() {
  const { data: operators = [], isLoading } = useOperators();
  const { assignments } = useOperatorMachines();
  const { machines } = useSchedulingData();
  const { isOnline, onlineCount } = useOperatorPresence();
  const [selectedOperator, setSelectedOperator] = useState<OperatorWithProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editOperator, setEditOperator] = useState<OperatorWithProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [machineFilter, setMachineFilter] = useState<string>('all');

  

  const getAssignedMachineIds = (operatorId: string) => {
    return (assignments || []).filter(a => a.operator_id === operatorId).map(a => a.machine_id);
  };

  const getAssignedMachines = (operatorId: string) => {
    const machineIds = getAssignedMachineIds(operatorId);
    return machines.filter(m => machineIds.includes(m.id));
  };

  const filteredOperators = useMemo(() => {
    return operators.filter((operator) => {
      // Filter by name
      const nameMatch = !searchQuery || 
        (operator.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by assigned machine
      const machineMatch = machineFilter === 'all' || 
        getAssignedMachineIds(operator.user_id).includes(machineFilter);
      
      return nameMatch && machineMatch;
    });
  }, [operators, searchQuery, machineFilter, assignments]);

  const handleOpenAssignment = (operator: OperatorWithProfile) => {
    setSelectedOperator(operator);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (operator: OperatorWithProfile) => {
    setEditOperator(operator);
    setIsEditModalOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setMachineFilter('all');
  };

  const hasActiveFilters = searchQuery || machineFilter !== 'all';

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold gradient-text">Operadores</h1>
            <p className="text-muted-foreground">Gerencie os operadores e suas permissões de máquinas</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Operador
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <p className="text-3xl font-bold">{operators.length}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Total de Operadores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-success" />
                </div>
                <div>
                {isLoading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <p className="text-3xl font-bold">{onlineCount}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Online Agora</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Operadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={machineFilter} onValueChange={setMachineFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por máquina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as máquinas</SelectItem>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="outline" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Results count */}
            {hasActiveFilters && !isLoading && (
              <p className="text-sm text-muted-foreground">
                {filteredOperators.length} de {operators.length} operadores
              </p>
            )}

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border/50">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOperators.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? 'Nenhum operador encontrado com os filtros aplicados' : 'Nenhum operador cadastrado'}
                </p>
                {hasActiveFilters && (
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOperators.map((operator, index) => (
                  <div
                    key={operator.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/5 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={operator.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {operator.full_name
                            ? operator.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                            : 'OP'}
                        </AvatarFallback>
                      </Avatar>
                      <span 
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                          isOnline(operator.user_id) ? 'bg-success' : 'bg-muted-foreground/50'
                        }`}
                        title={isOnline(operator.user_id) ? 'Online' : 'Offline'}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {operator.full_name || 'Nome não informado'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {operator.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {operator.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Desde {format(new Date(operator.created_at), "MMM yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {getAssignedMachines(operator.user_id).length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {getAssignedMachines(operator.user_id).slice(0, 3).map((machine) => (
                            <TooltipProvider key={machine.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="secondary" className="text-xs cursor-default">
                                    {machine.code}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{machine.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                          {getAssignedMachines(operator.user_id).length > 3 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="text-xs cursor-default">
                                    +{getAssignedMachines(operator.user_id).length - 3}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {getAssignedMachines(operator.user_id)
                                      .slice(3)
                                      .map(m => m.name)
                                      .join(', ')}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Sem máquinas
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(operator)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAssignment(operator)}
                      >
                        <Settings2 className="h-4 w-4 mr-1" />
                        Atribuir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <MachineAssignmentModal
          operator={selectedOperator}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />

        <CreateOperatorModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />

        <EditOperatorModal
          operator={editOperator}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        />
      </div>
    </MainLayout>
  );
}
