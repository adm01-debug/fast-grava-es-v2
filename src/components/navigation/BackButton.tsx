import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import { useDevice } from "@/hooks/use-device";
import { motion, AnimatePresence } from "framer-motion";


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
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-24 left-6 z-[60] md:hidden"
        >
          <Button
            variant="default"
            size="icon"
            onClick={handleBack}
            className={cn(
              "h-14 w-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all active:scale-90 touch-target",
              "bg-background/80 backdrop-blur-2xl border border-primary/20 text-primary",
              "hover:bg-background/90 hover:border-primary/40",
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
        "gap-1.5 px-3 h-9 text-muted-foreground hover:text-foreground hover:bg-primary/5 active:scale-95 transition-all border border-transparent hover:border-border/40 rounded-lg",
        className
      )}
      aria-label="Voltar para a página anterior"
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="text-sm font-bold tracking-tight">Voltar</span>
    </Button>
  );
}

