import { useRef, useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Loader2, Sparkles, Plus, Search, ChevronUp, ChevronDown, X } from "lucide-react";
import { TechnicalMessage } from "@/hooks/useTechnicalConversations";

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
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 w-fit mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Como posso ajudar?</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Pergunte sobre Fiber Laser, Serigrafia, Sublimação, DTF, Tampografia e muito mais!
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-2xl mx-auto">
                {suggestions.map((suggestion, index) => (
                  <Button key={index} variant="outline" className="h-auto py-3 px-4 justify-start text-left hover:bg-primary/5" onClick={() => onSend(suggestion.question)}>
                    <suggestion.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">{suggestion.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isMatch = matchingMessageIndices.includes(index);
                const isCurrentMatch = messageSearchQuery.trim() && matchingMessageIndices[currentMatchIndex] === index;
                if (messageSearchQuery.trim() && !isMatch) return null;
                return (
                  <div
                    key={message.id || index}
                    ref={(el) => { if (el && message.id) messageRefs.current.set(message.id, el); }}
                    className={`flex gap-3 transition-all ${message.role === "user" ? "justify-end" : "justify-start"} ${isCurrentMatch ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg" : ""}`}
                  >
                    {message.role === "assistant" && (
                      <div className="p-2 rounded-lg bg-primary/20 h-fit"><Bot className="h-4 w-4 text-primary" /></div>
                    )}
                    <div className={`max-w-[75%] p-3 rounded-lg ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground"}`}>
                      <p className="text-sm whitespace-pre-wrap">{highlightText(message.content)}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="p-2 rounded-lg bg-muted h-fit"><User className="h-4 w-4" /></div>
                    )}
                  </div>
                );
              })}
              {isStreaming && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-primary/20 h-fit"><Bot className="h-4 w-4 text-primary" /></div>
                  <div className="bg-muted/50 p-3 rounded-lg"><Loader2 className="h-4 w-4 animate-spin" /></div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {selectedConversationId && (
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Textarea value={input} onChange={(e) => onInputChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="Digite sua dúvida técnica..." className="min-h-[44px] max-h-32 resize-none" disabled={isStreaming} />
              <Button onClick={() => onSend()} disabled={isStreaming || !input.trim()} className="shrink-0">
                {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
