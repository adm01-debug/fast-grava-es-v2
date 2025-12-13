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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Link2,
  Plus,
  Trash2,
  Edit,
  X
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

interface MappingRecord {
  id: string;
  mapping_type: string;
  source_key: string;
  target_key: string;
  priority: number;
  is_active: boolean;
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

const SYSTEM_TECHNIQUES = [
  'silk-textile', 'silk-vinyl-flat', 'silk-vinyl-rotative', 'silk-decal',
  'fiber-laser', 'laser-co2', 'laser-uv', 'tampo', 'hot-stamp',
  'thermal-press', 'sublimation-mug', 'decal-oven', 'dtf-textile', 
  'dtf-uv', 'dtf-uv-application', 'cut-media'
];

const SYSTEM_PRIORITIES = ['urgent', 'high', 'medium', 'low'];
const SYSTEM_STATUSES = ['queue', 'ready', 'scheduled', 'production', 'finished', 'cancelled', 'delayed', 'paused', 'rework'];

const Bitrix24ConfigPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bitrixFields, setBitrixFields] = useState<Record<string, FieldInfo>>({});
  const [allMappings, setAllMappings] = useState<MappingRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newMapping, setNewMapping] = useState({ 
    mapping_type: 'field', 
    source_key: '', 
    target_key: '', 
    priority: 0 
  });
  const { toast } = useToast();

  const callBitrixSync = async (action: string, body?: any): Promise<any> => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const url = `https://${projectId}.supabase.co/functions/v1/bitrix24-sync?action=${action}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: body ? JSON.stringify(body) : undefined
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

  const fetchMappings = async () => {
    setIsLoading(true);
    try {
      const result = await callBitrixSync('list-mappings');
      setAllMappings(result.mappings || []);
    } catch (error: any) {
      console.error('Error fetching mappings:', error);
      toast({
        title: 'Erro ao carregar mapeamentos',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveMapping = async () => {
    if (!newMapping.source_key || !newMapping.target_key) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await callBitrixSync('save-mapping', newMapping);
      toast({
        title: 'Mapeamento salvo',
        description: 'O mapeamento foi salvo com sucesso.'
      });
      setAddDialogOpen(false);
      setNewMapping({ mapping_type: 'field', source_key: '', target_key: '', priority: 0 });
      await fetchMappings();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMapping = async (mapping: MappingRecord) => {
    if (!confirm('Tem certeza que deseja remover este mapeamento?')) return;

    setIsLoading(true);
    try {
      await callBitrixSync('delete-mapping', { id: mapping.id });
      toast({
        title: 'Mapeamento removido',
        description: 'O mapeamento foi removido com sucesso.'
      });
      await fetchMappings();
    } catch (error: any) {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  const getMappingsByType = (type: string) => {
    return allMappings.filter(m => m.mapping_type === type);
  };

  const getFieldMappings = () => {
    const fieldMappings = getMappingsByType('field');
    const grouped: Record<string, MappingRecord[]> = {};
    
    for (const mapping of fieldMappings) {
      if (!grouped[mapping.source_key]) {
        grouped[mapping.source_key] = [];
      }
      grouped[mapping.source_key].push(mapping);
    }
    
    return grouped;
  };

  const getFieldTitle = (fieldKey: string): string => {
    const field = bitrixFields[fieldKey];
    return field?.title || field?.formLabel || fieldKey;
  };

  const getTargetOptions = () => {
    switch (newMapping.mapping_type) {
      case 'field':
        return Object.keys(bitrixFields).length > 0 
          ? Object.keys(bitrixFields)
          : ['UF_CRM_...'];
      case 'technique':
        return SYSTEM_TECHNIQUES;
      case 'priority':
        return SYSTEM_PRIORITIES;
      case 'stage':
        return SYSTEM_STATUSES;
      default:
        return [];
    }
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
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Mapeamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Mapeamento</DialogTitle>
                <DialogDescription>
                  Configure um novo mapeamento entre Bitrix24 e o sistema
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo de Mapeamento</Label>
                  <Select 
                    value={newMapping.mapping_type} 
                    onValueChange={(v) => setNewMapping({...newMapping, mapping_type: v, source_key: '', target_key: ''})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="field">Campo (Job Field → Bitrix Field)</SelectItem>
                      <SelectItem value="technique">Técnica (Bitrix Value → System ID)</SelectItem>
                      <SelectItem value="priority">Prioridade (Bitrix Value → System Value)</SelectItem>
                      <SelectItem value="stage">Status (Bitrix Stage → System Status)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    {newMapping.mapping_type === 'field' ? 'Campo do Sistema (source_key)' : 'Valor Bitrix24 (source_key)'}
                  </Label>
                  {newMapping.mapping_type === 'field' ? (
                    <Select 
                      value={newMapping.source_key} 
                      onValueChange={(v) => setNewMapping({...newMapping, source_key: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o campo" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_FIELDS.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.label} ({f.id})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      value={newMapping.source_key}
                      onChange={(e) => setNewMapping({...newMapping, source_key: e.target.value})}
                      placeholder={newMapping.mapping_type === 'stage' ? 'Ex: NEW, EXECUTING, WON' : 'Ex: urgente, silk_textil'}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    {newMapping.mapping_type === 'field' ? 'Campo Bitrix24 (target_key)' : 'Valor do Sistema (target_key)'}
                  </Label>
                  {newMapping.mapping_type === 'field' ? (
                    <Input 
                      value={newMapping.target_key}
                      onChange={(e) => setNewMapping({...newMapping, target_key: e.target.value})}
                      placeholder="Ex: UF_CRM_CLIENT, UF_CRM_QUANTIDADE"
                    />
                  ) : (
                    <Select 
                      value={newMapping.target_key} 
                      onValueChange={(v) => setNewMapping({...newMapping, target_key: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o valor" />
                      </SelectTrigger>
                      <SelectContent>
                        {getTargetOptions().map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {newMapping.mapping_type === 'field' && (
                  <div className="space-y-2">
                    <Label>Prioridade (ordem de busca)</Label>
                    <Input 
                      type="number"
                      value={newMapping.priority}
                      onChange={(e) => setNewMapping({...newMapping, priority: parseInt(e.target.value) || 0})}
                      min={0}
                    />
                    <p className="text-xs text-muted-foreground">
                      Campos com menor prioridade são verificados primeiro
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancelar</Button>
                <Button onClick={saveMapping} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <TabsTrigger value="values" className="gap-2">
              <Layers className="h-4 w-4" />
              Mapeamento de Valores
            </TabsTrigger>
            <TabsTrigger value="bitrix-fields" className="gap-2">
              <Database className="h-4 w-4" />
              Campos Bitrix24
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <RefreshCw className="h-4 w-4" />
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
                      Mapeamento de Campos (Database)
                    </CardTitle>
                    <CardDescription>
                      Campos do sistema mapeados para campos UF_CRM_* do Bitrix24
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={fetchMappings} disabled={isLoading} className="gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Atualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 bg-green-500/10 border-green-500/30">
                  <Check className="h-4 w-4 text-green-400" />
                  <AlertTitle className="text-green-400">Mapeamento Dinâmico Ativo</AlertTitle>
                  <AlertDescription className="text-green-300/80">
                    Os mapeamentos são carregados do banco de dados e aplicados em tempo real.
                    Alterações são refletidas imediatamente na próxima sincronização.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {JOB_FIELDS.map((jobField) => {
                    const mappings = getFieldMappings()[jobField.id] || [];
                    return (
                      <div key={jobField.id} className="p-4 rounded-lg bg-muted/20 border border-border/30">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">{jobField.label}</span>
                              <Badge variant="outline" className="text-xs">{jobField.id}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{jobField.description}</p>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">Campos Bitrix:</span>
                              {mappings.length > 0 ? (
                                mappings.map((mapping) => (
                                  <div key={mapping.id} className="flex items-center gap-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {getFieldTitle(mapping.target_key) || mapping.target_key}
                                      <span className="text-muted-foreground ml-1">(#{mapping.priority})</span>
                                    </Badge>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-5 w-5 text-destructive hover:text-destructive"
                                      onClick={() => deleteMapping(mapping)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
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
                    );
                  })}
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
                    Converte valores do Bitrix24 para IDs de técnicas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {getMappingsByType('technique').map((mapping) => (
                        <div key={mapping.id} className="flex items-center justify-between p-2 rounded bg-muted/20 group">
                          <code className="text-xs text-muted-foreground">{mapping.source_key}</code>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">{mapping.target_key}</Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                            onClick={() => deleteMapping(mapping)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {getMappingsByType('technique').length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum mapeamento de técnica configurado
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
                      {getMappingsByType('priority').map((mapping) => (
                        <div key={mapping.id} className="flex items-center justify-between p-2 rounded bg-muted/20 group">
                          <code className="text-xs text-muted-foreground">{mapping.source_key}</code>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              mapping.target_key === 'urgent' ? 'text-red-400 border-red-500/30' :
                              mapping.target_key === 'high' ? 'text-orange-400 border-orange-500/30' :
                              mapping.target_key === 'medium' ? 'text-yellow-400 border-yellow-500/30' :
                              'text-green-400 border-green-500/30'
                            }`}
                          >
                            {mapping.target_key}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                            onClick={() => deleteMapping(mapping)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {getMappingsByType('priority').length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum mapeamento de prioridade configurado
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
                    {getMappingsByType('stage').map((mapping) => (
                      <div key={mapping.id} className="flex items-center justify-between p-3 rounded bg-muted/20 group">
                        <div className="text-center flex-1">
                          <code className="text-xs text-muted-foreground block">{mapping.source_key}</code>
                          <ArrowRight className="h-3 w-3 text-muted-foreground mx-auto my-1" />
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              mapping.target_key === 'finished' ? 'text-green-400 border-green-500/30' :
                              mapping.target_key === 'production' ? 'text-blue-400 border-blue-500/30' :
                              mapping.target_key === 'ready' ? 'text-cyan-400 border-cyan-500/30' :
                              mapping.target_key === 'cancelled' ? 'text-red-400 border-red-500/30' :
                              'text-yellow-400 border-yellow-500/30'
                            }`}
                          >
                            {mapping.target_key}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={() => deleteMapping(mapping)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {getMappingsByType('stage').length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4 col-span-full">
                        Nenhum mapeamento de status configurado
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bitrix Fields Tab */}
          <TabsContent value="bitrix-fields" className="space-y-4">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      Campos Personalizados do Bitrix24
                    </CardTitle>
                    <CardDescription>
                      Lista de campos UF_CRM_* disponíveis no seu Bitrix24
                    </CardDescription>
                  </div>
                  <Button onClick={fetchBitrixFields} disabled={isLoading} className="gap-2">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Carregar do Bitrix
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {Object.keys(bitrixFields).length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(bitrixFields).map(([key, field]) => (
                        <div key={key} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                          <div className="font-mono text-xs text-primary truncate mb-1">{key}</div>
                          <div className="text-sm text-foreground truncate">{field.title}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{field.type}</Badge>
                            {field.isRequired && <Badge className="text-xs bg-red-500/20 text-red-400">Obrigatório</Badge>}
                            {field.isMultiple && <Badge className="text-xs bg-blue-500/20 text-blue-400">Múltiplo</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Clique em "Carregar do Bitrix" para ver os campos disponíveis
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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
