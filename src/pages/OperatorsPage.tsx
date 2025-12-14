import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserCheck, Phone, Calendar } from 'lucide-react';
import { useOperators } from '@/hooks/useOperators';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function OperatorsPage() {
  const { data: operators = [], isLoading } = useOperators();

  const activeOperators = operators.length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold gradient-text">Operadores</h1>
          <p className="text-muted-foreground">Gerencie os operadores e suas permissões de máquinas</p>
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
                    <p className="text-3xl font-bold">{activeOperators}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Operadores Ativos</p>
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
          <CardContent>
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
            ) : operators.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum operador cadastrado</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Operadores aparecerão aqui quando forem registrados no sistema
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {operators.map((operator, index) => (
                  <div
                    key={operator.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/5 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={operator.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {operator.full_name
                          ? operator.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                          : 'OP'}
                      </AvatarFallback>
                    </Avatar>
                    
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

                    <Badge variant="secondary" className="shrink-0">
                      Operador
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
