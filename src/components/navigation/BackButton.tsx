import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { useDevice } from "@/hooks/use-device";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";



interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { trigger } = useHapticFeedback();
  const { isMobile } = useDevice();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Only show if not on home/dashboard
    const isHome = location.pathname === "/" || location.pathname === "/operator" || location.pathname === "/auth";
    setCanGoBack(!isHome);
  }, [location]);

  const handleBack = useCallback(() => {
    trigger('light');
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate, trigger]);

  if (!canGoBack) return null;

  if (isMobile) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.9 }}
          className="fixed bottom-28 left-6 z-[60] md:hidden no-export"
        >
          <Button
            variant="default"
            size="icon"
            onClick={handleBack}
            className={cn(
              "h-14 w-14 rounded-2xl shadow-xl transition-all active:scale-90 touch-target",
              "bg-primary text-primary-foreground border-2 border-white/10",
              "hover:brightness-110",
              className
            )}
            aria-label="Voltar"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={cn(
        "gap-2 px-3 h-10 text-muted-foreground hover:text-primary hover:bg-primary/5 active:scale-95 transition-all border-2 border-transparent hover:border-primary/10 rounded-xl group/back",
        className
      )}
      aria-label="Voltar para a página anterior"
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted/30 group-hover/back:bg-primary/20 transition-colors">
        <ChevronLeft className="h-4 w-4 transition-transform group-hover/back:-translate-x-0.5" />
      </div>
      <span className="text-sm font-bold tracking-tight">Voltar</span>
    </Button>
  );
}
