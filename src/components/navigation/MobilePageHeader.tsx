import { ReactNode, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDevice } from '@/hooks/use-device';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PageAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  actions?: PageAction[];
  rightContent?: ReactNode;
  className?: string;
}

/**
 * MobilePageHeader - Contextual header for individual pages
 * 
 * Shows page title, optional back button, and action menu.
 * Integrates with the app's navigation system.
 */
export function MobilePageHeader({
  title,
  subtitle,
  showBack = true,
  backTo,
  actions = [],
  rightContent,
  className,
}: MobilePageHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useDevice();
  const { trigger } = useHapticFeedback();

  const handleBack = useCallback(() => {
    trigger('light');
    if (backTo) {
      navigate(backTo);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [backTo, navigate, trigger]);

  const handleAction = useCallback((action: PageAction) => {
    trigger('light');
    action.onClick();
  }, [trigger]);

  if (!isMobile) return null;

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'sticky top-0 z-30',
        'flex items-center gap-3 h-14 px-3',
        'bg-background/95 backdrop-blur-xl border-b border-border',
        className
      )}
    >
      {/* Back button */}
      {showBack && (
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10 shrink-0"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </motion.div>
      )}

      {/* Title section */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-foreground truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right content or actions */}
      <div className="flex items-center gap-1 shrink-0">
        {rightContent}
        
        {actions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                aria-label="Mais opções"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => handleAction(action)}
                    className={cn(
                      'gap-2',
                      action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.header>
  );
}

/**
 * MobilePageHeaderSpacer - Adds space to compensate for sticky header
 */
export function MobilePageHeaderSpacer({ className }: { className?: string }) {
  const { isMobile } = useDevice();

  if (!isMobile) return null;

  return <div className={cn('h-14', className)} />;
}

export default MobilePageHeader;
