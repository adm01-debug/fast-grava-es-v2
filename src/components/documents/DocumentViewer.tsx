import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TechnicalDocument } from '@/hooks/useDocuments';

interface DocumentViewerProps {
  document: TechnicalDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentViewer({ document, open, onOpenChange }: DocumentViewerProps) {
  if (!document) return null;

  const isImage = document.file_type?.startsWith('image/');
  const isPDF = document.file_type === 'application/pdf';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {document.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Visualização do documento {document.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{document.file_type || 'Documento'}</Badge>
            {document.status && (
              <Badge variant={document.status === 'approved' ? 'default' : 'secondary'}>
                {document.status === 'approved' ? 'Aprovado' : document.status === 'pending' ? 'Pendente' : document.status}
              </Badge>
            )}
            {document.version && (
              <Badge variant="outline">v{document.version}</Badge>
            )}
          </div>

          {document.description && (
            <p className="text-sm text-muted-foreground">{document.description}</p>
          )}

          <div className="rounded-lg border bg-muted/30 p-4">
            {isImage && document.file_url ? (
              <img
                src={document.file_url}
                alt={document.title}
                className="max-w-full max-h-[50vh] object-contain mx-auto rounded"
              />
            ) : isPDF && document.file_url ? (
              <iframe
                src={document.file_url}
                className="w-full h-[50vh] rounded"
                title={document.title}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-sm">Pré-visualização não disponível para este tipo de arquivo</p>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            {document.created_at && (
              <p>Criado em: {format(new Date(document.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            )}
            {document.file_size && (
              <p>Tamanho: {(document.file_size / 1024).toFixed(1)} KB</p>
            )}
          </div>

          {document.file_url && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir em nova aba
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={document.file_url} download={document.file_name}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
