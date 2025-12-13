import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  RefreshCw, 
  ArrowRight, 
  Download, 
  Save, 
  Settings2, 
  FolderOpen,
  Loader2,
  Check,
  AlertTriangle,
  Info,
  Layers,
  Database,
  Link2
} from 'lucide-react';
import { Bitrix24SyncPanel } from '@/components/integrations/Bitrix24SyncPanel';
import { Bitrix24SyncHistory } from '@/components/integrations/Bitrix24SyncHistory';
import { useToast } from '@/hooks/use-toast';

interface FieldInfo {
  type: string;
  isRequired: boolean;
  isReadOnly: boolean;
  isImmutable: boolean;
  isMultiple: boolean;
  title: string;
  formLabel?: string;
  listLabel?: string;
}

interface FieldMapping {
  [key: string]: string[];
}

interface Category {
  ID: string;
  NAME: string;
  SORT: string;
}

const JOB_FIELDS = [
  { id: 'client', label: 'Cliente', description: 'Nome do cliente' },
  { id: 'product', label: 'Produto', description: 'Descrição do produto' },
  { id: 'quantity', label: 'Quantidade', description: 'Quantidade de peças' },
  { id: 'technique_id', label: 'Técnica', description: 'Tipo de gravação/personalização' },
  { id: 'priority', label: 'Prioridade', description: 'Nível de urgência' },
  { id: 'scheduled_date', label: 'Data Agendada', description: 'Data prevista para produção' },
  { id: 'gravure_color', label: 'Cor da Gravura', description: 'Cor a ser aplicada' },
  { id: 'notes', label: 'Observações', description: 'Notas adicionais' },
  { id: 'estimated_duration', label: 'Duração Estimada', description: 'Tempo em minutos' },
];

const Bitrix24ConfigPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bitrixFields, setBitrixFields] = useState<Record<string, FieldInfo>>({});
  const [currentMapping, setCurrentMapping] = useState<FieldMapping>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [techniqueMapping, setTechniqueMapping] = useState<Record<string, string>>({});
  const [priorityMapping, setPriorityMapping] = useState<Record<string, string>>({});
  const [stageMapping, setStageMapping] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const callBitrixSync = async (action: string): Promise<any> => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const url = `https://${projectId}.supabase.co/functions/v1/bitrix24-sync?action=${action}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  };

  const fetchBitrixFields = async () => {
    setIsLoading(true);
    try {
      const result = await callBitrixSync('fields');
      setBitrixFields(result.customFields || {});
      setCurrentMapping(result.currentMapping || {});
      setTechniqueMapping(result.techniqueMapping || {});
      setPriorityMapping(result.priorityMapping || {});
      setStageMapping(result.stageMapping || {});
      
      toast({
        title: 'Campos carregados',
        description: `${result.totalCustomFields || 0} campos personalizados encontrados.`
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar campos',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMapping = async () => {
    setIsLoading(true);
    try {
      const result = await callBitrixSync('mapping');
      setCurrentMapping(result.fieldMapping || {});
      setTechniqueMapping(result.techniqueMapping || {});
      setPriorityMapping(result.priorityMapping || {});
      setStageMapping(result.stageToStatus || {});
    } catch (error: any) {
      console.error('Error fetching mapping:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMapping();
  }, []);

  const getMappedFields = (jobField: string): string[] => {
    return currentMapping[jobField] || [];
  };

  const getFieldTitle = (fieldKey: string): string => {
    const field = bitrixFields[fieldKey];
    return field?.title || field?.formLabel || fieldKey;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <Settings2 className="h-7 w-7 text-primary" />
              Configuração Bitrix24
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure a integração, mapeamento de campos e categorias de deals
            </p>
          </div>
        </div>

        {/* Connection Panel */}
        <Bitrix24SyncPanel />

        {/* Tabs */}
        <Tabs defaultValue="mapping" className="space-y-4">
          <TabsList className="bg-muted/30 border border-border/50">
            <TabsTrigger value="mapping" className="gap-2">
              <Link2 className="h-4 w-4" />
              Mapeamento de Campos
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="values" className="gap-2">
              <Layers className="h-4 w-4" />
              Mapeamento de Valores
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Database className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Field Mapping Tab */}
          <TabsContent value="mapping" className="space-y-4">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-primary" />
                      Mapeamento de Campos Personalizados
                    </CardTitle>
                    <CardDescription>
                      Configure quais campos UF_CRM_* do Bitrix24 correspondem aos campos do sistema
                    </CardDescription>
                  </div>
                  <Button onClick={fetchBitrixFields} disabled={isLoading} className="gap-2">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Carregar Campos do Bitrix
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 bg-blue-500/10 border-blue-500/30">
                  <Info className="h-4 w-4 text-blue-400" />
                  <AlertTitle className="text-blue-400">Como funciona o mapeamento</AlertTitle>
                  <AlertDescription className="text-blue-300/80">
                    Cada campo do sistema pode mapear para múltiplos campos UF_CRM_* do Bitrix24. 
                    O primeiro campo encontrado com valor será utilizado. Para alterar o mapeamento,
                    é necessário editar a Edge Function.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {JOB_FIELDS.map((jobField) => (
                    <div key={jobField.id} className="p-4 rounded-lg bg-muted/20 border border-border/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{jobField.label}</span>
                            <Badge variant="outline" className="text-xs">
                              {jobField.id}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{jobField.description}</p>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">Campos Bitrix:</span>
                            {getMappedFields(jobField.id).length > 0 ? (
                              getMappedFields(jobField.id).map((field, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {getFieldTitle(field) || field}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-500/30">
                                Não configurado
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground mt-2" />
                      </div>
                    </div>
                  ))}
                </div>

                {Object.keys(bitrixFields).length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Campos Disponíveis no Bitrix24</h4>
                      <ScrollArea className="h-64 rounded-md border border-border/30 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {Object.entries(bitrixFields).map(([key, field]) => (
                            <div key={key} className="p-2 rounded bg-muted/30 text-sm">
                              <div className="font-mono text-xs text-primary truncate">{key}</div>
                              <div className="text-muted-foreground truncate">{field.title}</div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  Categorias de Deals
                </CardTitle>
                <CardDescription>
                  Selecione quais categorias de deals do Bitrix24 devem ser sincronizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/30">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertTitle className="text-yellow-400">Configuração via Edge Function</AlertTitle>
                  <AlertDescription className="text-yellow-300/80">
                    A seleção de categorias está configurada diretamente na Edge Function.
                    Por padrão, todos os deals são sincronizados. Para filtrar por categoria específica,
                    passe o parâmetro categoryId na sincronização.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
                      <h4 className="font-medium text-foreground mb-2">Sincronização Atual</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Configurado para sincronizar todos os deals do Bitrix24.
                      </p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Check className="h-3 w-3 mr-1" />
                        Todas as categorias
                      </Badge>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
                      <h4 className="font-medium text-foreground mb-2">Filtrar por Categoria</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Use o parâmetro categoryId ao sincronizar para filtrar deals.
                      </p>
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder="ID da categoria" 
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm" disabled>
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Value Mapping Tab */}
          <TabsContent value="values" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Technique Mapping */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Mapeamento de Técnicas</CardTitle>
                  <CardDescription>
                    Converte valores do Bitrix24 para IDs de técnicas do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {Object.entries(techniqueMapping).map(([bitrixValue, systemValue]) => (
                        <div key={bitrixValue} className="flex items-center justify-between p-2 rounded bg-muted/20">
                          <code className="text-xs text-muted-foreground">{bitrixValue}</code>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">{systemValue}</Badge>
                        </div>
                      ))}
                      {Object.keys(techniqueMapping).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Carregue os campos do Bitrix para ver o mapeamento
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Priority Mapping */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Mapeamento de Prioridades</CardTitle>
                  <CardDescription>
                    Converte valores de urgência do Bitrix24
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {Object.entries(priorityMapping).map(([bitrixValue, systemValue]) => (
                        <div key={bitrixValue} className="flex items-center justify-between p-2 rounded bg-muted/20">
                          <code className="text-xs text-muted-foreground">{bitrixValue}</code>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              systemValue === 'urgent' ? 'text-red-400 border-red-500/30' :
                              systemValue === 'high' ? 'text-orange-400 border-orange-500/30' :
                              systemValue === 'medium' ? 'text-yellow-400 border-yellow-500/30' :
                              'text-green-400 border-green-500/30'
                            }`}
                          >
                            {systemValue}
                          </Badge>
                        </div>
                      ))}
                      {Object.keys(priorityMapping).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Carregue os campos do Bitrix para ver o mapeamento
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Stage Mapping */}
              <Card className="glass-card border-border/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Mapeamento de Status (Stages)</CardTitle>
                  <CardDescription>
                    Converte estágios do funil do Bitrix24 para status do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(stageMapping).map(([bitrixStage, systemStatus]) => (
                      <div key={bitrixStage} className="flex items-center justify-between p-3 rounded bg-muted/20">
                        <div className="text-center flex-1">
                          <code className="text-xs text-muted-foreground block">{bitrixStage}</code>
                          <ArrowRight className="h-3 w-3 text-muted-foreground mx-auto my-1" />
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              systemStatus === 'finished' ? 'text-green-400 border-green-500/30' :
                              systemStatus === 'production' ? 'text-blue-400 border-blue-500/30' :
                              systemStatus === 'ready' ? 'text-cyan-400 border-cyan-500/30' :
                              systemStatus === 'cancelled' ? 'text-red-400 border-red-500/30' :
                              'text-yellow-400 border-yellow-500/30'
                            }`}
                          >
                            {systemStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {Object.keys(stageMapping).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4 col-span-full">
                        Carregue o mapeamento para ver os estágios
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Bitrix24SyncHistory />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Bitrix24ConfigPage;
