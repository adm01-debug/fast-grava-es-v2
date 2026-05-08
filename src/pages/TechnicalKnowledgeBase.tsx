import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFuseSearch } from '@/hooks/useFuseSearch';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Lightbulb, Search, Filter, ShieldCheck, ChevronLeft, Zap, Layers, Beaker, Settings2 } from 'lucide-react';
import { useTechnicalSheets, useTechnicalSheetMutations, TechnicalSheet } from '@/hooks/useTechnicalSheets';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TechnicalSheetViewer } from '@/components/knowledge/TechnicalSheetViewer';
import { TechnicalSheetEditor } from '@/components/knowledge/TechnicalSheetEditor';
import { KnowledgeBaseStats } from '@/components/knowledge/KnowledgeBaseStats';
import { KnowledgeSheetList } from '@/components/knowledge/KnowledgeSheetList';
import { useAuth } from '@/contexts/AuthContext';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { toast } from 'sonner';
import { PageTransition } from '@/components/layout/PageTransition';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TechnicalKnowledgeBase = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { role } = useAuth();
  const { createSheet } = useTechnicalSheetMutations();

  const { sheets, isLoadingSheets, categories, materials } = useTechnicalSheets();

  const { data: techniques = [] } = useQuery({
    queryKey: ['techniques'],
    queryFn: async () => {
      const { data, error } = await supabase.from('techniques').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: machines = [] } = useQuery({
    queryKey: ['machines-active'],
    queryFn: async () => {
      const { data, error } = await supabase.from('machines').select('id, name, code').eq('is_active', true).order('name');
      if (error) throw error;
      return data;
    }
  });

  // Deep linking: read sheet from URL
  useEffect(() => {
    const sheetParam = searchParams.get('sheet');
    if (sheetParam && sheets.length > 0) {
      const exists = sheets.find(s => s.id === sheetParam);
      if (exists) setSelectedSheet(sheetParam);
    }
  }, [searchParams, sheets]);

  // Update URL when sheet changes
  useEffect(() => {
    if (selectedSheet) {
      setSearchParams({ sheet: selectedSheet }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selectedSheet]);

  // Expanded fuzzy search: title, description, material, machine
  const fuseSearchedSheets = useFuseSearch(sheets, searchTerm, {
    keys: ['title', 'description', 'materials.name', 'machines.name', 'machines.code', 'product_categories.name'],
    threshold: 0.3,
  });

  const groupedSheets = useMemo(() => {
    const filtered = fuseSearchedSheets.filter(sheet => {
      const matchesTechnique = selectedTechnique === 'all' || sheet.technique_id === selectedTechnique;
      const matchesCategory = selectedCategory === 'all' || sheet.product_category_id === selectedCategory;
      const matchesMachine = selectedMachine === 'all' || sheet.recommended_machine_id === selectedMachine;
      return matchesTechnique && matchesCategory && matchesMachine;
    });

    const grouped: Record<string, TechnicalSheet[]> = {};
    filtered.forEach(sheet => {
      const tid = sheet.technique_id;
      if (!grouped[tid]) grouped[tid] = [];
      grouped[tid].push(sheet);
    });
    return grouped;
  }, [fuseSearchedSheets, selectedTechnique, selectedCategory, selectedMachine]);

  const canEdit = role === 'coordinator';
  const hasFilters = searchTerm !== '' || selectedTechnique !== 'all' || selectedCategory !== 'all' || selectedMachine !== 'all';

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

  const handleDuplicate = async () => {
    if (!selectedSheet) return;
    const original = sheets.find(s => s.id === selectedSheet);
    if (!original) return;
    try {
      await createSheet.mutateAsync({
        technique_id: original.technique_id,
        title: `${original.title} (Cópia)`,
        description: original.description || undefined,
        product_category_id: original.product_category_id || undefined,
        material_id: original.material_id || undefined,
        estimated_time_minutes: original.estimated_time_minutes || undefined,
        recommended_machine_id: original.recommended_machine_id || undefined,
      });
      toast.success('Ficha duplicada com sucesso!');
    } catch {
      toast.error('Erro ao duplicar ficha');
    }
  };

  return (
    <MainLayout>
      <PageTransition>
        <div className="flex flex-col h-[calc(100vh-4rem)] p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
          {/* Header Section */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border/40 pb-8">
            <div className="flex items-start gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl shadow-glow-primary/10 ring-1 ring-primary/20">
                <BookOpen className="h-8 w-8 text-primary" aria-hidden />
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-black font-display tracking-tight leading-none uppercase gradient-text">Knowledge Base</h1>
                <p className="text-base text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-80">Industrial Technical Documentation Hub</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {canEdit && (
                <Button 
                  onClick={handleCreateNew} 
                  className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-xs shadow-glow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Technical Sheet
                </Button>
              )}
              <Badge variant="outline" className="h-12 px-4 rounded-xl border-primary/20 bg-primary/5 text-[10px] font-black tracking-[0.15em] uppercase text-primary">
                <ShieldCheck className="h-3.5 w-3.5 mr-2" />
                Validated Protocols
              </Badge>
            </div>
          </header>

          {/* Stats Section */}
          <div className="animate-in slide-in-from-top duration-700 delay-100">
            <KnowledgeBaseStats sheets={sheets} techniques={techniques} />
          </div>

          {/* Main Workspace */}
          <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
            {/* Left Panel: Navigation & Search */}
            <aside 
              className={cn(
                "w-full lg:w-[400px] flex-shrink-0 flex flex-col transition-all duration-500",
                (selectedSheet || isCreating || isEditing) ? 'hidden lg:flex opacity-0 lg:opacity-100' : 'flex'
              )}
            >
              <Card className="flex-1 flex flex-col border-border/40 bg-card/40 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/5">
                <div className="p-8 pb-4 border-b border-border/20">
                  <h3 className="text-lg font-bold font-display uppercase tracking-wider flex items-center gap-2 mb-6">
                    <Filter className="h-4 w-4 text-primary" />
                    Protocol Registry
                  </h3>
                  <KnowledgeSheetList
                    sheets={groupedSheets}
                    techniques={techniques}
                    categories={categories}
                    machines={machines}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedTechnique={selectedTechnique}
                    onTechniqueChange={setSelectedTechnique}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    selectedMachine={selectedMachine}
                    onMachineChange={setSelectedMachine}
                    selectedSheet={selectedSheet}
                    onSheetClick={handleSheetClick}
                    canEdit={canEdit}
                    onCreateNew={handleCreateNew}
                    isLoading={isLoadingSheets}
                    hasFilters={hasFilters}
                  />
                </div>
              </Card>
            </aside>

            {/* Right Panel: Content Display */}
            <main 
              className={cn(
                "flex-1 min-w-0 transition-all duration-500",
                (!selectedSheet && !isCreating && !isEditing) ? 'hidden lg:block opacity-40 grayscale-[0.5]' : 'block opacity-100'
              )}
            >
              {(selectedSheet || isCreating || isEditing) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden mb-6 h-10 px-4 rounded-xl hover:bg-primary/10 text-primary font-bold uppercase tracking-widest text-[10px]"
                  onClick={() => {
                    setSelectedSheet(null);
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Registry
                </Button>
              )}

              <div className="h-full animate-in zoom-in-95 duration-500">
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
                    onDuplicate={canEdit ? handleDuplicate : undefined}
                  />
                ) : (
                  <Card className="border-border/40 bg-card/20 backdrop-blur-sm h-full flex items-center justify-center rounded-[2.5rem] border-dashed">
                    <CardContent className="text-center p-12 max-w-md space-y-6">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                        <Lightbulb className="h-24 w-24 text-primary/30 relative z-10 mx-auto animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold font-display uppercase tracking-tight text-muted-foreground/80">
                          Select a Protocol
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium italic leading-relaxed">
                          Choose a technical specification from the left registry to initialize the workstation parameters.
                        </p>
                      </div>
                      <div className="flex justify-center gap-4 pt-4 grayscale opacity-40">
                        <Zap className="h-6 w-6" />
                        <Layers className="h-6 w-6" />
                        <Beaker className="h-6 w-6" />
                        <Settings2 className="h-6 w-6" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </main>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default TechnicalKnowledgeBase;
