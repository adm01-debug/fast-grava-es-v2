import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Só mostramos o botão se não estivermos na home ou no dashboard principal
    const isHome = location.pathname === "/" || location.pathname === "/operator";
    setCanGoBack(!isHome);
  }, [location]);

  if (!canGoBack) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(-1)}
      className={cn(
        "gap-1 px-2 h-8 text-muted-foreground hover:text-foreground transition-all",
        className
      )}
      aria-label="Voltar para a página anterior"
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="text-xs font-medium">Voltar</span>
    </Button>
  );
}
