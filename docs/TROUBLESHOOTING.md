# 🔧 Resolução de Problemas

## Problemas Comuns

### Build falha
```bash
rm -rf node_modules/.vite
npm run build
```

### Tipos incorretos
```bash
npx supabase gen types typescript > src/integrations/supabase/types.ts
```

### Testes falhando
```bash
npx vitest --clearCache
npm test
```

### Supabase não conecta
1. Verificar VITE_SUPABASE_URL
2. Verificar VITE_SUPABASE_ANON_KEY
3. Verificar RLS policies

### Performance lenta
1. Verificar Network tab
2. Checar queries N+1
3. Verificar bundle size

## Logs
```bash
supabase logs
supabase functions logs nome
```

## Debug
```typescript
// Habilitar logs TanStack Query
import { QueryClient } from '@tanstack/react-query';
const qc = new QueryClient({
  logger: console
});
```

## Suporte
- GitHub Issues
- Documentação
