import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Check, Clipboard, Link, Code, FileText, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type ClipboardContentType = 'text' | 'code' | 'link' | 'image' | 'json' | 'html';

interface ClipboardItem {
  id: string;
  content: string;
  type: ClipboardContentType;
  timestamp: Date;
  label?: string;
}

interface ClipboardContextValue {
  copy: (content: string, options?: CopyOptions) => Promise<boolean>;
  paste: () => Promise<string>;
  history: ClipboardItem[];
  clearHistory: () => void;
  lastCopied: ClipboardItem | null;
}

interface CopyOptions {
  type?: ClipboardContentType;
  label?: string;
  showToast?: boolean;
  toastMessage?: string;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ClipboardContext = createContext<ClipboardContextValue | null>(null);

export function useClipboardSystem() {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboardSystem must be used within ClipboardProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface ClipboardProviderProps {
  children: React.ReactNode;
  maxHistory?: number;
}

export function ClipboardProvider({
  children,
  maxHistory = 20,
}: ClipboardProviderProps) {
  const [history, setHistory] = useState<ClipboardItem[]>(() => {
    const saved = localStorage.getItem('clipboard-history');
    return saved ? JSON.parse(saved) : [];
  });

  const lastCopied = history[0] || null;

  useEffect(() => {
    localStorage.setItem('clipboard-history', JSON.stringify(history));
  }, [history]);

  const copy = useCallback(async (
    content: string,
    options: CopyOptions = {}
  ): Promise<boolean> => {
    const {
      type = 'text',
      label,
      showToast = true,
      toastMessage,
    } = options;

    try {
      await navigator.clipboard.writeText(content);

      const item: ClipboardItem = {
        id: `clip-${Date.now()}`,
        content,
        type,
        timestamp: new Date(),
        label,
      };

      setHistory(prev => [item, ...prev.filter(i => i.content !== content)].slice(0, maxHistory));

      if (showToast) {
        toast.success(toastMessage || 'Copiado para a área de transferência', {
          duration: 2000,
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Falha ao copiar');
      return false;
    }
  }, [maxHistory]);

  const paste = useCallback(async (): Promise<string> => {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.error('Failed to paste:', error);
      toast.error('Falha ao colar');
      return '';
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('clipboard-history');
  }, []);

  return (
    <ClipboardContext.Provider
      value={{
        copy,
        paste,
        history,
        clearHistory,
        lastCopied,
      }}
    >
      {children}
    </ClipboardContext.Provider>
  );
}

// ============================================================================
// COPY BUTTON
// ============================================================================

interface CopyButtonProps {
  content: string;
  type?: ClipboardContentType;
  label?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  onCopy?: () => void;
}

export function CopyButton({
  content,
  type = 'text',
  label,
  className,
  variant = 'outline',
  size = 'sm',
  showLabel = false,
  onCopy,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { copy } = useClipboardSystem();

  const handleCopy = async () => {
    const success = await copy(content, { type, label });
    if (success) {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn('transition-all', className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          {showLabel && <span className="ml-2">Copiado!</span>}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {showLabel && <span className="ml-2">Copiar</span>}
        </>
      )}
    </Button>
  );
}

// ============================================================================
// COPY TO CLIPBOARD (Wrapper)
// ============================================================================

interface CopyToClipboardProps {
  children: React.ReactNode;
  content: string;
  type?: ClipboardContentType;
  label?: string;
  onCopy?: () => void;
}

export function CopyToClipboard({
  children,
  content,
  type = 'text',
  label,
  onCopy,
}: CopyToClipboardProps) {
  const { copy } = useClipboardSystem();

  const handleClick = async () => {
    await copy(content, { type, label });
    onCopy?.();
  };

  return (
    <span onClick={handleClick} className="cursor-pointer">
      {children}
    </span>
  );
}

// ============================================================================
// CODE BLOCK WITH COPY
// ============================================================================

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
  maxHeight?: string;
}

export function CodeBlock({
  code,
  language = 'typescript',
  showLineNumbers = false,
  className,
  maxHeight = '400px',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { copy } = useClipboardSystem();

  const handleCopy = async () => {
    const success = await copy(code, { type: 'code', label: `${language} code` });
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = code.split('\n');

  return (
    <div className={cn('relative group rounded-lg overflow-hidden', className)}>
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              <span className="text-xs">Copiar</span>
            </>
          )}
        </Button>
      </div>

      {language && (
        <div className="absolute top-2 left-2 z-10">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {language}
          </span>
        </div>
      )}

      <div
        className="bg-muted/50 p-4 pt-10 overflow-auto font-mono text-sm"
        style={{ maxHeight }}
      >
        <pre className="m-0">
          {showLineNumbers ? (
            <table className="border-collapse">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td className="pr-4 text-muted-foreground select-none text-right w-8">
                      {i + 1}
                    </td>
                    <td className="whitespace-pre">{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
}

// ============================================================================
// CLIPBOARD HISTORY
// ============================================================================

interface ClipboardHistoryProps {
  className?: string;
  maxItems?: number;
  onSelect?: (item: ClipboardItem) => void;
}

export function ClipboardHistory({
  className,
  maxItems = 10,
  onSelect,
}: ClipboardHistoryProps) {
  const { history, clearHistory, copy } = useClipboardSystem();
  const displayItems = history.slice(0, maxItems);

  const getIcon = (type: ClipboardContentType) => {
    switch (type) {
      case 'code':
        return <Code className="h-4 w-4" />;
      case 'link':
        return <Link className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'json':
        return <FileText className="h-4 w-4" />;
      default:
        return <Clipboard className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return d.toLocaleDateString();
  };

  if (displayItems.length === 0) {
    return (
      <div className={cn('p-8 text-center text-muted-foreground', className)}>
        <Clipboard className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum item copiado ainda</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium">Histórico</h4>
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          <X className="h-3 w-3 mr-1" />
          Limpar
        </Button>
      </div>

      <div className="space-y-1">
        {displayItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              copy(item.content, { type: item.type, showToast: true });
              onSelect?.(item);
            }}
            className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left group"
          >
            <div className="text-muted-foreground mt-0.5">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">
                {item.label || item.content.slice(0, 50)}
                {item.content.length > 50 && '...'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTime(item.timestamp)}
              </p>
            </div>
            <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COPY LINK BUTTON
// ============================================================================

interface CopyLinkButtonProps {
  url?: string;
  className?: string;
}

export function CopyLinkButton({ url, className }: CopyLinkButtonProps) {
  const { copy } = useClipboardSystem();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const linkToCopy = url || window.location.href;
    const success = await copy(linkToCopy, {
      type: 'link',
      label: 'Link da página',
      toastMessage: 'Link copiado!',
    });

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={className}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2 text-green-500" />
          Copiado!
        </>
      ) : (
        <>
          <Link className="h-4 w-4 mr-2" />
          Copiar Link
        </>
      )}
    </Button>
  );
}

// ============================================================================
// USE COPY HOOK
// ============================================================================

export function useCopy() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);

      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { copied, copy };
}

export default ClipboardProvider;
