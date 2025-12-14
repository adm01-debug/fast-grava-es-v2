# Padrões de Error Handling e Retry - Documentação Técnica

## Visão Geral

Este documento descreve os padrões padronizados de tratamento de erros, retry automático e validação de dados implementados no projeto.

---

## 1. Error Handling Centralizado

### Arquivo: `src/lib/errorHandling.ts`

#### Estrutura do AppError

```typescript
interface AppError {
  code: string;
  message: string;        // Mensagem em português para o usuário
  originalError?: unknown;
  retryable: boolean;
  category: 'validation' | 'network' | 'database' | 'business' | 'unknown';
}
```

#### Códigos de Erro Suportados

| Código | Categoria | Retryable | Descrição |
|--------|-----------|-----------|-----------|
| `NETWORK_ERROR` | network | ✅ | Falha de conexão |
| `TIMEOUT` | network | ✅ | Timeout de requisição |
| `UNAUTHORIZED` | validation | ❌ | Não autorizado (401) |
| `FORBIDDEN` | validation | ❌ | Acesso negado (403) |
| `NOT_FOUND` | database | ❌ | Recurso não encontrado (404) |
| `CONFLICT` | database | ❌ | Conflito de dados (409) |
| `VALIDATION_ERROR` | validation | ❌ | Dados inválidos (422) |
| `RATE_LIMITED` | network | ✅ | Rate limit atingido (429) |
| `SERVER_ERROR` | database | ✅ | Erro interno (500+) |
| `SESSION_EXPIRED` | validation | ❌ | Sessão expirada |
| `UNKNOWN` | unknown | ❌ | Erro desconhecido |

#### Funções Disponíveis

```typescript
// Criar erro estruturado
const appError = createAppError(error);

// Exibir toast de erro com mensagem em português
showErrorToast(error, 'Contexto opcional');

// Handler para mutations
const errorHandler = createMutationErrorHandler('Contexto');
```

---

## 2. Retry Automático

### Arquivo: `src/lib/queryConfig.ts`

#### Configuração Padrão

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,    // 1 segundo
  maxDelay: 30000,       // 30 segundos
  backoffMultiplier: 2,  // Exponencial
};
```

#### Cálculo do Delay (Exponential Backoff com Jitter)

```typescript
function calculateRetryDelay(attemptIndex: number): number {
  const baseDelay = Math.min(
    RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attemptIndex),
    RETRY_CONFIG.maxDelay
  );
  // Adiciona jitter de ±25% para evitar thundering herd
  const jitter = baseDelay * 0.25 * (Math.random() - 0.5);
  return Math.round(baseDelay + jitter);
}
```

#### Erros que Permitem Retry

```typescript
function shouldRetry(error: unknown): boolean {
  // NÃO retry para:
  // - Erros de autenticação (401, 403)
  // - Erros de validação (422)
  // - Conflitos (409)
  // - Not found (404)
  
  // SIM retry para:
  // - Erros de rede
  // - Timeouts
  // - Rate limiting (429)
  // - Server errors (500+)
}
```

---

## 3. Stale Times Padronizados

### Configuração

```typescript
const STALE_TIMES = {
  STATIC: 5 * 60 * 1000,    // 5 minutos (técnicas, máquinas)
  DYNAMIC: 30 * 1000,       // 30 segundos (jobs)
  REALTIME: 10 * 1000,      // 10 segundos (alertas)
  LONG: 15 * 60 * 1000,     // 15 minutos (configurações)
};
```

### Uso nos Hooks

| Hook | Stale Time | Justificativa |
|------|------------|---------------|
| `useSchedulingData` (técnicas/máquinas) | 5 min | Dados raramente mudam |
| `useSchedulingData` (jobs) | 30 seg | Atualizações frequentes |
| `useTPMData` | 5 min | Manutenções planejadas |
| `useABCData` | 5 min | Custos históricos |
| `useMLPredictions` | 5 min | Predições periódicas |
| `useTechnicalSheets` | 5 min | Documentação técnica |

---

## 4. Hook useRetryableQuery

### Arquivo: `src/hooks/useRetryableQuery.ts`

Wrapper do `useQuery` com funcionalidades adicionais:

```typescript
const {
  data,
  isLoading,
  error,
  
  // Informações de erro aprimoradas
  appError,           // Erro estruturado
  isRetryable,        // Se pode tentar novamente
  isNetworkError,     // Se é erro de rede
  isAuthError,        // Se é erro de autenticação
  
  // Controles manuais
  manualRetry,        // Força nova tentativa
  forceRefetch,       // Refetch com limpeza de erro
  manualRetryCount,   // Contador de retries manuais
} = useRetryableQuery({
  queryKey: ['exemplo'],
  queryFn: fetchData,
  showErrorToast: true,
  customErrorMessage: 'Erro ao carregar dados',
  onRetry: (attempt, error) => console.log(`Tentativa ${attempt}`),
  onMaxRetriesReached: (error) => console.log('Máximo de tentativas atingido'),
});
```

---

## 5. Contextos de Erro por Módulo

### Padrão de Definição

```typescript
const ERROR_CONTEXT = {
  fetch: 'módulo.fetch',
  create: 'módulo.create',
  update: 'módulo.update',
  delete: 'módulo.delete',
};
```

### Contextos Implementados

| Módulo | Arquivo | Contextos |
|--------|---------|-----------|
| TPM | `src/hooks/tpm/types.ts` | fetch, create, update, delete, machines |
| ABC | `src/hooks/abc/types.ts` | fetch, calculate, create, update, delete |
| Technical Sheets | `src/hooks/useTechnicalSheets.ts` | fetch, create, update, delete, steps, materials, tips |
| Conversations | `src/hooks/useTechnicalConversations.ts` | fetch, create, update, delete, messages |
| Efficiency Alerts | `src/hooks/useEfficiencyAlertHistory.ts` | fetch, record, resolve |
| Operators | `src/hooks/useOperators.ts` | fetch, remove, toggle |

---

## 6. Validação de Dados

### Funções de Validação

```typescript
// Validar data
function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

// Validar job
function isValidJob(job: unknown): job is Job {
  return job !== null && typeof job === 'object' && 'id' in job;
}

// Sanitizar número
function sanitizeNumber(value: unknown, defaultValue = 0): number {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

// Limitar porcentagem
function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, value));
}
```

### Hooks com Validação Implementada

- `useKPIs.ts` - Valida arrays e números
- `useOEE.ts` - Valida datas e percentuais
- `useBottleneckPrediction.ts` - Valida datas e capacidades
- `useLoadBalancingWithActions.ts` - Valida datas antes de calcular slots
- `useSmartSequencingWithActions.ts` - Valida datas ao sequenciar

---

## 7. Realtime Subscriptions

### Padrão de Implementação

```typescript
useEffect(() => {
  const channel = supabase
    .channel('nome-canal')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tabela' },
      () => {
        queryClient.invalidateQueries({ queryKey: ['query-key'] });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [queryClient]);
```

### Tabelas com Realtime Ativo

| Tabela | Hook | Eventos |
|--------|------|---------|
| `jobs` | `useSchedulingData` | INSERT, UPDATE, DELETE |
| `machines` | `useSchedulingData` | INSERT, UPDATE, DELETE |
| `techniques` | `useSchedulingData` | INSERT, UPDATE, DELETE |
| `efficiency_alert_history` | `useEfficiencyAlertHistory` | INSERT, UPDATE |
| `qr_scan_history` | `useQRScanner` | INSERT |
| `technical_sheets` | `useTechnicalSheets` | INSERT, UPDATE, DELETE |
| `technical_conversations` | `useTechnicalConversations` | INSERT, UPDATE, DELETE |
| `operator_goals` | `useOperatorGoals` | INSERT, UPDATE, DELETE |
| `operator_machines` | `useOperatorMachines` | INSERT, DELETE |

---

## 8. Padrão de Mutation com Error Handling

```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const { error } = await supabase.from('tabela').insert(data);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['query-key'] });
    toast.success('Operação realizada com sucesso');
  },
  onError: (error: Error) => {
    showErrorToast(error, ERROR_CONTEXT.create);
  },
});
```

---

## 9. .single() vs .maybeSingle()

### Quando Usar

| Método | Uso | Comportamento |
|--------|-----|---------------|
| `.single()` | INSERT/UPDATE que DEVE retornar 1 registro | Lança erro se 0 ou 2+ registros |
| `.maybeSingle()` | SELECT que PODE não encontrar | Retorna `null` se 0 registros |

### Exemplo Correto

```typescript
// SELECT - pode não encontrar
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle();

// INSERT - sempre retorna o registro criado
const { data } = await supabase
  .from('jobs')
  .insert(newJob)
  .select()
  .single();
```

---

## 10. Performance - Operações Paralelas

### Padrão com Promise.all

```typescript
// ❌ Sequencial (lento)
for (const item of items) {
  await supabase.from('tabela').update(item);
}

// ✅ Paralelo (rápido)
await Promise.all(
  items.map(item => 
    supabase.from('tabela').update(item)
  )
);
```

### Hooks Otimizados

- `useLoadBalancingWithActions` - `applyMultipleSuggestions` em paralelo
- `useSmartSequencingWithActions` - Updates de jobs em paralelo
- `useTPMMutations` - Geração de alertas em paralelo
- `useABCCalculations` - Cálculo de custos com batching (5 por vez)

---

## 11. Checklist de Implementação

Ao criar um novo hook de dados:

- [ ] Importar `defaultQueryOptions` de `@/lib/queryConfig`
- [ ] Definir `ERROR_CONTEXT` para o módulo
- [ ] Usar `staleTime` apropriado
- [ ] Implementar try/catch com `showErrorToast`
- [ ] Usar `.maybeSingle()` para SELECTs opcionais
- [ ] Adicionar realtime subscription se necessário
- [ ] Validar dados de entrada
- [ ] Usar `Promise.all` para operações paralelas
- [ ] Definir `limit` apropriado (mínimo 200)
- [ ] Testar cenários de erro

---

## Referências

- `src/lib/errorHandling.ts` - Utilitários de erro
- `src/lib/queryConfig.ts` - Configuração de retry e paginação
- `src/hooks/useRetryableQuery.ts` - Hook wrapper com retry
- `src/test/setup.ts` - Configuração de testes
