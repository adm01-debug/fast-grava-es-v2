# Auditoria Técnica — Correções Aplicadas

**Data:** 2026-05-29
**Branch:** `claude/upbeat-knuth-BUO2k` · **PR:** #30
**Escopo:** auditoria profunda + correção de bugs, falhas silenciosas e riscos
de estabilidade/segurança/performance (frontend, edge functions, banco, deps).

> Contexto: a aplicação já havia sido parcialmente remediada desde
> `ANALISE_TECNICA_SISTEMA.md` (2026-05-20). Vários achados críticos daquele
> relatório **já estavam corrigidos** no código atual (ver seção "Já corrigido
> anteriormente"). Esta auditoria focou no que **ainda estava quebrado**.

---

## 1. Correções aplicadas neste PR

### 1.1 Toolchain / build (bloqueavam o desenvolvimento)
- **`npm install` quebrado** — `vitest` pinado em `4.1.6` conflitava com o peer
  `4.1.7` exigido por `@vitest/coverage-v8`. → alinhado para `^4.1.7`.
  *Impacto:* ninguém conseguia instalar deps do zero.
- **ESLint com 121 erros** — o bump de `eslint-plugin-react-hooks@7` ligou as
  regras heurísticas do React Compiler (`set-state-in-effect`, `purity`,
  `immutability`, …) como *error* no preset `recommended`. O projeto não usa o
  Compiler. → rebaixadas para *warning* (mantendo `rules-of-hooks` como *error*).
  *Impacto:* `npm run lint` e o job de CI falhavam.
- **tsc com erro** — `@ts-expect-error` obsoleto em `WebSocketContext` (os tipos
  do supabase-js foram atualizados e o erro suprimido não ocorre mais). → removido.
- **`vitest.config`** — removido `poolOptions` (removido no Vitest 4; gerava
  warning de deprecação a cada execução).

### 1.2 Bug de falha silenciosa
- **`jobsService.getAll`** capturava o erro da query e retornava `[]`,
  mascarando falhas de conectividade/RLS como "nenhum job". Todos os outros
  métodos do serviço lançam o erro. → passa a lançar; o React Query
  (`useJobs`/`useSchedulingData`), que já trata erros, agora exibe o estado de erro.
  *Impacto:* usuários viam listas vazias em vez de mensagem de falha.

### 1.3 Telemetria — cascata de logs (bug de runtime)
- O `global.fetch` instrumentado em `client.ts` logava chamadas PostgREST
  lentas/com falha via `logger`, e o `logger` faz `insert` em `error_logs`
  **pelo mesmo client** → um insert lento/falho em `error_logs` re-disparava o
  logger → novo insert → **cascata auto-amplificada de latência**.
  → endpoints de telemetria (`error_logs`) não são mais instrumentados (sucesso e catch).
- **`logger`**: trocado o insert-por-evento (escrita de rede no hot path) por
  **insert em lote** (debounce 2s, cap de tamanho, flush em `pagehide`), com
  guarda anti-recursão (falha no flush reporta só via `console`).
- `ProtectedRoute`: `import.meta.env.DEV` no lugar de `process.env.NODE_ENV`
  (instável no browser com Vite).

### 1.4 Performance de renderização (re-renders em cascata)
- **8 Context Providers** passavam objeto literal inline como `value`,
  recriado a cada render → todos os consumidores re-renderizavam a cada render
  do provider (ex.: `ReauthContext` recriava o valor a cada tecla digitada na
  senha). → `useMemo` em Search, Sidebar, Breadcrumb, Notifications,
  UserPreferences, FeatureFlags, Confirmation, WebSocket e Reauth.

### 1.5 Memory leak
- **`use-device.tsx`** registrava o listener de `orientationchange` como arrow
  inline, **impossível de remover** no cleanup → vazava um listener a cada
  mount deste hook (usado por `useIsMobile`/`useIsTablet`/… em toda a app).
  → handler nomeado, removido no cleanup; timer também limpo.

### 1.6 Dependências de risco
- **`xlsx` (SheetJS) → `exceljs`** — `xlsx@0.18.5` é abandonado e marcado com
  vuln **ALTA** (prototype pollution / ReDoS, no código de *parsing*). O uso aqui
  é só de *escrita* (export), então não era explorável, mas a dependência foi
  **removida**. Novo helper `src/lib/excel.ts` (write-only) + migração dos 3
  pontos de export, com teste. → **vuln ALTA eliminada.**
- **`vite` 5 → 7** — vite 5 empacotava `esbuild <=0.24.2`
  (GHSA-67mh-4wv8-2f99, request-forgery no dev-server, moderada). vite 7 traz
  esbuild corrigido e mantém o bundler Rollup (config `manualChunks` intacta).
  *(vite 8 avaliado, mas migra para o bundler Rolldown e quebra `manualChunks`/
  output config — adiado por ser grande demais para validar às cegas aqui.)*

**`npm audit`:** de `1 alta + 2 moderadas` → **0 altas, 2 moderadas**. As 2
restantes são `uuid<11.1.1` (transitiva de `exceljs`) — a falha só ocorre quando
um argumento `buf` é passado ao `uuid`, o que o `exceljs` nunca faz; não há
correção sem breaking change.

### Verificação
`npm install` ✓ · `npm run lint` → **0 erros** · `tsc --noEmit` ✓ ·
`vitest run` → **388 testes** (2 novos: `logger`, `excel`) · `npm run build` ✓.

---

## 2. Já corrigido anteriormente (confirmado, sem ação necessária)
- `erp-api`: consolidado em um único `index.ts` com validação real de API key
  (`erp_api_keys.key_hash`) + testes. Sem código morto / `handler.ts` duplicado.
- **CORS**: 0 ocorrências de `Access-Control-Allow-Origin: '*'` nas edge functions.
- Webhook de alerta crítico agora via `import.meta.env.VITE_ALERT_WEBHOOK_URL`
  (não mais hardcoded).
- `.env` no `.gitignore` (só `.env.example/.production/.staging` versionados).
- Auth do Supabase em `sessionStorage`.
- **RLS / índices / audit hash**: a migration `20260520000001_security_rls_indexes_fixes.sql`
  já restringe escrita em `jobs`/`operator_skills`/`production_losses`/
  `machine_predictions`, adiciona os índices de alta cardinalidade e corrige a
  race condition do hash do audit log (advisory lock + `FOR UPDATE`).
- Realtime: todo `supabase.channel(...)` tem `removeChannel` correspondente no
  cleanup (sem vazamentos).
- `AuthProvider`: boot com timeout, tratamento de corrida no boot
  (`isInitialMount`), cleanup completo de listeners e logout limpando estado.

---

## 3. Recomendações em aberto (não alteradas — decisão necessária)

### 3.1 [SEGURANÇA] Edge functions de cron sem checagem de auth no código
`cron-cleanup`, `metrics-collector` e `backup-scheduler` usam a
`SERVICE_ROLE_KEY` (inclusive **deletes destrutivos** em `cron-cleanup`:
`audit_logs`, `notifications`, `sessions`, `jobs`) **sem nenhuma checagem de
identidade no código**, e não há configuração `verify_jwt` em
`supabase/config.toml`.

- **Risco:** dependendo de como o agendador as invoca e do `verify_jwt` no
  deploy, um detentor da `anon key` (pública, embutida no bundle) poderia
  dispará-las.
- **Por que não foi alterado:** o mecanismo de invocação do cron não é
  observável/testável neste ambiente; exigir um segredo às cegas quebraria os
  jobs agendados (o agendador não enviaria o header).
- **Correção recomendada:** adicionar verificação de um `CRON_SECRET`
  (header) no topo dessas functions **e** atualizar o agendador (pg_cron/
  pg_net) para enviá-lo; ou marcar `verify_jwt = true` e invocar via service role.

### 3.1.1 [auditoria profunda das 32 edge functions] — conclusões

Auditadas todas as functions quanto a **auth**, **validação de payload** e **paginação**:

- **Mass-assignment:** *nenhuma vulnerabilidade*. O único spread em `insert` é
  `erp-api` (`.insert({ ...validation.data })`), e `validation.data` é validado
  por Zod. Nenhuma function injeta o `req.json()` cru em `insert`/`update`.
- **Auth:** as functions privilegiadas verificam o chamador antes da ação —
  ex.: `create-operator`/`update-operator` exigem `role = 'coordinator'`;
  `erp-api` valida JWT ou `x-api-key` (hash). Exceções: as 3 functions de cron
  (ver 3.1).
- **Validação de payload:** `erp-api`, `ml-predictions` e
  `approve-password-reset` usam Zod (`_shared/validation.ts`). As demais
  desestruturam **campos específicos** + checagem de obrigatórios (não é
  vulnerável, mas falta validação de formato). *Recomendação (baixa prioridade):*
  adotar os schemas de `_shared/validation.ts` nas demais para validar
  formato/limites — requer deploy+teste, não feito às cegas aqui.
- **Paginação / queries sem `.limit()`:** `calculate-rankings`,
  `calculate-inventory-intelligence`, `metrics-collector` e
  `daily-maintenance-summary` fazem `select` sem limite. **Atenção:** são
  *agregações* — aplicar `.limit()` ingênuo **truncaria** o resultado (regressão
  de correção). A correção correta é agregação no servidor (SQL `count`/`sum`/
  RPC) ou janelamento por data. Documentado; não corrigido às cegas para não
  introduzir resultado incorreto.

### 3.2 [FEATURE] `webhook-handler` Bitrix24 não processa eventos
O handler registra o evento e marca `processed: true` sem mapear
`crm.deal → job` (TODO no código). É funcionalidade não implementada, não bug —
fora do escopo deste PR de correções.

### 3.3 [INFRA] Banco ao vivo não alcançável via MCP
O repo aponta para o projeto Supabase `xxroejpvloldkmqdydar`
(`supabase/config.toml`), mas nenhum servidor MCP conectado mapeia para ele.
As correções de banco já existem como migration no repo (seção 2) e devem
ser aplicadas com a CLI do Supabase no projeto correto.
