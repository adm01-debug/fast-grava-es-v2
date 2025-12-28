import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showHome?: boolean;
  backTo?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  className?: string;
  transparent?: boolean;
}

/**
 * MobileHeader - Header reutilizável para páginas mobile
 * 
 * Use para páginas que não usam MainLayout ou precisam de navegação adicional.
 * Fornece botão voltar, título e ações personalizadas.
 */
export function MobileHeader({
  title,
  showBack = true,
  showHome = false,
  backTo,
  leftAction,
  rightAction,
  className,
  transparent = false,
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  // Always render on mobile, optionally on desktop
  if (!isMobile) return null;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40',
        'flex items-center justify-between h-14 px-4',
        'safe-area-top',
        transparent
          ? 'bg-transparent'
          : 'bg-background/95 backdrop-blur-lg border-b border-border',
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-2 min-w-[48px]">
        {leftAction || (
          <>
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-10 w-10 touch-target"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            {showHome && !showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleHome}
                className="h-10 w-10 touch-target"
                aria-label="Ir para início"
              >
                <Home className="h-5 w-5" />
              </Button>
            )}
          </>
        )}
      </div>

      {/* Title */}
      {title && (
        <h1 className="text-base font-semibold text-foreground truncate flex-1 text-center">
          {title}
        </h1>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-2 min-w-[48px] justify-end">
        {rightAction}
      </div>
    </header>
  );
}

/**
 * MobileHeaderSpacer - Adiciona espaço para compensar o header fixo
 */
export function MobileHeaderSpacer({ className }: { className?: string }) {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return <div className={cn('h-14 safe-area-top', className)} />;
}

export default MobileHeader;
