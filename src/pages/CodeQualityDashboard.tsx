import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube2, 
  FileCode, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  GitBranch,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useCodeQualityMetrics } from '@/hooks/useCodeQualityMetrics';
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = {
  unit: 'hsl(var(--success))',
  integration: 'hsl(var(--primary))',
  e2e: 'hsl(var(--warning))',
  low: 'hsl(var(--success))',
  medium: 'hsl(var(--warning))',
  high: 'hsl(var(--destructive))',
};

export default function CodeQualityDashboard() {
  const metrics = useCodeQualityMetrics();

  const testDistributionData = [
    { name: 'Unitários', value: metrics.testsByCategory.unit, color: COLORS.unit },
    { name: 'Integração', value: metrics.testsByCategory.integration, color: COLORS.integration },
    { name: 'E2E', value: metrics.testsByCategory.e2e, color: COLORS.e2e },
  ];

  const complexityData = [
    { name: 'Baixa', value: metrics.complexityDistribution.low, color: COLORS.low },
    { name: 'Média', value: metrics.complexityDistribution.medium, color: COLORS.medium },
    { name: 'Alta', value: metrics.complexityDistribution.high, color: COLORS.high },
  ];

  const coverageData = [
    { name: 'Hooks', covered: metrics.hooksCovered, total: metrics.hooksTotal },
    { name: 'Componentes', covered: metrics.componentsWithTests, total: metrics.componentsWithTests + metrics.componentsWithoutTests },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Qualidade de Código
            </h1>
            <p className="text-muted-foreground mt-1">
              Métricas de testes, cobertura e complexidade
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            <GitBranch className="h-3 w-3 mr-1" />
            main
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Testes</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.totalTests}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TestTube2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <Badge variant="secondary" className="bg-success/10 text-success">
                  {metrics.testsByCategory.unit} unit
                </Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {metrics.testsByCategory.integration} int
                </Badge>
                <Badge variant="secondary" className="bg-warning/10 text-warning">
                  {metrics.testsByCategory.e2e} e2e
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cobertura Estimada</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.coverageEstimate}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>
              <Progress value={metrics.coverageEstimate} className="mt-4 h-2" />
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Arquivos de Teste</p>
                  <p className="text-3xl font-bold text-foreground">{metrics.testFiles.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileCode className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Distribuídos em unit, integration e e2e
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hooks Testados</p>
                  <p className="text-3xl font-bold text-foreground">
                    {metrics.hooksCovered}/{metrics.hooksTotal}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-warning" />
                </div>
              </div>
              <Progress 
                value={(metrics.hooksCovered / metrics.hooksTotal) * 100} 
                className="mt-4 h-2" 
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tests" className="gap-2">
              <TestTube2 className="h-4 w-4" />
              Testes
            </TabsTrigger>
            <TabsTrigger value="coverage" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Cobertura
            </TabsTrigger>
            <TabsTrigger value="complexity" className="gap-2">
              <PieChart className="h-4 w-4" />
              Complexidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Test Distribution Chart */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição de Testes</CardTitle>
                  <CardDescription>Por categoria de teste</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={testDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {testDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Test Files List */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Arquivos de Teste</CardTitle>
                  <CardDescription>Lista completa de arquivos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {metrics.testFiles.map((file) => (
                      <div 
                        key={file.path}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-mono">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary"
                            className={
                              file.category === 'unit' 
                                ? 'bg-success/10 text-success' 
                                : file.category === 'integration'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-warning/10 text-warning'
                            }
                          >
                            {file.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {file.testCount} tests
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Coverage Bar Chart */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Cobertura por Categoria</CardTitle>
                  <CardDescription>Hooks e componentes testados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={coverageData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="covered" name="Testados" fill="hsl(var(--success))" />
                        <Bar dataKey="total" name="Total" fill="hsl(var(--muted))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Coverage Details */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes de Cobertura</CardTitle>
                  <CardDescription>Status de testes por área</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Componentes UI</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm">{metrics.componentsWithTests} testados</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Componentes sem teste</span>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span className="text-sm">{metrics.componentsWithoutTests} pendentes</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hooks customizados</span>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="text-sm">
                          {metrics.hooksCovered}/{metrics.hooksTotal} ({Math.round((metrics.hooksCovered / metrics.hooksTotal) * 100)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-medium mb-2">Recomendações</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Adicionar testes para páginas principais</li>
                      <li>• Aumentar cobertura de hooks críticos</li>
                      <li>• Implementar mais testes E2E</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="complexity" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Complexity Distribution */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição de Complexidade</CardTitle>
                  <CardDescription>Análise de componentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={complexityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {complexityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* High Complexity Components */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Componentes de Alta Complexidade</CardTitle>
                  <CardDescription>Candidatos a refatoração</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {metrics.testFiles.length > 0 && (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <div>
                            <p className="font-medium text-sm">TechnicalAssistant</p>
                            <p className="text-xs text-muted-foreground">~280 linhas</p>
                          </div>
                          <Badge variant="destructive">Alta</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <div>
                            <p className="font-medium text-sm">Index (Dashboard)</p>
                            <p className="text-xs text-muted-foreground">~250 linhas</p>
                          </div>
                          <Badge variant="destructive">Alta</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <div>
                            <p className="font-medium text-sm">JobDetailsModal</p>
                            <p className="text-xs text-muted-foreground">~220 linhas</p>
                          </div>
                          <Badge variant="destructive">Alta</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                          <div>
                            <p className="font-medium text-sm">DailyCalendar</p>
                            <p className="text-xs text-muted-foreground">~200 linhas</p>
                          </div>
                          <Badge variant="warning">Média</Badge>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
