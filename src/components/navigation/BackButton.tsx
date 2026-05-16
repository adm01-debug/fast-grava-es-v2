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
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="fixed top-2.5 left-3 z-[60] md:hidden"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className={cn(
              "h-9 w-9 rounded-full bg-background/60 backdrop-blur-md border border-border/40 shadow-sm",
              "text-foreground active:scale-90 transition-all touch-target",
              className
            )}
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
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

