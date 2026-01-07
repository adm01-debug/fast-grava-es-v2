import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Eye,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Markdown editor with preview
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Escreva seu texto aqui...',
  minHeight = 200,
  maxHeight = 500,
  disabled = false,
  className,
}: MarkdownEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = React.useState<'write' | 'preview'>('write');

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**', 'texto'), tooltip: 'Negrito' },
    { icon: Italic, action: () => insertMarkdown('*', '*', 'texto'), tooltip: 'Itálico' },
    { icon: Strikethrough, action: () => insertMarkdown('~~', '~~', 'texto'), tooltip: 'Tachado' },
    { type: 'separator' },
    { icon: Heading1, action: () => insertMarkdown('# ', '', 'Título'), tooltip: 'Título 1' },
    { icon: Heading2, action: () => insertMarkdown('## ', '', 'Título'), tooltip: 'Título 2' },
    { icon: Heading3, action: () => insertMarkdown('### ', '', 'Título'), tooltip: 'Título 3' },
    { type: 'separator' },
    { icon: List, action: () => insertMarkdown('- ', '', 'Item'), tooltip: 'Lista' },
    { icon: ListOrdered, action: () => insertMarkdown('1. ', '', 'Item'), tooltip: 'Lista numerada' },
    { icon: Quote, action: () => insertMarkdown('> ', '', 'Citação'), tooltip: 'Citação' },
    { type: 'separator' },
    { icon: Code, action: () => insertMarkdown('`', '`', 'código'), tooltip: 'Código inline' },
    { icon: Link, action: () => insertMarkdown('[', '](url)', 'texto'), tooltip: 'Link' },
    { icon: Image, action: () => insertMarkdown('![', '](url)', 'alt'), tooltip: 'Imagem' },
  ];

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'write' | 'preview')}>
        <div className="flex items-center justify-between border-b bg-muted/50 px-2 py-1">
          <div className="flex items-center gap-0.5 flex-wrap">
            {toolbarButtons.map((btn, index) => (
              btn.type === 'separator' ? (
                <Separator key={index} orientation="vertical" className="h-6 mx-1" />
              ) : (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={btn.action}
                  disabled={disabled || activeTab === 'preview'}
                  title={btn.tooltip}
                >
                  <btn.icon className="h-4 w-4" />
                </Button>
              )
            ))}
          </div>

          <TabsList className="h-8">
            <TabsTrigger value="write" className="h-7 px-3 text-xs gap-1">
              <Edit3 className="h-3 w-3" />
              Escrever
            </TabsTrigger>
            <TabsTrigger value="preview" className="h-7 px-3 text-xs gap-1">
              <Eye className="h-3 w-3" />
              Visualizar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="m-0">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="border-0 rounded-none resize-none focus-visible:ring-0"
            style={{ minHeight, maxHeight }}
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div
            className="prose prose-sm dark:prose-invert max-w-none p-4 overflow-auto"
            style={{ minHeight, maxHeight }}
          >
            <MarkdownPreview content={value} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple markdown preview
interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const html = React.useMemo(() => parseMarkdown(content), [content]);

  if (!content) {
    return (
      <p className="text-muted-foreground italic">Nenhum conteúdo para visualizar</p>
    );
  }

  return (
    <div
      className={cn("markdown-preview", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Simple markdown parser
function parseMarkdown(text: string): string {
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold, Italic, Strikethrough
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    // Code
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Links and Images
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Lists
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`;
  }

  return html;
}

// Rich text display with formatting
interface RichTextProps {
  content: string;
  truncate?: number;
  className?: string;
}

export function RichText({ content, truncate, className }: RichTextProps) {
  const displayContent = truncate && content.length > truncate
    ? content.substring(0, truncate) + '...'
    : content;

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <MarkdownPreview content={displayContent} />
    </div>
  );
}

// Inline code block
export function InlineCode({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code className={cn(
      "px-1.5 py-0.5 rounded bg-muted font-mono text-sm",
      className
    )}>
      {children}
    </code>
  );
}

// Code block with syntax highlighting placeholder
interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({ code, language, showLineNumbers = true, className }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const lines = code.split('\n');

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group rounded-lg overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
        <span className="text-xs text-muted-foreground font-mono">
          {language || 'text'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={copyCode}
        >
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto bg-muted/50">
        <code className="text-sm font-mono">
          {showLineNumbers ? (
            lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="w-8 text-muted-foreground text-right mr-4 select-none">
                  {i + 1}
                </span>
                <span>{line}</span>
              </div>
            ))
          ) : (
            code
          )}
        </code>
      </pre>
    </div>
  );
}
