import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Zap, Printer, Sun, Flame, Sparkles, Scissors } from "lucide-react";
import { toast } from "sonner";
import { useTechnicalConversations, useTechnicalMessages, TechnicalMessage } from "@/hooks/useTechnicalConversations";
import { isToday, isThisWeek, isThisMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { ConversationSidebar } from "@/components/technical-assistant/ConversationSidebar";
import { ChatArea } from "@/components/technical-assistant/ChatArea";
import { useMemo } from "react";

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
    if (resp.status === 429) throw new Error("Limite de requisições excedido. Aguarde um momento.");
    if (resp.status === 402) throw new Error("Créditos esgotados. Contate o administrador.");
    if (!resp.ok || !resp.body) throw new Error("Falha ao conectar com o assistente");

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
              if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
              return [...prev, { id: 'temp-' + Date.now(), conversation_id: selectedConversationId!, role: "assistant" as const, content: assistantContent, created_at: new Date().toISOString() }];
            });
          }
        } catch { textBuffer = line + "\n" + textBuffer; break; }
      }
    }
    return assistantContent;
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || !selectedConversationId) return;
    
    // Etapa 3: Título Inteligente (apenas na primeira mensagem)
    if (localMessages.length === 0) {
      const generatedTitle = messageText.length > 30 
        ? messageText.split(' ').slice(0, 5).join(' ') + '...' 
        : messageText;
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
      const messagesForAI = [...localMessages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const assistantResponse = await streamChat(messagesForAI);
      await addMessage.mutateAsync({ role: "assistant", content: assistantResponse });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao processar mensagem");
      // Remove a mensagem do usuário se falhar para manter consistência
      setLocalMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally { 
      setIsStreaming(false); 
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)] m-4 gap-4">
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
        </div>
      </div>
    </MainLayout>
  );
};

export default TechnicalAssistantPage;
