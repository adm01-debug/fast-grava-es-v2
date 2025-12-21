import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketContextType {
  status: ConnectionStatus;
  send: (message: any) => void;
  subscribe: (channel: string, callback: (data: any) => void) => () => void;
  lastMessage: any;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children, url }: { children: ReactNode; url?: string }) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    if (!url) return;
    
    const ws = new WebSocket(url);
    
    ws.onopen = () => setStatus('connected');
    ws.onclose = () => setStatus('disconnected');
    ws.onerror = () => setStatus('error');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastMessage(data);
      const channelSubs = subscribers.get(data.channel);
      channelSubs?.forEach(cb => cb(data));
    };

    setSocket(ws);
    return () => ws.close();
  }, [url]);

  const send = useCallback((message: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }, [socket]);

  const subscribe = useCallback((channel: string, callback: (data: any) => void) => {
    setSubscribers(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(channel)) newMap.set(channel, new Set());
      newMap.get(channel)!.add(callback);
      return newMap;
    });

    return () => {
      setSubscribers(prev => {
        const newMap = new Map(prev);
        newMap.get(channel)?.delete(callback);
        return newMap;
      });
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ status, send, subscribe, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
  return context;
}
