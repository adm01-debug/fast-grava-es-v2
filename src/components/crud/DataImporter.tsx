import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  X,
} from 'lucide-react';
import { z } from 'zod';
import { importCSV, downloadCSVTemplate, ImportResult, ImportError } from '@/lib/csvImporter';
import { importExcel, downloadExcelTemplate, getExcelSheets } from '@/lib/excelImporter';

type ImportFormat = 'csv' | 'excel';

interface ColumnDefinition {
  name: string;
  example?: string;
  required?: boolean;
}

interface DataImporterProps<T> {
  schema: z.ZodSchema<T>;
  columns: ColumnDefinition[];
  onImport: (data: T[]) => Promise<void>;
  entityName?: string;
  templateFilename?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
  maxRows?: number;
}

export function DataImporter<T>({
  schema,
  columns,
  onImport,
  entityName = 'registros',
  templateFilename = 'template',
  buttonVariant = 'outline',
  maxRows = 5000,
}: DataImporterProps<T>) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImportFormat>('csv');
  const [result, setResult] = useState<ImportResult<T> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  const resetState = useCallback(() => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setSheets([]);
    setSelectedSheet('');
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    resetState();
    setFile(selectedFile);

    // Detectar formato
    const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls');
    setFormat(isExcel ? 'excel' : 'csv');

    // Se for Excel, listar planilhas
    if (isExcel) {
      try {
        const sheetNames = await getExcelSheets(selectedFile);
        setSheets(sheetNames);
        if (sheetNames.length > 0) {
          setSelectedSheet(sheetNames[0]);
        }
      } catch (error) {
        console.error('Erro ao ler planilhas:', error);
      }
    }

    // Processar arquivo
    await processFile(selectedFile, isExcel ? 'excel' : 'csv');
  };

  const processFile = async (fileToProcess: File, fileFormat: ImportFormat, sheet?: string) => {
    setIsProcessing(true);
    setProgress(20);

    try {
      let importResult: ImportResult<T>;

      if (fileFormat === 'excel') {
        importResult = await importExcel(fileToProcess, schema, { sheetName: sheet });
      } else {
        importResult = await importCSV(fileToProcess, schema);
      }

      setProgress(80);

      // Verificar limite de linhas
      if (importResult.success.length > maxRows) {
        importResult.errors.push({
          row: 0,
          field: 'geral',
          value: importResult.success.length,
          error: `Limite de ${maxRows} registros excedido. Encontrados: ${importResult.success.length}`,
        });
        importResult.success = importResult.success.slice(0, maxRows);
      }

      setResult(importResult);
      setProgress(100);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setResult({
        success: [],
        errors: [{ row: 0, field: 'arquivo', value: null, error: 'Erro ao processar arquivo' }],
        total: 0,
        skipped: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSheetChange = async (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (file) {
      await processFile(file, 'excel', sheetName);
    }
  };

  const handleImport = async () => {
    if (!result || result.success.length === 0) return;

    setIsImporting(true);
    setProgress(0);

    try {
      // Simular progresso durante a importação
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await onImport(result.success);

      clearInterval(progressInterval);
      setProgress(100);

      // Fechar após sucesso
      setTimeout(() => {
        setOpen(false);
        resetState();
      }, 1500);
    } catch (error) {
      console.error('Erro ao importar:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    if (format === 'excel') {
      downloadExcelTemplate(columns, templateFilename);
    } else {
      downloadCSVTemplate(columns, templateFilename);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetState();
    }}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Importar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar {entityName}</DialogTitle>
          <DialogDescription>
            Importe dados de um arquivo CSV ou Excel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Seleção de arquivo */}
          <div className="space-y-2">
            <Label htmlFor="import-file">Arquivo</Label>
            <div className="flex gap-2">
              <Input
                id="import-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={isProcessing || isImporting}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownloadTemplate}
                title="Baixar template"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Seleção de planilha (Excel) */}
          {sheets.length > 1 && (
            <div className="space-y-2">
              <Label>Planilha</Label>
              <Select value={selectedSheet} onValueChange={handleSheetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a planilha" />
                </SelectTrigger>
                <SelectContent>
                  {sheets.map((sheet) => (
                    <SelectItem key={sheet} value={sheet}>
                      {sheet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Progresso */}
          {(isProcessing || isImporting) && (
            <Progress value={progress} className="h-2" />
          )}

          {/* Resultado */}
          {result && !isProcessing && (
            <div className="space-y-4">
              {/* Resumo */}
              <Alert variant={result.errors.length > 0 ? 'destructive' : 'default'}>
                {result.errors.length === 0 ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {result.errors.length === 0 ? 'Arquivo válido!' : 'Atenção'}
                </AlertTitle>
                <AlertDescription>
                  {result.success.length} {entityName} válidos
                  {result.errors.length > 0 && `, ${result.errors.length} erros`}
                  {result.skipped > 0 && `, ${result.skipped} linhas vazias ignoradas`}
                </AlertDescription>
              </Alert>

              {/* Lista de erros */}
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <Label>Erros encontrados:</Label>
                  <ScrollArea className="h-40 rounded border p-2">
                    {result.errors.slice(0, 50).map((err, i) => (
                      <div key={i} className="text-sm text-destructive py-1">
                        <span className="font-medium">Linha {err.row}</span>
                        {err.field !== 'geral' && (
                          <span>, campo "{err.field}"</span>
                        )}
                        : {err.error}
                      </div>
                    ))}
                    {result.errors.length > 50 && (
                      <div className="text-sm text-muted-foreground mt-2">
                        ... e mais {result.errors.length - 50} erros
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isImporting}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!result || result.success.length === 0 || isProcessing || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importar {result?.success.length ?? 0} {entityName}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
