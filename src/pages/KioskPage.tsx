import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { KioskMode } from "@/components/kiosk/KioskMode";
import { useSchedulingData } from "@/hooks/useSchedulingData";
import { useUpdateJobStatus } from "@/hooks/useJobs";
import { notifyStatusChange } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { ProductionRegistrationModal } from "@/components/operator/ProductionRegistrationModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function KioskPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { jobs, machines, refetchAll, isLoading, getTechniqueById, getMachineById } = useSchedulingData();
  const updateStatus = useUpdateJobStatus();
  
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [productionJobId, setProductionJobId] = useState<string | null>(null);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Track online status and auto-sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Conexão restabelecida", {
        description: "Sincronizando dados pendentes...",
        duration: 3000,
      });
      handleRefresh();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Modo Offline Ativado", {
        description: "As operações serão salvas localmente e sincronizadas quando houver conexão.",
        duration: 5000,
      });
    };
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Auto-refresh every 2 minutes when online
    const autoRefresh = setInterval(() => {
      if (navigator.onLine) handleRefresh();
    }, 120000);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(autoRefresh);
    };
  }, []);

  const handleRefresh = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await refetchAll();
      setLastSync(new Date());
      setErrorCount(0);
    } catch (err) {
      setErrorCount(prev => prev + 1);
      if (errorCount > 2) {
        toast.error("Erro na sincronização", {
          description: "Verifique sua conexão de rede.",
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter jobs for kiosk display
  const kioskJobs = useMemo(() => {
    if (!jobs) return [];
    
    return jobs
      .filter(job => 
        ["ready", "scheduled", "production", "paused", "completed"].includes(job.status)
      )
      .filter(job => !selectedMachineId || job.machine_id === selectedMachineId)
      .map(job => {
        const technique = getTechniqueById(job.technique_id);
        const machine = getMachineById(job.machine_id);
        
        return {
          id: job.id,
          client: job.client,
          product: job.product,
          orderNumber: job.order_number,
          quantity: job.quantity,
          produced: job.produced_quantity || undefined,
          status: job.status as "ready" | "production" | "paused" | "completed",
          priority: job.priority as "normal" | "high" | "urgent",
          technique: technique?.name,
          techniqueColor: technique?.color,
          machine: machine?.name,
        };
      });
  }, [jobs, selectedMachineId, getTechniqueById, getMachineById]);

  const selectedMachine = selectedMachineId 
    ? getMachineById(selectedMachineId) 
    : null;

  const handleStartProduction = async (jobId: string) => {
    const job = jobs?.find(j => j.id === jobId);
    if (!job) return;
    
    try {
      await updateStatus.mutateAsync({ jobId, status: "production" });
      notifyStatusChange(job.client, job.status, "production");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error starting production:", error);
    }
  };

  const handlePauseProduction = async (jobId: string) => {
    const job = jobs?.find(j => j.id === jobId);
    if (!job) return;
    
    try {
      await updateStatus.mutateAsync({ jobId, status: "paused" });
      notifyStatusChange(job.client, job.status, "paused");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error pausing production:", error);
    }
  };

  const handleCompleteProduction = (jobId: string) => {
    setProductionJobId(jobId);
    setIsProductionModalOpen(true);
  };

  const handleRefresh = async () => {
    await refetchAll();
  };

  const productionJob = productionJobId 
    ? jobs?.find(j => j.id === productionJobId) 
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <ProductionRegistrationModal
        job={productionJob || null}
        open={isProductionModalOpen}
        onOpenChange={setIsProductionModalOpen}
      />
      
      {/* Exit button - only visible when not in fullscreen */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/operator")}
          className="opacity-50 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Sair do Kiosk
        </Button>
      </div>
      
      <KioskMode
        jobs={kioskJobs}
        machineName={selectedMachine?.name || "Todas as Máquinas"}
        operatorName={profile?.full_name || undefined}
        onStartProduction={handleStartProduction}
        onPauseProduction={handlePauseProduction}
        onCompleteProduction={handleCompleteProduction}
        onRefresh={handleRefresh}
        isOnline={isOnline}
      />
    </>
  );
}
