# Dados em Tempo Real

## Supabase Realtime
```tsx
const { data } = useSubscription('jobs', {
  event: '*',
  callback: handleChange,
});
```

## WebSocket
```tsx
const { isConnected, lastUpdate } = useRealtimeConnection();
```
