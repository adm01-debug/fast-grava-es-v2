import React, { useState, useMemo } from 'react';
import { Check, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================
// CODE BLOCK
// ============================================

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  maxHeight?: string;
  showCopy?: boolean;
  title?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language = 'text',
  showLineNumbers = true,
  highlightLines = [],
  maxHeight = '400px',
  showCopy = true,
  title,
  className
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const lines = code.split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("rounded-lg border bg-muted/50 overflow-hidden", className)}>
      {(title || showCopy) && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted">
          <div className="flex items-center gap-2">
            {title && <span className="text-sm font-medium">{title}</span>}
            <Badge variant="outline" className="text-xs">
              {language}
            </Badge>
          </div>
          {showCopy && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      )}
      <div
        className="overflow-auto p-4 font-mono text-sm"
        style={{ maxHeight }}
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, index) => (
              <tr
                key={index}
                className={cn(
                  highlightLines.includes(index + 1) && "bg-yellow-500/10"
                )}
              >
                {showLineNumbers && (
                  <td className="pr-4 text-right text-muted-foreground select-none w-8">
                    {index + 1}
                  </td>
                )}
                <td className="whitespace-pre">{line || ' '}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// JSON VIEWER
// ============================================

interface JsonViewerProps {
  data: unknown;
  initialExpanded?: boolean;
  maxDepth?: number;
  className?: string;
}

function JsonNode({
  keyName,
  value,
  depth,
  maxDepth,
  initialExpanded
}: {
  keyName?: string;
  value: unknown;
  depth: number;
  maxDepth: number;
  initialExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(initialExpanded && depth < maxDepth);

  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const isEmpty = isObject && Object.keys(value as object).length === 0;

  const getValueColor = (val: unknown) => {
    if (val === null) return 'text-muted-foreground';
    switch (typeof val) {
      case 'string': return 'text-green-600 dark:text-green-400';
      case 'number': return 'text-blue-600 dark:text-blue-400';
      case 'boolean': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-foreground';
    }
  };

  const formatValue = (val: unknown): string => {
    if (val === null) return 'null';
    if (typeof val === 'string') return `"${val}"`;
    return String(val);
  };

  if (!isObject) {
    return (
      <div className="flex items-center gap-1">
        {keyName && (
          <>
            <span className="text-foreground">"{keyName}"</span>
            <span className="text-muted-foreground">:</span>
          </>
        )}
        <span className={getValueColor(value)}>{formatValue(value)}</span>
      </div>
    );
  }

  const entries = Object.entries(value as object);
  const bracket = isArray ? ['[', ']'] : ['{', '}'];

  if (isEmpty) {
    return (
      <div className="flex items-center gap-1">
        {keyName && (
          <>
            <span className="text-foreground">"{keyName}"</span>
            <span className="text-muted-foreground">:</span>
          </>
        )}
        <span className="text-muted-foreground">{bracket[0]}{bracket[1]}</span>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 hover:bg-muted rounded px-1 -ml-1"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {keyName && (
          <>
            <span className="text-foreground">"{keyName}"</span>
            <span className="text-muted-foreground">:</span>
          </>
        )}
        <span className="text-muted-foreground">{bracket[0]}</span>
        {!expanded && (
          <>
            <span className="text-muted-foreground">...</span>
            <span className="text-muted-foreground">{bracket[1]}</span>
            <Badge variant="outline" className="ml-1 text-xs">
              {entries.length}
            </Badge>
          </>
        )}
      </button>
      {expanded && (
        <div className="ml-4 border-l pl-2">
          {entries.map(([key, val], index) => (
            <div key={key} className="flex items-start">
              <JsonNode
                keyName={isArray ? undefined : key}
                value={val}
                depth={depth + 1}
                maxDepth={maxDepth}
                initialExpanded={initialExpanded}
              />
              {index < entries.length - 1 && (
                <span className="text-muted-foreground">,</span>
              )}
            </div>
          ))}
          <span className="text-muted-foreground">{bracket[1]}</span>
        </div>
      )}
    </div>
  );
}

export function JsonViewer({
  data,
  initialExpanded = true,
  maxDepth = 5,
  className
}: JsonViewerProps) {
  return (
    <div className={cn(
      "font-mono text-sm p-4 rounded-lg border bg-muted/50 overflow-auto",
      className
    )}>
      <JsonNode
        value={data}
        depth={0}
        maxDepth={maxDepth}
        initialExpanded={initialExpanded}
      />
    </div>
  );
}

// ============================================
// MARKDOWN RENDERER (Simple)
// ============================================

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = useMemo(() => {
    let result = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre class="p-4 bg-muted rounded-lg overflow-auto my-4"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="px-1.5 py-0.5 bg-muted rounded text-sm">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Unordered lists
      .replace(/^\s*[-*]\s+(.*)$/gim, '<li class="ml-4">$1</li>')
      // Ordered lists
      .replace(/^\s*\d+\.\s+(.*)$/gim, '<li class="ml-4 list-decimal">$1</li>')
      // Blockquotes
      .replace(/^>\s+(.*)$/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-4">$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="my-6 border-border" />')
      // Line breaks
      .replace(/\n\n/gim, '</p><p class="my-4">')
      .replace(/\n/gim, '<br />');

    // Wrap in paragraph
    result = `<p class="my-4">${result}</p>`;

    return result;
  }, [content]);

  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ============================================
// DIFF VIEWER
// ============================================

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber?: { old?: number; new?: number };
}

interface DiffViewerProps {
  oldText: string;
  newText: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function DiffViewer({
  oldText,
  newText,
  showLineNumbers = true,
  className
}: DiffViewerProps) {
  const diff = useMemo(() => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const result: DiffLine[] = [];

    let oldIndex = 0;
    let newIndex = 0;

    // Simple line-by-line diff
    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      if (oldIndex >= oldLines.length) {
        result.push({
          type: 'added',
          content: newLines[newIndex],
          lineNumber: { new: newIndex + 1 }
        });
        newIndex++;
      } else if (newIndex >= newLines.length) {
        result.push({
          type: 'removed',
          content: oldLines[oldIndex],
          lineNumber: { old: oldIndex + 1 }
        });
        oldIndex++;
      } else if (oldLines[oldIndex] === newLines[newIndex]) {
        result.push({
          type: 'unchanged',
          content: oldLines[oldIndex],
          lineNumber: { old: oldIndex + 1, new: newIndex + 1 }
        });
        oldIndex++;
        newIndex++;
      } else {
        result.push({
          type: 'removed',
          content: oldLines[oldIndex],
          lineNumber: { old: oldIndex + 1 }
        });
        result.push({
          type: 'added',
          content: newLines[newIndex],
          lineNumber: { new: newIndex + 1 }
        });
        oldIndex++;
        newIndex++;
      }
    }

    return result;
  }, [oldText, newText]);

  const getLineClass = (type: DiffLine['type']) => {
    switch (type) {
      case 'added': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'removed': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      default: return '';
    }
  };

  const getSymbol = (type: DiffLine['type']) => {
    switch (type) {
      case 'added': return '+';
      case 'removed': return '-';
      default: return ' ';
    }
  };

  return (
    <div className={cn("font-mono text-sm rounded-lg border overflow-auto", className)}>
      <table className="w-full border-collapse">
        <tbody>
          {diff.map((line, index) => (
            <tr key={index} className={getLineClass(line.type)}>
              {showLineNumbers && (
                <>
                  <td className="px-2 py-0.5 text-right text-muted-foreground select-none w-12 border-r">
                    {line.lineNumber?.old || ''}
                  </td>
                  <td className="px-2 py-0.5 text-right text-muted-foreground select-none w-12 border-r">
                    {line.lineNumber?.new || ''}
                  </td>
                </>
              )}
              <td className="px-1 py-0.5 text-center select-none w-6">
                {getSymbol(line.type)}
              </td>
              <td className="px-2 py-0.5 whitespace-pre">{line.content || ' '}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// TEXT HIGHLIGHT
// ============================================

interface TextHighlightProps {
  text: string;
  highlight: string;
  highlightClassName?: string;
  caseSensitive?: boolean;
  className?: string;
}

export function TextHighlight({
  text,
  highlight,
  highlightClassName = "bg-yellow-200 dark:bg-yellow-800 rounded px-0.5",
  caseSensitive = false,
  className
}: TextHighlightProps) {
  if (!highlight) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    caseSensitive ? 'g' : 'gi'
  );
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) => (
        regex.test(part) ? (
          <mark key={i} className={highlightClassName}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      ))}
    </span>
  );
}

// ============================================
// TRUNCATE WITH EXPAND
// ============================================

interface TruncateWithExpandProps {
  text: string;
  maxLength?: number;
  maxLines?: number;
  expandLabel?: string;
  collapseLabel?: string;
  className?: string;
}

export function TruncateWithExpand({
  text,
  maxLength,
  maxLines,
  expandLabel = "Ver mais",
  collapseLabel = "Ver menos",
  className
}: TruncateWithExpandProps) {
  const [expanded, setExpanded] = useState(false);

  const shouldTruncate = maxLength 
    ? text.length > maxLength
    : maxLines 
      ? text.split('\n').length > maxLines
      : false;

  const displayText = expanded
    ? text
    : maxLength
      ? text.slice(0, maxLength)
      : maxLines
        ? text.split('\n').slice(0, maxLines).join('\n')
        : text;

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {displayText}
      {!expanded && '... '}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-primary hover:underline text-sm"
      >
        {expanded ? collapseLabel : expandLabel}
      </button>
    </span>
  );
}
