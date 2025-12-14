import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Construction } from 'lucide-react';

export default function OperatorsPage() {
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
                  <p className="text-3xl font-bold">--</p>
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
                  <p className="text-3xl font-bold">--</p>
                  <p className="text-sm text-muted-foreground">Operadores Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
                <Construction className="h-8 w-8 text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Em Desenvolvimento</h3>
                <p className="text-muted-foreground mt-1 max-w-md">
                  A gestão de operadores será integrada com o Bitrix24 para sincronizar 
                  automaticamente a matriz de permissões operador-máquina.
                </p>
              </div>
              <Badge variant="secondary" className="mt-2">
                Aguardando integração Bitrix24
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
