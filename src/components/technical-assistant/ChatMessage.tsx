import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, Zap, FileJson, Share2, Star, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MermaidDiagram, ParameterTable } from './TechnicalArtifacts';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  highlightText?: (text: string) => React.ReactNode;
}

export const ChatMessage = React.memo(({ role, content, isStreaming, highlightText }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copiado para a área de transferência");
    setTimeout(() => setCopied(false), 2000);
  };

  // Detect technical blocks
  const hasMermaid = content.includes('```mermaid');
  const hasParameters = content.includes('### Parâmetros') || content.includes('|');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 w-full group mb-6",
        role === "user" ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
        role === "assistant" 
          ? "bg-gradient-to-br from-primary via-primary/90 to-purple-600 text-primary-foreground" 
          : "bg-muted text-muted-foreground border border-border/50"
      )}>
        {role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
      </div>
      
      <div className={cn(
        "relative flex flex-col gap-3 max-w-[85%]",
        role === "user" ? "items-end" : "items-start"
      )}>
        {role === "assistant" && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] font-bold tracking-wider text-primary uppercase">Assistente Técnico</span>
            <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded text-[9px] text-primary font-medium border border-primary/20">
              <ShieldCheck className="h-3 w-3" />
              VERIFICADO
            </div>
          </div>
        )}

        <div className={cn(
          "px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all border",
          role === "user" 
            ? "bg-primary text-primary-foreground rounded-tr-none border-primary/20" 
            : "bg-card border-border/50 text-card-foreground rounded-tl-none hover:border-primary/30"
        )}>
          {role === "assistant" ? (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:leading-relaxed prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border/50 prose-headings:text-foreground prose-headings:font-bold prose-strong:text-primary">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeContent = String(children).replace(/\n$/, '');
                    
                    if (!inline && match && match[1] === 'mermaid') {
                      return <MermaidDiagram chart={codeContent} />;
                    }
                    
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="my-4 overflow-x-auto rounded-xl border border-border/50">
                        <table className="w-full text-xs text-left">
                          {children}
                        </table>
                      </div>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap font-medium">
              {highlightText ? highlightText(content) : content}
            </p>
          )}
        </div>

        {role === "assistant" && !isStreaming && (
          <div className="flex items-center gap-3 mt-1 px-1">
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
              <button 
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                title="Copiar resposta"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-primary" title="Exportar parâmetros">
                <FileJson className="h-3.5 w-3.5" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-primary" title="Compartilhar">
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
              <button 
                onClick={() => setFeedback('up')}
                className={cn("p-1.5 rounded-md hover:bg-muted transition-colors", feedback === 'up' ? "text-green-500 bg-green-500/10" : "text-muted-foreground")}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setFeedback('down')}
                className={cn("p-1.5 rounded-md hover:bg-muted transition-colors", feedback === 'down' ? "text-red-500 bg-red-500/10" : "text-muted-foreground")}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary hover:bg-primary/20 transition-all border border-primary/20">
                <Zap className="h-3 w-3" />
                APLICAR PARÂMETROS
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 text-[10px] font-bold text-purple-500 hover:bg-purple-500/20 transition-all border border-purple-500/20">
                <Star className="h-3 w-3" />
                SALVAR NOS FAVORITOS
              </button>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 px-1 text-[9px] text-muted-foreground/60 font-medium">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>•</span>
          <span>Processado via GPT-4o Technical</span>
        </div>
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = "ChatMessage";