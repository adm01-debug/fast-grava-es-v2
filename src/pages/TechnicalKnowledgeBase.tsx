import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Filter,
  Clock,
  Wrench,
  ChevronRight,
  FileText,
  Lightbulb
} from 'lucide-react';
import { useTechnicalSheets, TechnicalSheet } from '@/hooks/useTechnicalSheets';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TechnicalSheetViewer } from '@/components/knowledge/TechnicalSheetViewer';
import { TechnicalSheetEditor } from '@/components/knowledge/TechnicalSheetEditor';
import { useAuth } from '@/contexts/AuthContext';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

const TechnicalKnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { role } = useAuth();

  const { sheets, isLoadingSheets, categories, materials } = useTechnicalSheets();

  // Fetch techniques
  const { data: techniques = [] } = useQuery({
    queryKey: ['techniques'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('techniques')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Group sheets by technique
  const groupedSheets = useMemo(() => {
    const filtered = sheets.filter(sheet => {
      const matchesSearch = sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sheet.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTechnique = selectedTechnique === 'all' || sheet.technique_id === selectedTechnique;
      const matchesCategory = selectedCategory === 'all' || sheet.product_category_id === selectedCategory;
      return matchesSearch && matchesTechnique && matchesCategory;
    });

    const grouped: Record<string, TechnicalSheet[]> = {};
    filtered.forEach(sheet => {
      const techniqueId = sheet.technique_id;
      if (!grouped[techniqueId]) {
        grouped[techniqueId] = [];
      }
      grouped[techniqueId].push(sheet);
    });

    return grouped;
  }, [sheets, searchTerm, selectedTechnique, selectedCategory]);

  const canEdit = role === 'coordinator';

  const handleSheetClick = (sheetId: string) => {
    setSelectedSheet(sheetId);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedSheet(null);
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCloseEditor = () => {
    setIsEditing(false);
    setIsCreating(false);
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] p-4 sm:p-6">
        <Breadcrumbs />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground flex items-center gap-2 sm:gap-3">
              <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
              <span className="text-base sm:text-2xl">Base de Conhecimento</span>
            </h1>
            <p className="text-xs sm:text-base text-muted-foreground mt-1">
              Fichas técnicas para personalização
            </p>
          </div>
          {canEdit && (
            <Button onClick={handleCreateNew} className="gap-2 self-start sm:self-auto" size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Ficha Técnica</span>
              <span className="sm:hidden">Nova Ficha</span>
            </Button>
          )}
        </div>

        {/* Mobile: Stacked layout, Desktop: Side by side */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
          {/* Left Panel - List */}
          <div className={`${selectedSheet || isCreating || isEditing ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 flex-shrink-0 flex-col`}>
            <Card className="glass-card border-border/50 flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <div className="space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar fichas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex gap-2">
                    <Select value={selectedTechnique} onValueChange={setSelectedTechnique}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Técnica" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas Técnicas</SelectItem>
                        {techniques.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Produto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos Produtos</SelectItem>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full px-4 pb-4">
                  {isLoadingSheets ? (
                    <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                  ) : Object.keys(groupedSheets).length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhuma ficha encontrada</p>
                      {canEdit && (
                        <Button variant="link" onClick={handleCreateNew} className="mt-2">
                          Criar primeira ficha técnica
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(groupedSheets).map(([techniqueId, techniqueSheets]) => {
                        const technique = techniques.find(t => t.id === techniqueId);
                        return (
                          <div key={techniqueId}>
                            <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background/80 backdrop-blur py-1">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: technique?.color || '#888' }}
                              />
                              <span className="text-sm font-medium text-foreground">
                                {technique?.name || techniqueId}
                              </span>
                              <Badge variant="outline" className="text-xs ml-auto">
                                {techniqueSheets.length}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {techniqueSheets.map(sheet => (
                                <button
                                  key={sheet.id}
                                  onClick={() => handleSheetClick(sheet.id)}
                                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                                    selectedSheet === sheet.id
                                      ? 'border-primary bg-primary/10'
                                      : 'border-border/30 hover:border-border hover:bg-muted/20'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{sheet.title}</p>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        {sheet.product_categories?.name && (
                                          <span>{sheet.product_categories.name}</span>
                                        )}
                                        {sheet.materials?.name && (
                                          <>
                                            <span>•</span>
                                            <span>{sheet.materials.name}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  </div>
                                  {sheet.estimated_time_minutes && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>{sheet.estimated_time_minutes} min</span>
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Viewer/Editor */}
          <div className={`${!selectedSheet && !isCreating && !isEditing ? 'hidden lg:block' : 'block'} flex-1 min-w-0`}>
            {/* Back button for mobile */}
            {(selectedSheet || isCreating || isEditing) && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mb-3"
                onClick={() => {
                  setSelectedSheet(null);
                  setIsCreating(false);
                  setIsEditing(false);
                }}
              >
                ← Voltar para lista
              </Button>
            )}
            
            {isCreating ? (
              <TechnicalSheetEditor
                techniques={techniques}
                categories={categories}
                materials={materials}
                onClose={handleCloseEditor}
              />
            ) : isEditing && selectedSheet ? (
              <TechnicalSheetEditor
                sheetId={selectedSheet}
                techniques={techniques}
                categories={categories}
                materials={materials}
                onClose={handleCloseEditor}
              />
            ) : selectedSheet ? (
              <TechnicalSheetViewer
                sheetId={selectedSheet}
                onEdit={canEdit ? handleEdit : undefined}
              />
            ) : (
              <Card className="glass-card border-border/50 h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <Lightbulb className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-muted-foreground">
                    Selecione uma ficha técnica
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">
                    Escolha uma ficha na lista para visualizar
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TechnicalKnowledgeBase;
