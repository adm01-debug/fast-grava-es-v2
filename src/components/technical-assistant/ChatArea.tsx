import { useRef, useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Loader2, Sparkles, Plus, Search, ChevronUp, ChevronDown, X, Keyboard, Mic, Copy, Download } from "lucide-react";
import { TechnicalMessage } from "@/hooks/useTechnicalConversations";
import { ChatMessage } from "./ChatMessage";
import { motion, AnimatePresence } from "framer-motion";

interface TechniqueSuggestion {
  label: string;
  icon: React.ElementType;
  question: string;
}

interface ChatAreaProps {
  selectedConversationId: string | null;
  messages: TechnicalMessage[];
  isStreaming: boolean;
  isLoadingMessages: boolean;
  input: string;
  onInputChange: (v: string) => void;
  onSend: (text?: string) => void;
  onNewConversation: () => void;
  isCreating: boolean;
  suggestions: TechniqueSuggestion[];
}

export function ChatArea({
  selectedConversationId, messages, isStreaming, isLoadingMessages,
  input, onInputChange, onSend, onNewConversation, isCreating, suggestions
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [messageSearchActive, setMessageSearchActive] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const matchingMessageIndices = useMemo(() => {
    if (!messageSearchQuery.trim()) return [];
    const query = messageSearchQuery.toLowerCase();
    return messages
      .map((msg, index) => ({ msg, index }))
      .filter(({ msg }) => msg.content.toLowerCase().includes(query))
      .map(({ index }) => index);
  }, [messages, messageSearchQuery]);

  useEffect(() => { setCurrentMatchIndex(0); }, [messageSearchQuery]);

  useEffect(() => {
    if (matchingMessageIndices.length > 0 && messageSearchQuery.trim()) {
      const targetIndex = matchingMessageIndices[currentMatchIndex];
      const targetMessage = messages[targetIndex];
      if (targetMessage) {
        const el = messageRefs.current.get(targetMessage.id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMatchIndex, matchingMessageIndices, messages, messageSearchQuery]);

  useEffect(() => {
    setMessageSearchQuery("");
    setMessageSearchActive(false);
    setCurrentMatchIndex(0);
    messageRefs.current.clear();
  }, [selectedConversationId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  const highlightText = (text: string) => {
    if (!messageSearchQuery.trim()) return text;
    const regex = new RegExp(`(${messageSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-400/50 text-inherit rounded px-0.5">{part}</mark> : part
    );
  };

  return (
    <Card className="flex-1 flex flex-col glass-card border-border/50">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Assistente Técnico IA
                <Badge variant="secondary">Beta</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Especialista em técnicas de gravação e personalização</p>
            </div>
          </div>
          {selectedConversationId && messages.length > 0 && (
            <div className="flex items-center gap-2">
              {messageSearchActive ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar nas mensagens..." value={messageSearchQuery} onChange={(e) => setMessageSearchQuery(e.target.value)} className="pl-9 h-8 w-56 text-sm" autoFocus />
                  </div>
                  {messageSearchQuery && matchingMessageIndices.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{currentMatchIndex + 1}/{matchingMessageIndices.length}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setCurrentMatchIndex(p => p === 0 ? matchingMessageIndices.length - 1 : p - 1)}>
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setCurrentMatchIndex(p => p === matchingMessageIndices.length - 1 ? 0 : p + 1)}>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {messageSearchQuery && matchingMessageIndices.length === 0 && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">0 resultados</span>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setMessageSearchActive(false); setMessageSearchQuery(""); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setMessageSearchActive(true)}>
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {!selectedConversationId ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 w-fit mx-auto">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-medium text-foreground">Selecione ou crie uma conversa</h3>
                <p className="text-sm text-muted-foreground max-w-md">Use o painel lateral para criar uma nova conversa ou retomar uma conversa anterior.</p>
                <Button onClick={onNewConversation} disabled={isCreating}>
                  <Plus className="h-4 w-4 mr-2" />
                  Iniciar Nova Conversa
                </Button>
              </div>
            </div>
          ) : messages.length === 0 && !isLoadingMessages ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 max-w-3xl mx-auto py-12"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 mb-2">
                  <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">O que vamos criar hoje?</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Seu especialista técnico em gravação industrial, pronto para otimizar seus parâmetros e processos.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="outline" 
                      className="w-full h-auto py-4 px-5 flex flex-col items-start gap-2 text-left hover:bg-primary/5 hover:border-primary/30 group transition-all rounded-2xl border-border/40" 
                      onClick={() => onSend(suggestion.question)}
                    >
                      <div className="p-2 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                        <suggestion.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-semibold">{suggestion.label}</span>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {suggestion.question}
                      </p>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6 pb-4">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                  const isMatch = matchingMessageIndices.includes(index);
                  if (messageSearchQuery.trim() && !isMatch) return null;
                  
                  return (
                    <ChatMessage
                      key={message.id || index}
                      role={message.role}
                      content={message.content}
                      isStreaming={isStreaming && index === messages.length - 1 && message.role === "assistant"}
                      highlightText={highlightText}
                    />
                  );
                })}
              </AnimatePresence>
              
              {isStreaming && messages[messages.length - 1]?.role === "user" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted/50 px-4 py-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </ScrollArea>

          <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col gap-2 max-w-4xl mx-auto">
              <div className="flex gap-2 items-end">
                <div className="relative flex-1 group">
                  <Textarea 
                    value={input} 
                    onChange={(e) => onInputChange(e.target.value)} 
                    onKeyDown={handleKeyDown} 
                    placeholder="Pergunte sobre parâmetros, técnicas ou resolva problemas..." 
                    className="min-h-[44px] max-h-40 resize-none pr-10 py-3 rounded-xl border-border/50 focus:border-primary/50 transition-all bg-muted/30" 
                    disabled={isStreaming} 
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <button className="text-muted-foreground hover:text-primary transition-colors p-1" title="Comando de voz (Beta)">
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <Button 
                  onClick={() => onSend()} 
                  disabled={isStreaming || !input.trim()} 
                  className="h-[44px] w-[44px] rounded-xl shrink-0 shadow-lg shadow-primary/20"
                >
                  {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Keyboard className="h-3 w-3" />
                    <kbd className="bg-muted px-1 rounded">Enter</kbd> para enviar
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <kbd className="bg-muted px-1 rounded">Shift + Enter</kbd> para nova linha
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-muted-foreground">
                    <Download className="h-3 w-3" /> Exportar
                  </Button>
                </div>
              </div>
            </div>
          </div>
      </CardContent>
    </Card>
  );
}
