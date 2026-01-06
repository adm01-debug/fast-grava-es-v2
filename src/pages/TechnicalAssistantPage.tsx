import { useState, useRef, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bot, 
  Send, 
  User, 
  Loader2, 
  Sparkles,
  Zap,
  Printer,
  Sun,
  Flame,
  Scissors,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Filter,
  Calendar,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { useTechnicalConversations, useTechnicalMessages, TechnicalMessage } from "@/hooks/useTechnicalConversations";
import { formatDistanceToNow, isToday, isThisWeek, isThisMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/technical-assistant`;

const techniqueSuggestions = [
  { label: "Fiber Laser", icon: Zap, question: "Quais são os parâmetros ideais para gravar aço inox com Fiber Laser?" },
  { label: "Serigrafia", icon: Printer, question: "Como preparar uma tela de serigrafia têxtil?" },
  { label: "Sublimação", icon: Sun, question: "Qual temperatura e tempo para sublimação em canecas?" },
  { label: "Hot Stamping", icon: Flame, question: "Como funciona o processo de hot stamping?" },
  { label: "DTF", icon: Sparkles, question: "Qual a diferença entre DTF têxtil e DTF UV?" },
  { label: "Corte", icon: Scissors, question: "Como ajustar a pressão da lâmina no plotter de recorte?" },
];

const TechnicalAssistantPage = () => {
  const { 
    conversations, 
    isLoading: loadingConversations, 
    createConversation, 
    updateConversationTitle,
    deleteConversation 
  } = useTechnicalConversations();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [messageSearchActive, setMessageSearchActive] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  const { messages, isLoading: loadingMessages, addMessage } = useTechnicalMessages(selectedConversationId);
  
  const [localMessages, setLocalMessages] = useState<TechnicalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter conversations based on search and date
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!conv.title.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Date filter
      if (dateFilter !== "all") {
        const convDate = new Date(conv.updated_at);
        switch (dateFilter) {
          case "today":
            if (!isToday(convDate)) return false;
            break;
          case "week":
            if (!isThisWeek(convDate, { locale: ptBR })) return false;
            break;
          case "month":
            if (!isThisMonth(convDate)) return false;
            break;
          case "older":
            if (isThisMonth(convDate)) return false;
            break;
        }
      }
      
      return true;
    });
  }, [conversations, searchQuery, dateFilter]);

  // Filter messages based on search
  const filteredMessages = useMemo(() => {
    if (!messageSearchQuery.trim()) return localMessages;
    const query = messageSearchQuery.toLowerCase();
    return localMessages.filter(msg => 
      msg.content.toLowerCase().includes(query)
    );
  }, [localMessages, messageSearchQuery]);

  // Get matching message indices for navigation
  const matchingMessageIndices = useMemo(() => {
    if (!messageSearchQuery.trim()) return [];
    const query = messageSearchQuery.toLowerCase();
    return localMessages
      .map((msg, index) => ({ msg, index }))
      .filter(({ msg }) => msg.content.toLowerCase().includes(query))
      .map(({ index }) => index);
  }, [localMessages, messageSearchQuery]);

  const searchMatchCount = matchingMessageIndices.length;

  // Reset match index when search query changes
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [messageSearchQuery]);

  // Scroll to current match
  useEffect(() => {
    if (matchingMessageIndices.length > 0 && messageSearchQuery.trim()) {
      const targetIndex = matchingMessageIndices[currentMatchIndex];
      const targetMessage = localMessages[targetIndex];
      if (targetMessage) {
        const element = messageRefs.current.get(targetMessage.id);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMatchIndex, matchingMessageIndices, localMessages, messageSearchQuery]);

  const goToPreviousMatch = () => {
    if (matchingMessageIndices.length === 0) return;
    setCurrentMatchIndex(prev => 
      prev === 0 ? matchingMessageIndices.length - 1 : prev - 1
    );
  };

  const goToNextMatch = () => {
    if (matchingMessageIndices.length === 0) return;
    setCurrentMatchIndex(prev => 
      prev === matchingMessageIndices.length - 1 ? 0 : prev + 1
    );
  };

  // Sync local messages with fetched messages
  useEffect(() => {
    if (!isStreaming) {
      setLocalMessages(messages);
    }
  }, [messages, isStreaming]);

  // Clear message search when changing conversations
  useEffect(() => {
    setMessageSearchQuery("");
    setMessageSearchActive(false);
    setCurrentMatchIndex(0);
    messageRefs.current.clear();
  }, [selectedConversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  const handleNewConversation = async () => {
    try {
      const result = await createConversation.mutateAsync("Nova conversa");
      setSelectedConversationId(result.id);
      setLocalMessages([]);
    } catch (error) {
      toast.error("Erro ao criar conversa");
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation.mutateAsync(id);
      if (selectedConversationId === id) {
        setSelectedConversationId(null);
        setLocalMessages([]);
      }
      toast.success("Conversa excluída");
    } catch (error) {
      toast.error("Erro ao excluir conversa");
    }
  };

  const startEditing = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveTitle = async (id: string) => {
    try {
      await updateConversationTitle.mutateAsync({ id, title: editTitle });
      setEditingId(null);
    } catch (error) {
      toast.error("Erro ao atualizar título");
    }
  };

  const streamChat = async (userMessages: { role: string; content: string }[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (resp.status === 429) {
      throw new Error("Limite de requisições excedido. Aguarde um momento.");
    }
    if (resp.status === 402) {
      throw new Error("Créditos esgotados. Contate o administrador.");
    }
    if (!resp.ok || !resp.body) {
      throw new Error("Falha ao conectar com o assistente");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setLocalMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { 
                id: 'temp-' + Date.now(), 
                conversation_id: selectedConversationId!, 
                role: "assistant" as const, 
                content: assistantContent,
                created_at: new Date().toISOString()
              }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || !selectedConversationId) return;

    // Create conversation if needed with first message as title
    if (localMessages.length === 0) {
      const shortTitle = messageText.slice(0, 50) + (messageText.length > 50 ? '...' : '');
      updateConversationTitle.mutate({ id: selectedConversationId, title: shortTitle });
    }

    const userMsg: TechnicalMessage = { 
      id: 'temp-user-' + Date.now(), 
      conversation_id: selectedConversationId, 
      role: "user", 
      content: messageText,
      created_at: new Date().toISOString()
    };
    
    setLocalMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      // Save user message to database
      await addMessage.mutateAsync({ role: "user", content: messageText });

      // Get AI response
      const messagesForAI = [...localMessages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));
      
      const assistantResponse = await streamChat(messagesForAI);
      
      // Save assistant message to database
      await addMessage.mutateAsync({ role: "assistant", content: assistantResponse });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error:", error);
      }
      toast.error(error instanceof Error ? error.message : "Erro ao processar mensagem");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)] m-4 gap-4">
        <Breadcrumbs />
        <div className="flex flex-1 gap-4 min-h-0">
        {/* Sidebar with conversations */}
        <Card className="w-80 flex flex-col glass-card border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Conversas
              </CardTitle>
              <Button 
                size="sm" 
                onClick={handleNewConversation}
                disabled={createConversation.isPending}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nova
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
            {/* Search and Filters */}
            <div className="px-4 pb-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <Calendar className="h-3 w-3 mr-2" />
                  <SelectValue placeholder="Filtrar por data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as datas</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="older">Mais antigas</SelectItem>
                </SelectContent>
              </Select>
              {(searchQuery || dateFilter !== "all") && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{filteredConversations.length} conversa(s) encontrada(s)</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => { setSearchQuery(""); setDateFilter("all"); }}
                  >
                    Limpar
                  </Button>
                </div>
              )}
            </div>
            
            <ScrollArea className="flex-1 px-4 pb-4">
              {loadingConversations ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {conversations.length === 0 ? (
                    <>
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma conversa ainda</p>
                      <p className="text-xs">Clique em "Nova" para começar</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum resultado encontrado</p>
                      <p className="text-xs">Tente ajustar sua busca</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                        selectedConversationId === conv.id
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/50 border border-transparent"
                      }`}
                    >
                      {editingId === conv.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="h-7 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); saveTitle(conv.id); }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium truncate flex-1">
                              {conv.title}
                            </p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6"
                                onClick={(e) => startEditing(conv.id, conv.title, e)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={(e) => handleDeleteConversation(conv.id, e)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.updated_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat area */}
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
                  <p className="text-sm text-muted-foreground">
                    Especialista em técnicas de gravação e personalização
                  </p>
                </div>
              </div>
              {selectedConversationId && localMessages.length > 0 && (
                <div className="flex items-center gap-2">
                  {messageSearchActive ? (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar nas mensagens..."
                          value={messageSearchQuery}
                          onChange={(e) => setMessageSearchQuery(e.target.value)}
                          className="pl-9 h-8 w-56 text-sm"
                          autoFocus
                        />
                      </div>
                      {messageSearchQuery && searchMatchCount > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {currentMatchIndex + 1}/{searchMatchCount}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={goToPreviousMatch}
                            disabled={searchMatchCount === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={goToNextMatch}
                            disabled={searchMatchCount === 0}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {messageSearchQuery && searchMatchCount === 0 && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          0 resultados
                        </span>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setMessageSearchActive(false);
                          setMessageSearchQuery("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setMessageSearchActive(true)}
                    >
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
                    <h3 className="text-xl font-medium text-foreground">
                      Selecione ou crie uma conversa
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Use o painel lateral para criar uma nova conversa ou 
                      retomar uma conversa anterior.
                    </p>
                    <Button onClick={handleNewConversation} disabled={createConversation.isPending}>
                      <Plus className="h-4 w-4 mr-2" />
                      Iniciar Nova Conversa
                    </Button>
                  </div>
                </div>
              ) : localMessages.length === 0 && !loadingMessages ? (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 w-fit mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Como posso ajudar?
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Pergunte sobre Fiber Laser, Serigrafia, Sublimação, DTF, 
                      Tampografia e muito mais!
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-2xl mx-auto">
                    {techniqueSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto py-3 px-4 justify-start text-left hover:bg-primary/5"
                        onClick={() => sendMessage(suggestion.question)}
                      >
                        <suggestion.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-xs">{suggestion.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messageSearchQuery && filteredMessages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma mensagem encontrada</p>
                      <p className="text-xs">Tente ajustar sua busca</p>
                    </div>
                  ) : (
                    localMessages.map((message, index) => {
                      const isMatch = matchingMessageIndices.includes(index);
                      const isCurrentMatch = messageSearchQuery.trim() && 
                        matchingMessageIndices[currentMatchIndex] === index;
                      
                      const highlightText = (text: string) => {
                        if (!messageSearchQuery.trim()) return text;
                        const regex = new RegExp(`(${messageSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                        const parts = text.split(regex);
                        return parts.map((part, i) => 
                          regex.test(part) ? (
                            <mark key={i} className="bg-yellow-400/50 text-inherit rounded px-0.5">{part}</mark>
                          ) : part
                        );
                      };

                      // Hide non-matching messages when searching
                      if (messageSearchQuery.trim() && !isMatch) {
                        return null;
                      }

                      return (
                        <div
                          key={message.id || index}
                          ref={(el) => {
                            if (el && message.id) {
                              messageRefs.current.set(message.id, el);
                            }
                          }}
                          className={`flex gap-3 transition-all ${
                            message.role === "user" ? "justify-end" : "justify-start"
                          } ${isCurrentMatch ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg" : ""}`}
                        >
                          {message.role === "assistant" && (
                            <div className="p-2 rounded-lg bg-primary/20 h-fit">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div
                            className={`max-w-[75%] p-3 rounded-lg ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50 text-foreground"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{highlightText(message.content)}</p>
                          </div>
                          {message.role === "user" && (
                            <div className="p-2 rounded-lg bg-muted h-fit">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  {isStreaming && localMessages[localMessages.length - 1]?.role === "user" && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-lg bg-primary/20 h-fit">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {selectedConversationId && (
              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua dúvida técnica..."
                    className="min-h-[44px] max-h-32 resize-none"
                    disabled={isStreaming}
                  />
                  <Button 
                    onClick={() => sendMessage()} 
                    disabled={isStreaming || !input.trim()}
                    className="shrink-0"
                  >
                    {isStreaming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default TechnicalAssistantPage;
