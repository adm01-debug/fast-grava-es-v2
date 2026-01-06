import { ReactNode, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  HelpCircle, 
  Info, 
  Lightbulb, 
  ChevronRight, 
  ChevronLeft,
  X,
  Check,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Keyboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// HELP TOOLTIP
// ============================================

interface HelpTooltipProps {
  children: ReactNode;
  content: string;
  title?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  variant?: 'default' | 'info' | 'tip' | 'warning';
  showIcon?: boolean;
  className?: string;
}

export function HelpTooltip({
  children,
  content,
  title,
  side = 'top',
  variant = 'default',
  showIcon = true,
  className,
}: HelpTooltipProps) {
  const variantStyles = {
    default: 'bg-popover text-popover-foreground',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300',
    tip: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300',
    warning: 'bg-destructive/10 border-destructive/20 text-destructive',
  };

  const Icon = variant === 'tip' ? Lightbulb : variant === 'warning' ? Info : HelpCircle;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex items-center gap-1 cursor-help", className)}>
            {children}
            {showIcon && (
              <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className={cn("max-w-xs", variantStyles[variant])}
        >
          {title && <p className="font-semibold text-sm mb-1">{title}</p>}
          <p className="text-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// HELP POPOVER (More detailed help)
// ============================================

interface HelpLink {
  label: string;
  url: string;
  type?: 'doc' | 'video' | 'article';
}

interface HelpPopoverProps {
  children: ReactNode;
  title: string;
  content: string | ReactNode;
  links?: HelpLink[];
  shortcuts?: { key: string; description: string }[];
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function HelpPopover({
  children,
  title,
  content,
  links,
  shortcuts,
  side = 'right',
  className,
}: HelpPopoverProps) {
  const getLinkIcon = (type?: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      default: return BookOpen;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className={cn("cursor-pointer", className)}>
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent side={side} className="w-80">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">{title}</h4>
              <div className="text-xs text-muted-foreground mt-1">
                {typeof content === 'string' ? <p>{content}</p> : content}
              </div>
            </div>
          </div>

          {shortcuts && shortcuts.length > 0 && (
            <div className="border-t pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Keyboard className="h-3 w-3" />
                Atalhos
              </p>
              <div className="space-y-1">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{shortcut.description}</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {links && links.length > 0 && (
            <div className="border-t pt-2 space-y-1">
              {links.map((link, index) => {
                const LinkIcon = getLinkIcon(link.type);
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <LinkIcon className="h-3 w-3" />
                    {link.label}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================
// CONTEXTUAL TIP (Inline tip component)
// ============================================

interface ContextualTipProps {
  content: string;
  variant?: 'info' | 'tip' | 'success' | 'warning';
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function ContextualTip({
  content,
  variant = 'tip',
  dismissible = true,
  onDismiss,
  action,
  className,
}: ContextualTipProps) {
  const [dismissed, setDismissed] = useState(false);

  const variantConfig = {
    info: {
      bg: 'bg-blue-500/10 border-blue-500/20',
      text: 'text-blue-700 dark:text-blue-300',
      icon: Info,
    },
    tip: {
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-700 dark:text-amber-300',
      icon: Lightbulb,
    },
    success: {
      bg: 'bg-green-500/10 border-green-500/20',
      text: 'text-green-700 dark:text-green-300',
      icon: Check,
    },
    warning: {
      bg: 'bg-destructive/10 border-destructive/20',
      text: 'text-destructive',
      icon: Info,
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-start gap-2 p-3 rounded-lg border",
        config.bg,
        config.text,
        className
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1 text-sm">
        <p>{content}</p>
        {action && (
          <Button
            variant="link"
            size="sm"
            className={cn("h-auto p-0 mt-1", config.text)}
            onClick={action.onClick}
          >
            {action.label}
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 -mt-0.5 -mr-1"
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </motion.div>
  );
}

// ============================================
// FEATURE SPOTLIGHT
// ============================================

interface SpotlightProps {
  targetSelector: string;
  title: string;
  description: string;
  step?: number;
  totalSteps?: number;
  onNext?: () => void;
  onPrev?: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export function FeatureSpotlight({
  targetSelector,
  title,
  description,
  step = 1,
  totalSteps = 1,
  onNext,
  onPrev,
  onSkip,
  onComplete,
  position = 'bottom',
}: SpotlightProps) {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [targetSelector]);

  const isLastStep = step === totalSteps;

  const getCardPosition = () => {
    const padding = 16;
    switch (position) {
      case 'top':
        return { bottom: `calc(100% - ${coords.top - padding}px)`, left: coords.left };
      case 'right':
        return { top: coords.top, left: coords.left + coords.width + padding };
      case 'left':
        return { top: coords.top, right: `calc(100% - ${coords.left - padding}px)` };
      default:
        return { top: coords.top + coords.height + padding, left: coords.left };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-spotlight bg-black/50" onClick={onSkip} />
      
      {/* Spotlight hole */}
      <div
        className="fixed z-spotlight pointer-events-none"
        style={{
          top: coords.top - 8,
          left: coords.left - 8,
          width: coords.width + 16,
          height: coords.height + 16,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          borderRadius: '8px',
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed z-spotlight-content"
        style={getCardPosition()}
      >
        <Card className="w-80 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{title}</CardTitle>
              {totalSteps > 1 && (
                <Badge variant="secondary" className="text-xs">
                  {step}/{totalSteps}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm text-muted-foreground">{description}</p>
            {totalSteps > 1 && (
              <Progress value={(step / totalSteps) * 100} className="h-1 mt-3" />
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Pular
            </Button>
            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="outline" size="sm" onClick={onPrev}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
              <Button size="sm" onClick={isLastStep ? onComplete : onNext}>
                {isLastStep ? 'Concluir' : 'Próximo'}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  );
}

// ============================================
// GUIDED TOUR HOOK
// ============================================

export interface TourStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

interface UseTourOptions {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
  autoStart?: boolean;
}

export function useTour({ tourId, steps, onComplete, autoStart = false }: UseTourOptions) {
  const storageKey = `tour_${tourId}_completed`;
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (autoStart) {
      const completed = localStorage.getItem(storageKey);
      if (!completed) {
        setIsActive(true);
      }
    }
  }, [autoStart, storageKey]);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const next = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(storageKey, 'true');
  }, [storageKey]);

  const complete = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(storageKey, 'true');
    onComplete?.();
  }, [storageKey, onComplete]);

  const reset = useCallback(() => {
    localStorage.removeItem(storageKey);
    setCurrentStep(0);
  }, [storageKey]);

  return {
    isActive,
    currentStep: steps[currentStep],
    stepNumber: currentStep + 1,
    totalSteps: steps.length,
    start,
    next,
    prev,
    skip,
    complete,
    reset,
  };
}

// ============================================
// TOUR PROVIDER
// ============================================

interface TourProviderProps {
  tourId: string;
  steps: TourStep[];
  children: ReactNode;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function TourProvider({
  tourId,
  steps,
  children,
  onComplete,
  autoStart = false,
}: TourProviderProps) {
  const tour = useTour({ tourId, steps, onComplete, autoStart });

  return (
    <>
      {children}
      <AnimatePresence>
        {tour.isActive && tour.currentStep && (
          <FeatureSpotlight
            targetSelector={tour.currentStep.target}
            title={tour.currentStep.title}
            description={tour.currentStep.description}
            position={tour.currentStep.position}
            step={tour.stepNumber}
            totalSteps={tour.totalSteps}
            onNext={tour.next}
            onPrev={tour.prev}
            onSkip={tour.skip}
            onComplete={tour.complete}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================
// WHATS NEW BADGE
// ============================================

interface WhatsNewBadgeProps {
  feature: string;
  children: ReactNode;
  description?: string;
  className?: string;
}

export function WhatsNewBadge({
  feature,
  children,
  description,
  className,
}: WhatsNewBadgeProps) {
  const storageKey = `seen_feature_${feature}`;
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      setIsNew(true);
    }
  }, [storageKey]);

  const markAsSeen = () => {
    localStorage.setItem(storageKey, 'true');
    setIsNew(false);
  };

  if (!isNew) return <>{children}</>;

  return (
    <Popover onOpenChange={(open) => !open && markAsSeen()}>
      <PopoverTrigger asChild>
        <div className={cn("relative cursor-pointer", className)}>
          {children}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-3 w-3"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </motion.span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-sm">Novo!</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
