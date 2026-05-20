import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Zap, Printer, Sun, Flame, Sparkles, Scissors, BookOpen, Settings } from "lucide-react";
import { toast } from "sonner";
import { useTechnicalConversations, useTechnicalMessages, TechnicalMessage } from "@/hooks/useTechnicalConversations";
import { isToday, isThisWeek, isThisMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConversationSidebar } from "@/components/technical-assistant/ConversationSidebar";
import { ChatArea } from "@/components/technical-assistant/ChatArea";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const { conversations, isLoading: loadingConversations, createConversation, updateConversationTitle, deleteConversation } = useTechnicalConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const { messages, isLoading: loadingMessages, addMessage } = useTechnicalMessages(selectedConversationId);
  const [localMessages, setLocalMessages] = useState<TechnicalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      if (searchQuery.trim() && !conv.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (dateFilter !== "all") {
        const convDate = new Date(conv.updated_at);
        switch (dateFilter) {
          case "today": if (!isToday(convDate)) return false; break;
          case "week": if (!isThisWeek(convDate, { locale: ptBR })) return false; break;
          case "month": if (!isThisMonth(convDate)) return false; break;
          case "older": if (isThisMonth(convDate)) return false; break;
        }
      }
      return true;
    });
  }, [conversations, searchQuery, dateFilter]);

  useEffect(() => { if (!isStreaming) setLocalMessages(messages); }, [messages, isStreaming]);

  const handleNewConversation = async () => {
    try {
      const result = await createConversation.mutateAsync("Nova conversa");
      setSelectedConversationId(result.id);
      setLocalMessages([]);
    } catch { toast.error("Erro ao criar conversa"); }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation.mutateAsync(id);
      if (selectedConversationId === id) { setSelectedConversationId(null); setLocalMessages([]); }
      toast.success("Conversa excluída");
    } catch { toast.error("Erro ao excluir conversa"); }
  };

  const saveTitle = async (id: string) => {
    try { await updateConversationTitle.mutateAsync({ id, title: editTitle }); setEditingId(null); }
    catch { toast.error("Erro ao atualizar título"); }
  };

  const streamChat = async (userMessages: { role: string; content: string }[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      body: JSON.stringify({ messages: userMessages }),
    });
    if (!resp.ok || !resp.body) throw new Error("Falha ao conectar com o assistente");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setLocalMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.id.startsWith('temp-')) {
                  return [...prev.slice(0, -1), { ...last, content: assistantContent }];
                }
                return [...prev, { id: 'temp-assistant-' + Date.now(), conversation_id: selectedConversationId!, role: "assistant", content: assistantContent, created_at: new Date().toISOString() }];
              });
            }
          } catch (e) { /* Ignore partial JSON */ }
        }
      }
    }
    return assistantContent;
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || !selectedConversationId) return;
    
    if (localMessages.length === 0) {
      const generatedTitle = messageText.length > 30 ? messageText.slice(0, 30) + "..." : messageText;
      updateConversationTitle.mutate({ id: selectedConversationId, title: generatedTitle });
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
      await addMessage.mutateAsync({ role: "user", content: messageText });
      const assistantResponse = await streamChat([...localMessages, userMsg].map(m => ({ role: m.role, content: m.content })));
      await addMessage.mutateAsync({ role: "assistant", content: assistantResponse });
    } catch (error) {
      toast.error("Erro no processamento");
    } finally { 
      setIsStreaming(false); 
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 animate-in fade-in duration-500">
        <div className="flex flex-1 gap-4 min-h-0">
          <ConversationSidebar
            conversations={filteredConversations}
            selectedId={selectedConversationId}
            isLoading={loadingConversations}
            searchQuery={searchQuery}
            dateFilter={dateFilter}
            editingId={editingId}
            editTitle={editTitle}
            isCreating={createConversation.isPending}
            onSearchChange={setSearchQuery}
            onDateFilterChange={setDateFilter}
            onSelect={setSelectedConversationId}
            onNew={handleNewConversation}
            onDelete={handleDeleteConversation}
            onStartEdit={(id, title, e) => { e.stopPropagation(); setEditingId(id); setEditTitle(title); }}
            onSaveEdit={saveTitle}
            onCancelEdit={() => setEditingId(null)}
            onEditTitleChange={setEditTitle}
          />
          <ChatArea
            selectedConversationId={selectedConversationId}
            messages={localMessages}
            isStreaming={isStreaming}
            isLoadingMessages={loadingMessages}
            input={input}
            onInputChange={setInput}
            onSend={sendMessage}
            onNewConversation={handleNewConversation}
            isCreating={createConversation.isPending}
            suggestions={techniqueSuggestions}
          />

          <div className="hidden xl:flex w-72 flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 rounded-2xl border border-border/50 bg-card p-4 space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-primary">
                <BookOpen className="h-4 w-4" />
                DADOS TÉCNICOS EXTRAÍDOS
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Última Técnica</span>
                  <p className="text-xs font-medium mt-1">Laser de Fibra Industrial</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Parâmetros Críticos</span>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span>Velocidade:</span>
                      <span className="font-bold text-primary">500 mm/s</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Potência:</span>
                      <span className="font-bold text-primary">35%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-3">
                <Settings className="h-4 w-4" />
                AÇÕES RÁPIDAS
              </div>
              <div className="grid gap-2">
                <button className="w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold hover:opacity-90 transition-all uppercase tracking-wider">
                  Sincronizar Parâmetros
                </button>
                <button className="w-full px-3 py-2 rounded-lg bg-muted text-muted-foreground text-[10px] font-bold hover:bg-muted/80 transition-all uppercase tracking-wider">
                  Gerar Relatório PDF
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TechnicalAssistantPage;