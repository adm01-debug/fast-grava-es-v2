import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  highlightText?: (text: string) => React.ReactNode;
}

export const ChatMessage = React.memo(({ role, content, isStreaming, highlightText }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copiado para a área de transferência");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "flex gap-4 w-full group animate-in fade-in slide-in-from-bottom-2 duration-300",
      role === "user" ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
        role === "assistant" 
          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" 
          : "bg-muted text-muted-foreground"
      )}>
        {role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      
      <div className={cn(
        "relative group flex flex-col gap-2 max-w-[85%]",
        role === "user" ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all",
          role === "user" 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-card border border-border/50 text-card-foreground rounded-tl-none hover:border-primary/30"
        )}>
          {role === "assistant" ? (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:leading-relaxed prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border/50">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">
              {highlightText ? highlightText(content) : content}
            </p>
          )}
        </div>

        {role === "assistant" && !isStreaming && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
            <button 
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
              title="Copiar resposta"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <div className="h-3 w-[1px] bg-border/50 mx-1" />
            <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        
        <span className="text-[10px] text-muted-foreground/60 px-1">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";