import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, Bot, User, Loader2, X, Minimize2, 
  Maximize2, MessageSquare, Sparkles, Copy, Check
} from 'lucide-react';
import { toast } from 'sonner';

// #49 - Chat UI Components

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function Chat({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = 'Digite sua mensagem...',
  className
}: ChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Messages area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

// Individual message component
function ChatMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyContent = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      'flex items-start gap-3',
      isUser && 'flex-row-reverse'
    )}>
      <div className={cn(
        'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
      </div>
      
      <div className={cn(
        'group relative max-w-[80%] rounded-lg px-4 py-2',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span className={cn(
          'text-xs mt-1 block',
          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        
        {!isUser && (
          <button
            onClick={copyContent}
            className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-full p-1"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Floating chat widget
interface FloatingChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  title?: string;
}

export function FloatingChat({
  messages,
  onSendMessage,
  isLoading,
  title = 'Assistente'
}: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className={cn(
          'fixed bottom-6 right-6 w-96 bg-background border rounded-lg shadow-xl overflow-hidden transition-all',
          isMinimized ? 'h-14' : 'h-[500px]'
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-medium">{title}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat content */}
          {!isMinimized && (
            <Chat
              messages={messages}
              onSendMessage={onSendMessage}
              isLoading={isLoading}
              className="h-[calc(100%-56px)]"
            />
          )}
        </div>
      )}
    </>
  );
}

// Chat bubble for inline display
export function ChatBubble({
  content,
  role,
  timestamp,
  avatar
}: {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
  avatar?: React.ReactNode;
}) {
  const isUser = role === 'user';

  return (
    <div className={cn(
      'flex items-end gap-2 max-w-[85%]',
      isUser ? 'ml-auto flex-row-reverse' : ''
    )}>
      {avatar && (
        <div className="shrink-0">{avatar}</div>
      )}
      <div className={cn(
        'rounded-2xl px-4 py-2',
        isUser 
          ? 'bg-primary text-primary-foreground rounded-br-sm' 
          : 'bg-muted rounded-bl-sm'
      )}>
        <p className="text-sm">{content}</p>
        {timestamp && (
          <p className={cn(
            'text-xs mt-1',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}

// Typing indicator
export function TypingIndicator({ name }: { name?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      {name && <span>{name} está digitando...</span>}
    </div>
  );
}

// Chat hook
export function useChat(initialMessages: Message[] = []) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((role: Message['role'], content: string) => {
    const message: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    handler: (content: string) => Promise<string>
  ) => {
    addMessage('user', content);
    setIsLoading(true);

    try {
      const response = await handler(content);
      addMessage('assistant', response);
    } catch (error) {
      addMessage('assistant', 'Desculpe, ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    addMessage,
    sendMessage,
    clearMessages,
    setMessages
  };
}
