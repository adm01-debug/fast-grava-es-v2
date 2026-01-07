import React, { useState, useCallback } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Info, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2,
  Lightbulb,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// ENHANCED TOOLTIP
// ============================================

interface EnhancedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
}

export function EnhancedTooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  className
}: EnhancedTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className={cn(
            'animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// INFO TOOLTIP (com ícone integrado)
// ============================================

interface InfoTooltipProps {
  content: React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'tip';
  side?: 'top' | 'right' | 'bottom' | 'left';
  iconSize?: number;
  className?: string;
}

export function InfoTooltip({
  content,
  variant = 'info',
  side = 'top',
  iconSize = 14,
  className
}: InfoTooltipProps) {
  const icons = {
    info: <Info className="text-blue-500" style={{ width: iconSize, height: iconSize }} />,
    warning: <AlertTriangle className="text-amber-500" style={{ width: iconSize, height: iconSize }} />,
    success: <CheckCircle2 className="text-green-500" style={{ width: iconSize, height: iconSize }} />,
    tip: <Lightbulb className="text-yellow-500" style={{ width: iconSize, height: iconSize }} />
  };

  const bgColors = {
    info: 'bg-blue-500/10 border-blue-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
    success: 'bg-green-500/10 border-green-500/20',
    tip: 'bg-yellow-500/10 border-yellow-500/20'
  };

  return (
    <EnhancedTooltip
      content={
        <div className={cn('max-w-xs', bgColors[variant], 'border rounded-lg p-2')}>
          {content}
        </div>
      }
      side={side}
      className={className}
    >
      <span className="inline-flex cursor-help ml-1">
        {icons[variant]}
      </span>
    </EnhancedTooltip>
  );
}

// ============================================
// RICH TOOLTIP (com título, descrição, ações)
// ============================================

interface RichTooltipProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function RichTooltip({
  children,
  title,
  description,
  icon,
  actions,
  side = 'top',
  className
}: RichTooltipProps) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent 
        side={side}
        className={cn('w-80', className)}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{title}</h4>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>

          {actions && actions.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'ghost'}
                  onClick={action.onClick}
                  className="h-7 text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

// ============================================
// FEATURE TOOLTIP (para onboarding/features)
// ============================================

interface FeatureTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  learnMoreUrl?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function FeatureTooltip({
  children,
  title,
  description,
  badge,
  learnMoreUrl,
  side = 'top'
}: FeatureTooltipProps) {
  return (
    <HoverCard openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side={side} className="w-72">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{title}</h4>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Saiba mais
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

// ============================================
// COPYABLE TOOLTIP
// ============================================

interface CopyableTooltipProps {
  children: React.ReactNode;
  copyText: string;
  label?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function CopyableTooltip({
  children,
  copyText,
  label = 'Clique para copiar',
  side = 'top'
}: CopyableTooltipProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [copyText]);

  return (
    <EnhancedTooltip
      content={
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="copied"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 text-green-500"
              >
                <Check className="w-3 h-3" />
                <span>Copiado!</span>
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{label}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }
      side={side}
    >
      <span onClick={handleCopy} className="cursor-pointer">
        {children}
      </span>
    </EnhancedTooltip>
  );
}

// ============================================
// CONDITIONAL TOOLTIP
// ============================================

interface ConditionalTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  condition: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function ConditionalTooltip({
  children,
  content,
  condition,
  side = 'top'
}: ConditionalTooltipProps) {
  if (!condition) {
    return <>{children}</>;
  }

  return (
    <EnhancedTooltip content={content} side={side}>
      {children}
    </EnhancedTooltip>
  );
}

// ============================================
// TRUNCATED TEXT WITH TOOLTIP
// ============================================

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function TruncatedText({
  text,
  maxLength = 50,
  className,
  side = 'top'
}: TruncatedTextProps) {
  const isTruncated = text.length > maxLength;
  const displayText = isTruncated ? `${text.slice(0, maxLength)}...` : text;

  if (!isTruncated) {
    return <span className={className}>{text}</span>;
  }

  return (
    <EnhancedTooltip content={text} side={side}>
      <span className={cn('cursor-help', className)}>{displayText}</span>
    </EnhancedTooltip>
  );
}

// ============================================
// HELP ICON WITH TOOLTIP
// ============================================

interface HelpTooltipProps {
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HelpTooltip({
  content,
  side = 'top',
  size = 'sm',
  className
}: HelpTooltipProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <EnhancedTooltip content={content} side={side}>
      <span className={cn('inline-flex cursor-help text-muted-foreground hover:text-foreground transition-colors', className)}>
        <HelpCircle className={sizes[size]} />
      </span>
    </EnhancedTooltip>
  );
}
