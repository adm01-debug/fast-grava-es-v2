import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, Zap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

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
    toast.success("Copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "flex gap-4 w-full mb-6",
      role === "user" ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm",
        role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      )}>
        {role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      
      <div className={cn(
        "flex flex-col gap-2 max-w-[85%]",
        role === "user" ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm border",
          role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border-border/50 rounded-tl-none"
        )}>
          {role === "assistant" ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
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
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";