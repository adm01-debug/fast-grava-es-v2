import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Sparkles,
  X,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  Lightbulb,
  Zap,
  MessageCircle,
  Minimize2,
  Maximize2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Message Types
interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
}

interface Suggestion {
  id: string;
  text: string;
  icon: React.ReactNode;
}

// AI Assistant Hook
export function useAIAssistant() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const suggestions: Suggestion[] = [
    { id: '1', text: 'Como posso melhorar a eficiência?', icon: <Zap className="h-3 w-3" /> },
    { id: '2', text: 'Análise de produção do dia', icon: <Lightbulb className="h-3 w-3" /> },
    { id: '3', text: 'Manutenções pendentes', icon: <MessageCircle className="h-3 w-3" /> },
  ];

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const responses: Record<string, string> = {
      eficiência: `📊 **Análise de Eficiência**

Baseado nos dados atuais, aqui estão algumas sugestões:

1. **Otimização de Setup** - Reduzir tempo de troca de ferramentas em 15%
2. **Manutenção Preventiva** - 3 máquinas precisam de atenção esta semana
3. **Planejamento** - Reorganizar sequência de jobs para reduzir trocas

Taxa atual: **87.5%** | Meta: **92%**`,
      produção: `📈 **Resumo de Produção - Hoje**

• Peças produzidas: **4.250** unidades
• Taxa de conformidade: **98.2%**
• Tempo de operação: **7h 32min**
• Máquina mais produtiva: **CNC-02**

✅ Produção está 8% acima da meta diária!`,
      manutenções: `🔧 **Manutenções Pendentes**

| Máquina | Tipo | Prioridade | Prazo |
|---------|------|------------|-------|
| FRE-01 | Preventiva | Alta | Hoje |
| INJ-03 | Corretiva | Média | Amanhã |
| CNC-01 | Lubrificação | Baixa | 3 dias |

⚠️ 1 manutenção crítica precisa de atenção imediata.`,
      default: `Olá! Sou seu assistente de produção. Posso ajudar com:

• 📊 Análise de eficiência e produtividade
• 🔧 Status de manutenções
• 📅 Planejamento de produção
• 📈 Relatórios e métricas

Como posso ajudar você hoje?`,
    };

    const lowerContent = content.toLowerCase();
    let responseContent = responses.default;

    if (lowerContent.includes('eficiência') || lowerContent.includes('melhorar')) {
      responseContent = responses.eficiência;
    } else if (lowerContent.includes('produção') || lowerContent.includes('dia')) {
      responseContent = responses.produção;
    } else if (lowerContent.includes('manutenção') || lowerContent.includes('pendente')) {
      responseContent = responses.manutenções;
    }

    setIsTyping(false);

    const assistantMessage: AIMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  }, []);

  const giveFeedback = useCallback((messageId: string, feedback: 'positive' | 'negative') => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg))
    );
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    isTyping,
    suggestions,
    sendMessage,
    giveFeedback,
    clearMessages,
  };
}

// Chat Message Component
function ChatMessage({
  message,
  onFeedback,
  onCopy,
}: {
  message: AIMessage;
  onFeedback: (feedback: 'positive' | 'negative') => void;
  onCopy: () => void;
}) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-primary to-chart-1 text-white'
        )}
      >
        {isUser ? (
          <span className="text-xs font-medium">U</span>
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      <div className={cn('flex-1 max-w-[80%]', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-md'
              : 'bg-muted rounded-tl-md'
          )}
        >
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        </div>

        {!isUser && (
          <div className="flex items-center gap-1 mt-1.5">
            <Button
              size="icon"
              variant="ghost"
              className={cn('h-6 w-6', message.feedback === 'positive' && 'text-chart-2')}
              onClick={() => onFeedback('positive')}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={cn('h-6 w-6', message.feedback === 'negative' && 'text-destructive')}
              onClick={() => onFeedback('negative')}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onCopy}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )}

        <span className="text-[10px] text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

// Typing Indicator
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-1 flex items-center justify-center">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex gap-1 px-4 py-3 bg-muted rounded-2xl rounded-tl-md">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-muted-foreground/50 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// AI Assistant Panel
export function AIAssistantPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    messages,
    isLoading,
    isTyping,
    suggestions,
    sendMessage,
    giveFeedback,
    clearMessages,
  } = useAIAssistant();

  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copiado!' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={cn(
          'fixed bottom-20 right-4 z-50 w-96 bg-card border rounded-2xl shadow-2xl overflow-hidden',
          isMinimized && 'h-14'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/10 to-chart-1/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-1 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Assistente IA</h3>
              <p className="text-[10px] text-muted-foreground">Sempre disponível</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={clearMessages}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-3.5 w-3.5" />
              ) : (
                <Minimize2 className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea ref={scrollRef} className="h-80 p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-chart-1/20 flex items-center justify-center mb-4">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-medium mb-1">Como posso ajudar?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pergunte sobre produção, manutenções ou métricas.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.map((sug) => (
                      <Badge
                        key={sug.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => sendMessage(sug.text)}
                      >
                        {sug.icon}
                        <span className="ml-1">{sug.text}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      onFeedback={(fb) => giveFeedback(msg.id, fb)}
                      onCopy={() => handleCopy(msg.content)}
                    />
                  ))}
                  <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t bg-muted/30">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua pergunta..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Floating AI Button
export function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg',
          'bg-gradient-to-br from-primary to-chart-1 text-white',
          'flex items-center justify-center',
          'hover:shadow-xl transition-shadow'
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <ChevronDown className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AIAssistantPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default AIAssistantButton;
