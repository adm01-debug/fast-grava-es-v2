import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Upload, FileJson, FileSpreadsheet, FileText, 
  Check, AlertCircle, Loader2, Settings, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

type ExportFormat = 'json' | 'csv' | 'xlsx' | 'pdf';
type ExportStatus = 'idle' | 'preparing' | 'exporting' | 'success' | 'error';

interface ExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
  dateRange?: { start: Date; end: Date };
  fields: string[];
}

interface ExportField {
  id: string;
  label: string;
  required?: boolean;
}

const EXPORT_FORMATS: { id: ExportFormat; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'json', label: 'JSON', icon: FileJson, description: 'Formato estruturado para sistemas' },
  { id: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Compatível com Excel e planilhas' },
  { id: 'xlsx', label: 'Excel', icon: FileSpreadsheet, description: 'Planilha formatada do Excel' },
  { id: 'pdf', label: 'PDF', icon: FileText, description: 'Documento para impressão' },
];

export function ExportDialog({ 
  fields,
  onExport,
  title = 'Exportar Dados',
}: { 
  fields: ExportField[];
  onExport: (options: ExportOptions) => Promise<Blob>;
  title?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>(fields.map(f => f.id));
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleExport = async () => {
    setStatus('preparing');
    setProgress(10);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setStatus('exporting');
      setProgress(50);

      const blob = await onExport({
        format,
        includeMetadata,
        fields: selectedFields,
      });

      setProgress(90);
      
      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setStatus('success');
      
      toast({
        title: 'Exportação concluída!',
        description: 'O arquivo foi baixado com sucesso.',
      });

      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
        setProgress(0);
      }, 1500);
    } catch (error) {
      setStatus('error');
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive',
      });
    }
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Formato</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPORT_FORMATS.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                      format === f.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted'
                    )}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Campos</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {fields.map((field) => (
                <label
                  key={field.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                    disabled={field.required}
                  />
                  <span className="text-sm">{field.label}</span>
                  {field.required && (
                    <span className="text-xs text-muted-foreground">(obrigatório)</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="metadata"
              checked={includeMetadata}
              onCheckedChange={(c) => setIncludeMetadata(c === true)}
            />
            <label htmlFor="metadata" className="text-sm cursor-pointer">
              Incluir metadados (data de exportação, filtros aplicados)
            </label>
          </div>

          {/* Progress */}
          <AnimatePresence>
            {status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {status === 'preparing' && 'Preparando dados...'}
                    {status === 'exporting' && 'Exportando...'}
                    {status === 'success' && 'Concluído!'}
                    {status === 'error' && 'Erro na exportação'}
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={status !== 'idle' && status !== 'error'}
              className="gap-2"
            >
              {status === 'idle' || status === 'error' ? (
                <>
                  <Download className="h-4 w-4" />
                  Exportar
                </>
              ) : status === 'success' ? (
                <>
                  <Check className="h-4 w-4" />
                  Concluído
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exportando...
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Import Component
export function ImportDialog({
  onImport,
  acceptedFormats = ['.json', '.csv', '.xlsx'],
  title = 'Importar Dados',
}: {
  onImport: (file: File) => Promise<{ success: number; errors: number }>;
  acceptedFormats?: string[];
  title?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'validating' | 'importing' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleImport = async () => {
    if (!file) return;

    setStatus('validating');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setStatus('importing');
    try {
      const importResult = await onImport(file);
      setResult(importResult);
      setStatus('success');
      
      toast({
        title: 'Importação concluída!',
        description: `${importResult.success} registros importados.`,
      });
    } catch (error) {
      setStatus('error');
      toast({
        title: 'Erro na importação',
        description: 'Não foi possível importar os dados.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
              file && 'border-chart-2 bg-chart-2/5'
            )}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="h-12 w-12 text-chart-2" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                  Remover
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <p className="font-medium">Arraste um arquivo aqui</p>
                <p className="text-sm text-muted-foreground">
                  ou clique para selecionar
                </p>
                <input
                  type="file"
                  accept={acceptedFormats.join(',')}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Result */}
          <AnimatePresence>
            {status === 'success' && result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-chart-2/10 border border-chart-2/20"
              >
                <div className="flex items-center gap-2 text-chart-2 mb-2">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Importação concluída</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Sucesso:</span>
                    <span className="ml-2 font-medium">{result.success}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Erros:</span>
                    <span className="ml-2 font-medium">{result.errors}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {status === 'success' ? 'Fechar' : 'Cancelar'}
            </Button>
            {status !== 'success' && (
              <Button 
                onClick={handleImport} 
                disabled={!file || status === 'importing'}
                className="gap-2"
              >
                {status === 'importing' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Importar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick Export Hook
export function useQuickExport() {
  const exportToCSV = useCallback((data: Record<string, unknown>[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportToJSON = useCallback((data: unknown, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return { exportToCSV, exportToJSON };
}

export default ExportDialog;
