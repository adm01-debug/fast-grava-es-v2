import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, Zap, ShieldCheck, Share2, FileJson, AlertTriangle } from "lucide-react";
import { SafetyAlert } from './SafetyAlert';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MermaidDiagram } from './TechnicalArtifacts';
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
    toast.success("Copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 w-full mb-6",
        role === "user" ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform",
        role === "assistant" 
          ? "bg-gradient-to-br from-primary to-purple-600 text-primary-foreground" 
          : "bg-muted text-muted-foreground border border-border/50"
      )}>
        {role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
      </div>
      
      <div className={cn(
        "relative flex flex-col gap-2 max-w-[85%]",
        role === "user" ? "items-end" : "items-start"
      )}>
        {role === "assistant" && (
          <div className="flex items-center gap-2 px-1 mb-1">
            <span className="text-[10px] font-bold tracking-wider text-primary uppercase">Elite Assistant</span>
            <ShieldCheck className="h-3 w-3 text-primary/60" />
          </div>
        )}

        <div className={cn(
          "px-5 py-4 rounded-2xl text-sm leading-relaxed border transition-all shadow-sm",
          role === "user" 
            ? "bg-primary text-primary-foreground rounded-tr-none border-primary/20" 
            : "bg-card border-border/50 text-card-foreground rounded-tl-none hover:border-primary/30"
        )}>
          {role === "assistant" ? (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeContent = String(children).replace(/\n$/, '');
                    if (!inline && match && match[1] === 'mermaid') {
                      return <MermaidDiagram chart={codeContent} />;
                    }
                    return <code className={className} {...props}>{children}</code>;
                  }
                }}
              >
                {content}
              </ReactMarkdown>
              {content.includes('800 mm/s') && (
                <div className="mt-4">
                  <SafetyAlert 
                    parameter="Velocidade" 
                    suggestedValue="800 mm/s" 
                    limit="500 mm/s"
                    onConfirm={() => toast.success("Bypass autorizado")}
                    onCancel={() => toast.info("Sugestão rejeitada")}
                  />
                </div>
              )}
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
              <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"><Share2 className="h-3.5 w-3.5" /></button>
            </div>
            
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary hover:bg-primary/20 transition-all border border-primary/20">
                <Zap className="h-3 w-3" />
                APLICAR
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = "ChatMessage";