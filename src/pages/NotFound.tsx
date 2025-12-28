import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileHeader, MobileHeaderSpacer } from "@/components/navigation/MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <MobileHeader 
        title="Página não encontrada" 
        showBack={true}
        showHome={false}
      />
      <MobileHeaderSpacer />
      
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          {/* 404 Illustration */}
          <div className="relative">
            <div className="text-[120px] md:text-[180px] font-bold text-muted-foreground/10 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Página não encontrada
            </h1>
            <p className="text-muted-foreground">
              A página que você está procurando não existe ou foi movida.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button asChild className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Ir para o Início
              </Link>
            </Button>
          </div>

          {/* Path info for debugging */}
          <p className="text-xs text-muted-foreground/60 font-mono bg-muted/30 px-3 py-2 rounded-lg">
            Caminho: {location.pathname}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
