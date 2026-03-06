import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  CameraOff, 
  Play, 
  Pause, 
  CheckCircle2, 
  Loader2,
  QrCode,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ScannedJob {
  id: string;
  order_number: string;
  product: string;
  client: string;
  status: string;
  technique_id: string;
  quantity: number;
  produced_quantity: number | null;
}

export const QRScanner = () => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedJob, setScannedJob] = useState<ScannedJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to record scan in history
  const recordScan = async (jobId: string, action: string) => {
    if (!user?.id) return;
    
    try {
      const deviceInfo = navigator.userAgent;
      await supabase
        .from("qr_scan_history")
        .insert({
          job_id: jobId,
          operator_id: user.id,
          action,
          device_info: deviceInfo
        });
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error recording scan:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => { /* cleanup */ });
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      if (!containerRef.current) return;

      scannerRef.current = new Html5Qrcode("qr-reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        () => {} // Ignore scan failures
      );

      setIsScanning(true);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error starting scanner:", error);
      toast.error("Não foi possível acessar a câmera");
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      setIsScanning(false);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error stopping scanner:", error);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      
      if (data.type !== "job" || !data.id) {
        toast.error("QR Code inválido");
        return;
      }

      await stopScanner();
      setIsLoading(true);

      const { data: job, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", data.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!job) {
        toast.error("Job não encontrado");
        setIsLoading(false);
        return;
      }

      setScannedJob(job);
      await recordScan(job.id, 'view');
      toast.success(`Job ${job.order_number} identificado!`);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error processing QR:", error);
      toast.error("Erro ao processar QR Code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartProduction = async () => {
    if (!scannedJob) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({
          status: "in_production",
          actual_start_time: new Date().toISOString()
        })
        .eq("id", scannedJob.id);

      if (error) throw error;

      await recordScan(scannedJob.id, 'start');
      setScannedJob({ ...scannedJob, status: "in_production" });
      toast.success("Produção iniciada!");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error starting production:", error);
      toast.error("Erro ao iniciar produção");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseProduction = async () => {
    if (!scannedJob) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: "paused" })
        .eq("id", scannedJob.id);

      if (error) throw error;

      await recordScan(scannedJob.id, 'pause');
      setScannedJob({ ...scannedJob, status: "paused" });
      toast.success("Produção pausada!");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error pausing production:", error);
      toast.error("Erro ao pausar produção");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeProduction = async () => {
    if (!scannedJob) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: "in_production" })
        .eq("id", scannedJob.id);

      if (error) throw error;

      await recordScan(scannedJob.id, 'resume');
      setScannedJob({ ...scannedJob, status: "in_production" });
      toast.success("Produção retomada!");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error resuming production:", error);
      toast.error("Erro ao retomar produção");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishProduction = async () => {
    if (!scannedJob) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({
          status: "completed",
          actual_end_time: new Date().toISOString()
        })
        .eq("id", scannedJob.id);

      if (error) throw error;

      await recordScan(scannedJob.id, 'finish');
      setScannedJob({ ...scannedJob, status: "completed" });
      toast.success("Produção finalizada!");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error finishing production:", error);
      toast.error("Erro ao finalizar produção");
    } finally {
      setActionLoading(false);
    }
  };

  const handleScanAnother = () => {
    setScannedJob(null);
    startScanner();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      queue: { label: "Na Fila", variant: "secondary" },
      scheduled: { label: "Agendado", variant: "outline" },
      in_production: { label: "Em Produção", variant: "default" },
      paused: { label: "Pausado", variant: "destructive" },
      completed: { label: "Finalizado", variant: "secondary" },
    };
    
    const config = statusConfig[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          Scanner de Produção
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!scannedJob ? (
          <>
            <div 
              ref={containerRef}
              id="qr-reader" 
              className="w-full aspect-square bg-muted/50 rounded-lg overflow-hidden relative"
            >
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <Camera className="h-16 w-16 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Clique para iniciar o scanner
                  </p>
                </div>
              )}
            </div>

            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Buscando job...</span>
              </div>
            )}

            <Button
              onClick={isScanning ? stopScanner : startScanner}
              className="w-full"
              variant={isScanning ? "destructive" : "default"}
            >
              {isScanning ? (
                <>
                  <CameraOff className="h-4 w-4 mr-2" />
                  Parar Scanner
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Iniciar Scanner
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">OS: {scannedJob.order_number}</span>
                {getStatusBadge(scannedJob.status)}
              </div>
              <p className="text-sm text-foreground font-medium">{scannedJob.product}</p>
              <p className="text-sm text-muted-foreground">{scannedJob.client}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                <span>Quantidade: {scannedJob.quantity}</span>
                <span>Produzido: {scannedJob.produced_quantity || 0}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {scannedJob.status === "queue" || scannedJob.status === "scheduled" ? (
                <Button 
                  onClick={handleStartProduction}
                  disabled={actionLoading}
                  className="col-span-2"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Iniciar Produção
                </Button>
              ) : scannedJob.status === "in_production" ? (
                <>
                  <Button 
                    onClick={handlePauseProduction}
                    variant="outline"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Pause className="h-4 w-4 mr-2" />
                    )}
                    Pausar
                  </Button>
                  <Button 
                    onClick={handleFinishProduction}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Finalizar
                  </Button>
                </>
              ) : scannedJob.status === "paused" ? (
                <>
                  <Button 
                    onClick={handleResumeProduction}
                    disabled={actionLoading}
                    className="col-span-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Retomar Produção
                  </Button>
                </>
              ) : scannedJob.status === "completed" ? (
                <div className="col-span-2 flex items-center justify-center gap-2 py-3 text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Produção Finalizada</span>
                </div>
              ) : null}
            </div>

            <Button 
              onClick={handleScanAnother}
              variant="outline"
              className="w-full"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Escanear Outro
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
