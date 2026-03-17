import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Send, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  channel: string;
  created_at: string;
}

interface QuickChatProps {
  channel?: string;
  compact?: boolean;
}

export function QuickChat({ channel = 'general', compact = false }: QuickChatProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel', channel)
        .order('created_at', { ascending: true })
        .limit(100);
      if (data) setMessages(data as ChatMessage[]);
    }
    loadMessages();
  }, [channel]);

  // Real-time subscription
  useEffect(() => {
    const sub = supabase
      .channel(`chat-${channel}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel=eq.${channel}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [channel]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !user || isSending) return;
    setIsSending(true);
    try {
      await supabase.from('chat_messages').insert({
        sender_id: user.id,
        sender_name: profile?.full_name || 'Usuário',
        message: newMessage.trim(),
        channel,
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  }, [newMessage, user, profile, channel, isSending]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="glass-card flex flex-col" style={{ height: compact ? '300px' : '450px' }}>
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          Chat Rápido
          <Badge variant="secondary" className="text-xs ml-auto gap-1">
            <Users className="h-3 w-3" />
            {channel === 'general' ? 'Geral' : channel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 pb-3">
        {/* Messages */}
        <ScrollArea className="flex-1 mb-2" ref={scrollRef}>
          <div className="space-y-2 pr-2">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma mensagem ainda</p>
                <p className="text-xs">Envie a primeira!</p>
              </div>
            )}
            {messages.map(msg => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
                  <div className={cn(
                    'max-w-[80%] px-3 py-2 rounded-lg text-sm',
                    isMe 
                      ? 'bg-primary text-primary-foreground rounded-br-none' 
                      : 'bg-muted rounded-bl-none'
                  )}>
                    {!isMe && (
                      <p className="text-xs font-semibold mb-0.5 opacity-80">{msg.sender_name}</p>
                    )}
                    <p>{msg.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                    {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 shrink-0">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            className="text-sm"
            disabled={!user}
          />
          <Button 
            size="icon" 
            onClick={handleSend} 
            disabled={!newMessage.trim() || isSending}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
