import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Maximize,
  Minimize,
  X,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface KioskJob {
  id: string;
  client: string;
  product: string;
  quantity: number;
  produced?: number;
  status: "ready" | "production" | "paused" | "completed";
  priority?: "normal" | "high" | "urgent";
  technique?: string;
  techniqueColor?: string;
  machine?: string;
}

interface KioskModeProps {
  jobs: KioskJob[];
  machineName?: string;
  operatorName?: string;
  onStartProduction?: (jobId: string) => void;
  onPauseProduction?: (jobId: string) => void;
  onCompleteProduction?: (jobId: string) => void;
  onRefresh?: () => Promise<void>;
  isOnline?: boolean;
}

/**
 * Modo Kiosk - Tela fullscreen otimizada para operadores no chão de fábrica
 * Features:
 * - Fullscreen toggle
 * - Relógio em tempo real
 * - Status de conexão
 * - Cards grandes e touch-friendly
 * - Auto-refresh
 */
export function KioskMode({
  jobs,
  machineName = "Máquina",
  operatorName,
  onStartProduction,
  onPauseProduction,
  onCompleteProduction,
  onRefresh,
  isOnline = true,
}: KioskModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Clock update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!onRefresh) return;
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const playSound = (type: "start" | "complete" | "alert") => {
    if (!soundEnabled) return;
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = type === "complete" ? 800 : type === "alert" ? 400 : 600;
    oscillator.type = "sine";
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
  };

  const inProduction = jobs.find(j => j.status === "production");
  const nextJobs = jobs.filter(j => j.status === "ready").slice(0, 3);
  const pausedJob = jobs.find(j => j.status === "paused");

  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="text-lg font-semibold">{machineName}</div>
          
          {operatorName && (
            <>
              <div className="h-6 w-px bg-border" />
              <div className="text-sm text-muted-foreground">
                Operador: <span className="font-medium text-foreground">{operatorName}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-2xl font-mono font-bold text-primary">
            {format(currentTime, "HH:mm:ss")}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Production - Large Card */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Play className="h-6 w-6 text-cyan-400" />
            Produção Atual
          </h2>
          
          {inProduction ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[calc(100%-2rem)]"
            >
              <Card className="h-full border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-transparent">
                <CardContent className="p-8 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-3xl font-bold text-foreground mb-2">
                          {inProduction.client}
                        </h3>
                        <p className="text-xl text-muted-foreground">
                          {inProduction.product}
                        </p>
                      </div>
                      <Badge className="text-lg px-4 py-2 bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                        Em Produção
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mt-8">
                      <div>
                        <p className="text-muted-foreground text-lg">Quantidade Total</p>
                        <p className="text-4xl font-bold text-foreground">
                          {inProduction.quantity.toLocaleString()}
                        </p>
                      </div>
                      {inProduction.produced !== undefined && (
                        <div>
                          <p className="text-muted-foreground text-lg">Produzido</p>
                          <p className="text-4xl font-bold text-green-500">
                            {inProduction.produced.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {inProduction.technique && (
                      <div className="mt-6">
                        <Badge 
                          variant="outline" 
                          className="text-lg px-4 py-2"
                          style={{ 
                            borderColor: inProduction.techniqueColor,
                            color: inProduction.techniqueColor 
                          }}
                        >
                          {inProduction.technique}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 h-16 text-lg border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                      onClick={() => {
                        playSound("alert");
                        onPauseProduction?.(inProduction.id);
                      }}
                    >
                      <Pause className="h-6 w-6 mr-2" />
                      Pausar
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 h-16 text-lg bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        playSound("complete");
                        onCompleteProduction?.(inProduction.id);
                      }}
                    >
                      <CheckCircle2 className="h-6 w-6 mr-2" />
                      Finalizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : pausedJob ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[calc(100%-2rem)]"
            >
              <Card className="h-full border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent">
                <CardContent className="p-8 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-3xl font-bold text-foreground mb-2">
                          {pausedJob.client}
                        </h3>
                        <p className="text-xl text-muted-foreground">
                          {pausedJob.product}
                        </p>
                      </div>
                      <Badge className="text-lg px-4 py-2 bg-orange-500/20 text-orange-400 border-orange-500/50">
                        Pausado
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-8">
                      <AlertTriangle className="h-12 w-12 text-orange-400" />
                      <p className="text-xl text-muted-foreground">
                        Produção pausada. Clique para retomar.
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="lg"
                    className="w-full h-16 text-lg gradient-primary"
                    onClick={() => {
                      playSound("start");
                      onStartProduction?.(pausedJob.id);
                    }}
                  >
                    <Play className="h-6 w-6 mr-2" />
                    Retomar Produção
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="h-[calc(100%-2rem)] border-dashed">
              <CardContent className="h-full flex flex-col items-center justify-center">
                <Clock className="h-24 w-24 text-muted-foreground/30 mb-6" />
                <p className="text-2xl text-muted-foreground">
                  Nenhuma produção em andamento
                </p>
                <p className="text-muted-foreground/60 mt-2">
                  Selecione um job da fila para iniciar
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Next Jobs Queue */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-6 w-6 text-amber-400" />
            Próximos
          </h2>
          
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {nextJobs.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Fila vazia</p>
                  </CardContent>
                </Card>
              ) : (
                nextJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "cursor-pointer hover:border-primary/50 transition-colors",
                      job.priority === "urgent" && "border-red-500/30",
                      job.priority === "high" && "border-orange-500/30"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-lg">{job.client}</p>
                            <p className="text-muted-foreground">{job.product}</p>
                          </div>
                          {job.priority === "urgent" && (
                            <Badge variant="destructive" className="shrink-0">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Urgente
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm text-muted-foreground">
                            {job.quantity.toLocaleString()} peças
                          </span>
                          
                          {!inProduction && !pausedJob && (
                            <Button
                              size="sm"
                              onClick={() => {
                                playSound("start");
                                onStartProduction?.(job.id);
                              }}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Iniciar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer Stats */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-muted-foreground">Em Produção:</span>
            <span className="font-semibold">{jobs.filter(j => j.status === "production").length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Aguardando:</span>
            <span className="font-semibold">{jobs.filter(j => j.status === "ready").length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">Pausados:</span>
            <span className="font-semibold">{jobs.filter(j => j.status === "paused").length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Concluídos Hoje:</span>
            <span className="font-semibold">{jobs.filter(j => j.status === "completed").length}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Botão para ativar modo kiosk
 */
export function KioskModeButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="gap-2">
      <Maximize className="h-4 w-4" />
      Modo Kiosk
    </Button>
  );
}
