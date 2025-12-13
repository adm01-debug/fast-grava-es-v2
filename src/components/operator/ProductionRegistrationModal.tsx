import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { DbJob } from '@/hooks/useJobs';
import { toast } from 'sonner';
import { 
  Camera, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Package,
  Trash2,
  Loader2
} from 'lucide-react';

interface ProductionRegistrationModalProps {
  job: DbJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductionRegistrationModal({ 
  job, 
  open, 
  onOpenChange 
}: ProductionRegistrationModalProps) {
  const [producedQuantity, setProducedQuantity] = useState<number>(0);
  const [lostPieces, setLostPieces] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Reset form when job changes
  const handleOpenChange = (open: boolean) => {
    if (open && job) {
      setProducedQuantity(job.quantity);
      setLostPieces(job.lost_pieces || 0);
      setNotes(job.notes || '');
      setPhotos([]);
    }
    onOpenChange(open);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !job) return;

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${job.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('production-photos')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Erro ao enviar foto: ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('production-photos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setPhotos(prev => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} foto(s) enviada(s)`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Erro ao enviar fotos');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!job) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          status: 'finished',
          actual_end_time: new Date().toISOString(),
          lost_pieces: lostPieces,
          notes: notes || null,
          produced_quantity: producedQuantity,
          production_photos: photos,
        })
        .eq('id', job.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Produção finalizada com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving production:', error);
      toast.error('Erro ao salvar registro de produção');
    } finally {
      setIsSaving(false);
    }
  };

  if (!job) return null;

  const lossPercentage = job.quantity > 0 ? ((lostPieces / job.quantity) * 100).toFixed(1) : '0';
  const isHighLoss = parseFloat(lossPercentage) > 5;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Registro de Produção
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Job Info */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{job.client}</span>
                <Badge variant="outline">{job.order_number}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{job.product}</p>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Package className="h-4 w-4" />
                <span>Quantidade solicitada: <strong>{job.quantity.toLocaleString()}</strong> pçs</span>
              </div>
            </div>

            {/* Produced Quantity */}
            <div className="space-y-2">
              <Label htmlFor="produced">Quantidade Produzida</Label>
              <Input
                id="produced"
                type="number"
                min={0}
                value={producedQuantity}
                onChange={(e) => setProducedQuantity(parseInt(e.target.value) || 0)}
                className="bg-background"
              />
            </div>

            {/* Lost Pieces */}
            <div className="space-y-2">
              <Label htmlFor="lost" className="flex items-center gap-2">
                Peças Perdidas (Refugo)
                {isHighLoss && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Alto índice
                  </Badge>
                )}
              </Label>
              <Input
                id="lost"
                type="number"
                min={0}
                max={job.quantity}
                value={lostPieces}
                onChange={(e) => setLostPieces(parseInt(e.target.value) || 0)}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Índice de perda: <span className={isHighLoss ? 'text-destructive font-medium' : ''}>{lossPercentage}%</span>
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações sobre a produção..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-background min-h-[80px]"
              />
            </div>

            {/* Photos */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Fotos da Produção
              </Label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar Fotos
                  </>
                )}
              </Button>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Finalizar Produção
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
