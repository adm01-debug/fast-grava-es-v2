import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Search, Edit2, Trash2, Check, X, Loader2, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  isLoading: boolean;
  searchQuery: string;
  dateFilter: string;
  editingId: string | null;
  editTitle: string;
  isCreating: boolean;
  onSearchChange: (v: string) => void;
  onDateFilterChange: (v: string) => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onStartEdit: (id: string, title: string, e: React.MouseEvent) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onEditTitleChange: (v: string) => void;
}

export function ConversationSidebar({
  conversations, selectedId, isLoading, searchQuery, dateFilter,
  editingId, editTitle, isCreating,
  onSearchChange, onDateFilterChange, onSelect, onNew, onDelete,
  onStartEdit, onSaveEdit, onCancelEdit, onEditTitleChange
}: ConversationSidebarProps) {
  return (
    <Card className="w-80 flex flex-col glass-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Conversas
          </CardTitle>
          <Button size="sm" onClick={onNew} disabled={isCreating}>
            <Plus className="h-4 w-4 mr-1" />
            Nova
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <div className="px-4 pb-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar conversas..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <Select value={dateFilter} onValueChange={onDateFilterChange}>
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
              <span>{conversations.length} conversa(s)</span>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { onSearchChange(""); onDateFilterChange("all"); }}>
                Limpar
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 px-4 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma conversa</p>
              <p className="text-xs">Clique em "Nova" para começar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                    selectedId === conv.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-2">
                      <Input value={editTitle} onChange={(e) => onEditTitleChange(e.target.value)} className="h-7 text-sm" onClick={(e) => e.stopPropagation()} />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onSaveEdit(conv.id); }}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onCancelEdit(); }}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate flex-1">{conv.title}</p>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => onStartEdit(conv.id, conv.title, e)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={(e) => onDelete(conv.id, e)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: ptBR })}
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
  );
}
