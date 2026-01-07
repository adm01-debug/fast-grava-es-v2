import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Link, Share2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Copy to clipboard hook
export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = React.useState<string | null>(null);
  const [isCopied, setIsCopied] = React.useState(false);

  const copy = React.useCallback(async (text: string) => {
    if (!navigator.clipboard) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        setCopiedText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        return true;
      } catch {
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);

  const reset = React.useCallback(() => {
    setCopiedText(null);
    setIsCopied(false);
  }, []);

  return { copiedText, isCopied, copy, reset };
}

// Copy button component
interface CopyButtonProps {
  text: string;
  label?: string;
  successMessage?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function CopyButton({
  text,
  label,
  successMessage = 'Copiado!',
  variant = 'outline',
  size = 'sm',
  className,
}: CopyButtonProps) {
  const { isCopied, copy } = useCopyToClipboard();

  const handleCopy = async () => {
    const success = await copy(text);
    if (success) {
      toast.success(successMessage);
    } else {
      toast.error('Falha ao copiar');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("gap-2", className)}
    >
      <AnimatePresence mode="wait">
        {isCopied ? (
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Check className="h-4 w-4 text-success" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Copy className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
      {label && <span>{isCopied ? 'Copiado!' : label}</span>}
    </Button>
  );
}

// Copyable text component
interface CopyableTextProps {
  text: string;
  displayText?: string;
  truncate?: boolean;
  className?: string;
}

export function CopyableText({ text, displayText, truncate = true, className }: CopyableTextProps) {
  const { isCopied, copy } = useCopyToClipboard();

  const handleCopy = async () => {
    const success = await copy(text);
    if (success) {
      toast.success('Texto copiado!');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "group inline-flex items-center gap-1.5 font-mono text-sm bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors",
        truncate && "max-w-full",
        className
      )}
    >
      <span className={cn(truncate && "truncate")}>{displayText || text}</span>
      <AnimatePresence mode="wait">
        {isCopied ? (
          <motion.span
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Check className="h-3 w-3 text-success flex-shrink-0" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy className="h-3 w-3 flex-shrink-0" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// Copy input with button
interface CopyInputProps {
  value: string;
  label?: string;
  className?: string;
  readOnly?: boolean;
}

export function CopyInput({ value, label, className, readOnly = true }: CopyInputProps) {
  const { isCopied, copy } = useCopyToClipboard();

  const handleCopy = async () => {
    const success = await copy(value);
    if (success) {
      toast.success('Copiado para a área de transferência!');
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex gap-2">
        <Input
          value={value}
          readOnly={readOnly}
          className="font-mono text-sm"
        />
        <Button variant="outline" size="icon" onClick={handleCopy}>
          {isCopied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

// Share popover
interface SharePopoverProps {
  url: string;
  title?: string;
  text?: string;
  trigger?: React.ReactNode;
  className?: string;
}

export function SharePopover({ url, title, text, trigger, className }: SharePopoverProps) {
  const { copy } = useCopyToClipboard();
  const [canShare, setCanShare] = React.useState(false);

  React.useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);

  const handleNativeShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({ title, text, url });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  };

  const handleCopyLink = async () => {
    const success = await copy(url);
    if (success) {
      toast.success('Link copiado!');
    }
  };

  const shareOptions = [
    {
      name: 'Copiar link',
      icon: 'link' as const,
      action: handleCopyLink,
    },
    {
      name: 'WhatsApp',
      icon: 'whatsapp' as const,
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank'),
    },
    {
      name: 'Twitter',
      icon: 'twitter' as const,
      action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || '')}`, '_blank'),
    },
    {
      name: 'Email',
      icon: 'email' as const,
      action: () => window.open(`mailto:?subject=${encodeURIComponent(title || '')}&body=${encodeURIComponent(url)}`, '_blank'),
    },
  ];

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'link': return <Link className="h-4 w-4 mr-2" />;
      case 'whatsapp': return <span className="text-lg mr-2">📱</span>;
      case 'twitter': return <span className="text-lg mr-2">🐦</span>;
      case 'email': return <span className="text-lg mr-2">📧</span>;
      default: return null;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-1">
          {canShare && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar...
            </Button>
          )}
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              variant="ghost"
              className="w-full justify-start"
              onClick={option.action}
            >
              {getIcon(option.icon)}
              {option.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
