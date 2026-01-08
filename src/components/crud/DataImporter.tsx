/**
 * Data Importer Component
 * 
 * @module components/DataImporter
 */

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

interface ColumnConfig {
  key: string;
  label: string;
  required?: boolean;
}

interface DataImporterProps<T> {
  schema: z.ZodSchema<T>;
  columns: ColumnConfig[];
  onImport: (data: T[]) => Promise<void>;
  templateName: string;
  title: string;
  trigger?: ReactNode;
  onSuccess?: () => void;
}

export function DataImporter<T>({
  schema,
  columns,
  onImport,
  templateName,
  title,
  trigger,
  onSuccess,
}: DataImporterProps<T>) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors([]);
    }
  };

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Selecione um arquivo');
      return;
    }

    setIsImporting(true);
    setErrors([]);

    try {
      const text = await file.text();
      const rawData = parseCSV(text);

      if (rawData.length === 0) {
        throw new Error('Arquivo vazio ou formato inválido');
      }

      const validData: T[] = [];
      const parseErrors: string[] = [];

      rawData.forEach((row, index) => {
        try {
          const parsed = schema.parse(row);
          validData.push(parsed);
        } catch (err) {
          if (err instanceof z.ZodError) {
            parseErrors.push(`Linha ${index + 2}: ${err.errors[0]?.message}`);
          }
        }
      });

      if (parseErrors.length > 0) {
        setErrors(parseErrors.slice(0, 5));
        if (parseErrors.length > 5) {
          setErrors((prev) => [
            ...prev,
            `...e mais ${parseErrors.length - 5} erros`,
          ]);
        }
      }

      if (validData.length > 0) {
        await onImport(validData);
        toast.success(`${validData.length} registros importados!`);
        setOpen(false);
        setFile(null);
        onSuccess?.();
      } else {
        toast.error('Nenhum registro válido encontrado');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao importar'
      );
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = columns.map((c) => c.label).join(',');
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${templateName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV para importar dados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex-1"
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {file.name}
            </div>
          )}

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <Button variant="link" size="sm" onClick={downloadTemplate}>
              Baixar template
            </Button>
            <Button onClick={handleImport} disabled={!file || isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DataImporter;
