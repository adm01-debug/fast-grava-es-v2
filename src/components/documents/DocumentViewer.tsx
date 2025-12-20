import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  History,
  FileText,
  Image,
  File
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TechnicalDocument, useDocuments, useDocumentVersions } from '@/hooks/useDocuments';
import { useAuth } from '@/contexts/AuthContext';

interface DocumentViewerProps {
  document: TechnicalDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentViewer({ document, open, onOpenChange }: DocumentViewerProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const { role } = useAuth();
  const { approveDocument, rejectDocument } = useDocuments();
  const { data: versions = [] } = useDocumentVersions(document?.id || null);

  if (!document) return null;

  const canApprove = role === 'coordinator' && document.status === 'pending';
  const isPdf = document.file_type === 'application/pdf';
  const isImage = document.file_type.startsWith('image/');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/10 text-success border-success/30"><CheckCircle className="h-3 w-3 mr-1" /> Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge className="bg-warning/10 text-warning border-warning/30"><AlertCircle className="h-3 w-3 mr-1" /> Pendente</Badge>;
    }
  };

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleApprove = async () => {
    await approveDocument.mutateAsync(document.id);
    onOpenChange(false);
  };

  const handleReject = async () => {
    if (!rejectReason) return;
    await rejectDocument.mutateAsync({ documentId: document.id, reason: rejectReason });
    onOpenChange(false);
    setRejectReason('');
    setShowRejectInput(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {getFileIcon(document.file_type)}
              <div>
                <DialogTitle className="text-lg">{document.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Versão {document.version} • {formatFileSize(document.file_size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(document.status)}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-fit">
            <TabsTrigger value="preview">Visualizar</TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              Versões ({versions.length + 1})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 min-h-0 mt-4">
            <div className="flex flex-col h-full gap-4">
              {/* Preview Area */}
              <div className="flex-1 border rounded-lg overflow-hidden bg-muted/20">
                {isPdf ? (
                  <iframe
                    src={`${document.file_url}#toolbar=0`}
                    className="w-full h-full min-h-[400px]"
                    title={document.title}
                  />
                ) : isImage ? (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img
                      src={document.file_url}
                      alt={document.title}
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8">
                    {getFileIcon(document.file_type)}
                    <p className="mt-4 text-muted-foreground">
                      Visualização não disponível para este tipo de arquivo
                    </p>
                    <Button className="mt-4" asChild>
                      <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir em nova aba
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Description */}
              {document.description && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">{document.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Enviado em {format(new Date(document.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <a href={document.file_url} download={document.file_name}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>

                  {canApprove && !showRejectInput && (
                    <>
                      <Button variant="outline" onClick={() => setShowRejectInput(true)}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                      <Button onClick={handleApprove} disabled={approveDocument.isPending}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Reject Input */}
              {showRejectInput && (
                <div className="space-y-2 p-4 border rounded-lg bg-destructive/5">
                  <Textarea
                    placeholder="Motivo da rejeição..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowRejectInput(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleReject}
                      disabled={!rejectReason || rejectDocument.isPending}
                    >
                      Confirmar Rejeição
                    </Button>
                  </div>
                </div>
              )}

              {/* Rejection Reason Display */}
              {document.status === 'rejected' && document.rejection_reason && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-sm font-medium text-destructive">Motivo da rejeição:</p>
                  <p className="text-sm text-muted-foreground mt-1">{document.rejection_reason}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="versions" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {/* Current Version */}
                <div className="p-4 border rounded-lg bg-primary/5 border-primary/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(document.file_type)}
                      <div>
                        <p className="font-medium">Versão {document.version} (Atual)</p>
                        <p className="text-sm text-muted-foreground">{document.file_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatFileSize(document.file_size)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(document.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Previous Versions */}
                {versions.map((version) => (
                  <div key={version.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Versão {version.version}</p>
                          <p className="text-sm text-muted-foreground">{version.file_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm">{formatFileSize(version.file_size)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(version.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={version.file_url} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                    {version.change_notes && (
                      <p className="mt-2 text-sm text-muted-foreground italic">
                        "{version.change_notes}"
                      </p>
                    )}
                  </div>
                ))}

                {versions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma versão anterior</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
