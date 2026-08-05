# Relatório de Análise Técnica — FAST GRAVAÇÕES ES v2

**Data:** 2026-05-20  
**Analista:** Desenvolvedor Back-End Sênior (Claude Code)  
**Escopo:** Análise completa do sistema — arquitetura, segurança, banco de dados, performance, manutenibilidade e operacionalidade  
**Stack identificada:** React 18 + TypeScript + Vite + Supabase (PostgreSQL + Edge Functions Deno) + TailwindCSS + shadcn/ui

---

## Sumário Executivo

O sistema **FAST GRAVAÇÕES ES v2** é uma aplicação web de gestão de produção industrial (gravação de produtos personalizados) com arquitetura SPA (Single Page Application) hospedada na plataforma Lovable, utilizando Supabase como backend-as-a-service. A aplicação apresenta escopo funcional altamente ambicioso (>50 páginas, 70 providers, 30 Edge Functions, 135 migrações de banco), porém com diversas lacunas críticas de segurança, estabilidade e manutenibilidade que requerem atenção imediata antes de qualquer expansão de funcionalidades.

### Achados Críticos (Top 5)

| # | Problema | Severidade | Impacto |
|---|---------|-----------|---------|
| 1 | ERP API com código morto e autenticação fraca | **CRÍTICA** | Segurança / Estabilidade |
| 2 | Políticas RLS excessivamente permissivas (USING true) | **CRÍTICA** | Segurança |
| 3 | CORS wildcard em todas as Edge Functions | **ALTA** | Segurança |
| 4 | URL de webhook hardcoded em código de produção | **ALTA** | Segurança / Operabilidade |
| 5 | Cobertura de testes negligenciada (10 arquivos / 802 fontes) | **ALTA** | Estabilidade |

---

## 1. Segurança

### 1.1 ERP API — Código Morto + Autenticação Insuficiente

**Severidade:** CRÍTICA | **Prioridade:** Imediata

**Evidência:**
```typescript
// supabase/functions/erp-api/index.ts — linha 99
serve(handler);

/*
serve(async (req) => {
  // Handle CORS preflight
  // ... código morto comentado, mas ainda presente ...
*/

// Código que EXECUTA abaixo do comentário de bloco:
const url = new URL(req.url);
```

O arquivo `index.ts` do ERP possui um bloco `serve(handler)` na linha 99 e um segundo `serve()` **comentado** (linha 102), porém o código interno ao comentário (`const url = new URL(req.url)...`) está **fora** do bloco de comentário e continua sendo compilado. Isso cria comportamento undefined — o `serve(handler)` é chamado, mas o código a seguir é código morto solto que pode causar erros de runtime no Deno.

Adicionalmente, o `handler.ts` nunca persiste dados no banco — retorna UUIDs gerados em memória sem INSERT real:

```typescript
// handler.ts — simula criação mas não grava no banco
return new Response(JSON.stringify({
  id: crypto.randomUUID(),  // UUID falso, não existe no DB
  ...validation.data,
  status: 'queue',
  created_at: new Date().toISOString()
}), { status: 201, ... });
```

A autenticação do ERP aceita **qualquer** Bearer token sem validação real:
```typescript
// Comentário diz: "In production, implement proper API key validation"
if (!authHeader && !apiKey) {
  if (endpoint !== 'docs' && endpoint !== '') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
}
// Qualquer Bearer token passa
```

**Impacto:** Dados de produção (jobs, máquinas, operadores) acessíveis via API pública sem validação de identidade real. O `PATCH /jobs/:id` aceita qualquer campo sem validação de schema:

```typescript
if (method === 'PATCH' && jobId) {
  const body = await req.json();  // sem validação do tipo/campos
  const { data, error } = await supabase.from('jobs').update(body)  // mass assignment
```

**Recomendação:**
1. Unificar em um único `serve()` limpo
2. Implementar validação de API keys via tabela `api_keys` no banco com hash HMAC-SHA256
3. Adicionar schema de validação Zod no endpoint PATCH
4. Sincronizar `handler.ts` com `index.ts` ou eliminar a duplicação

---

### 1.2 Políticas RLS Excessivamente Permissivas

**Severidade:** CRÍTICA | **Prioridade:** Imediata

**Evidência:**
```sql
-- 20251214173607 — tabelas de predições ML
CREATE POLICY "System can manage predictions" ON public.machine_predictions 
FOR ALL USING (true) WITH CHECK (true);

-- 20251212212803 — tabela principal de jobs
CREATE POLICY "Authenticated users can insert jobs" ON public.jobs 
FOR INSERT WITH CHECK (true);  -- qualquer usuário autenticado pode inserir

CREATE POLICY "Authenticated users can delete jobs" ON public.jobs 
FOR DELETE USING (true);  -- qualquer usuário pode deletar qualquer job
```

Das 135 migrações, **70 criam/alteram tabelas com RLS habilitado**, mas grande parte usa `USING (true)` em operações de escrita (INSERT/UPDATE/DELETE/ALL), o que neutraliza o propósito do RLS. Qualquer usuário autenticado com o `anon_key` pode deletar registros de produção.

**Tabelas críticas afetadas:**
- `jobs` — operações de DELETE sem restrição de role
- `machine_predictions`, `prediction_history`, `machine_health_metrics`
- `spc_capability_history`
- `operator_skills` — `FOR ALL USING (auth.role() = 'authenticated')` (sem verificar cargo)
- `production_losses` — qualquer autenticado pode inserir

**Recomendação:** Implementar verificação de role via função helper:
```sql
-- Criar função helper
CREATE OR REPLACE FUNCTION public.is_coordinator_or_manager()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('coordinator', 'manager')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Aplicar nas políticas críticas
CREATE POLICY "Only coordinators can delete jobs" ON public.jobs 
FOR DELETE USING (public.is_coordinator_or_manager());
```

---

### 1.3 CORS Wildcard em Todas as Edge Functions

**Severidade:** ALTA | **Prioridade:** Alta

**Evidência:**
```typescript
// Presente em TODAS as 20+ Edge Functions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // permite qualquer origem
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};
```

Edge Functions com dados sensíveis (ERP, rate-limit, validate-login-ip, security-alert) aceitam requisições de qualquer domínio. Isso facilita CSRF e requests cross-site.

**Recomendação:**
```typescript
const ALLOWED_ORIGINS = [
  'https://fastgravacoes.com.br',
  'https://app.fastgravacoes.com.br',
  Deno.env.get('APP_URL') || '',
].filter(Boolean);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Vary': 'Origin',
  };
}
```

---

### 1.4 URL de Webhook Hardcoded em Produção

**Severidade:** ALTA | **Prioridade:** Alta

**Evidência:**
```typescript
// src/lib/logger.ts — linha 114
const WEBHOOK_URL = 'https://n8n.fastgravacoes.com.br/webhook/alerts';
if (!isDev) {
  fetch(WEBHOOK_URL, { ... })
}
```

URL de infraestrutura interna exposta no bundle JavaScript do cliente (visível em DevTools de qualquer usuário). Qualquer pessoa pode:
1. Descobrir a URL do n8n da empresa
2. Enviar requisições falsas ao webhook
3. Tentar ataques ao n8n se exposto publicamente

**Recomendação:** Mover para variável de ambiente ou encaminhar via Edge Function:
```typescript
// Correto: usar env var
const WEBHOOK_URL = import.meta.env.VITE_ALERT_WEBHOOK_URL;

// Ainda melhor: proxy via Edge Function autenticada
// client → supabase/functions/security-alert → n8n (server-side)
```

---

### 1.5 Supabase Auth Storage em localStorage

**Severidade:** MÉDIA | **Prioridade:** Importante

**Evidência:**
```typescript
// src/integrations/supabase/client.ts
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,  // sessão persiste em localStorage
    persistSession: true,
  }
});
```

Sessões armazenadas em `localStorage` são vulneráveis a ataques XSS — qualquer script malicioso pode roubar o token de sessão. O Supabase por padrão usa `localStorage` mas para aplicações industriais com dados sensíveis recomenda-se `sessionStorage` ou cookies HTTP-only.

**Recomendação:**
```typescript
// Para maior segurança:
auth: {
  storage: sessionStorage,  // não persiste após fechar aba
  persistSession: false,    // força re-login
  autoRefreshToken: true,
}
// Ou implementar token rotation com cookies HTTP-only via Edge Function
```

---

### 1.6 Chave Supabase Exposta em .env Commitado

**Severidade:** ALTA | **Prioridade:** Imediata

**Evidência:**
```
# .env (commitado no repositório)
VITE_SUPABASE_PROJECT_ID="xxroejpvloldkmqdydar"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://xxroejpvloldkmqdydar.supabase.co"
```

O arquivo `.env` contém a chave anon do Supabase e está **commitado no repositório Git**. Embora a `anon_key` seja pública por design, commitá-la junto com o Project ID no histórico Git cria risco desnecessário se a conta tiver configurações RLS fracas (já confirmado acima).

**Recomendação:**
- Adicionar `.env` ao `.gitignore`
- Manter apenas `.env.example` no repositório
- Usar variáveis de ambiente via CI/CD para deploys

---

## 2. Banco de Dados

### 2.1 Volume Excessivo de Migrações sem Consolidação

**Severidade:** MÉDIA | **Prioridade:** Importante

**Evidência:**
- **135 arquivos de migração** gerados entre Dez/2024 e Mai/2026
- Nomes com UUIDs gerados automaticamente: `20251212212803_e2782029-230e-4f88-9202-4824107dd660.sql`
- Diversas migrações adicionam colunas que poderiam ter sido incluídas nas tabelas originais

Este padrão indica geração automática via plataforma Lovable sem revisão humana. O custo operacional de manter e auditar 135 migrações é alto, e o tempo de aplicação em novos ambientes é significativo.

**Recomendação:**
- Consolidar migrações mensalmente em uma "baseline migration"
- Adotar convenção de nomenclatura: `YYYYMMDD_descricao_legivel.sql`
- Implementar revisão obrigatória de migrações via PR antes de aplicar em produção

---

### 2.2 Ausência de Índices em Colunas de Alta Cardinalidade

**Severidade:** ALTA | **Prioridade:** Importante

**Evidência:**
```sql
-- Tabela jobs: consultada com filtros frequentes sem índices correspondentes
SELECT * FROM jobs WHERE scheduled_date = $1;  -- sem índice em scheduled_date
SELECT * FROM jobs WHERE status = $1;          -- sem índice em status
SELECT * FROM jobs WHERE technique_id = $1;    -- sem índice em technique_id (FK)
```

Apenas **72 índices** foram definidos para um esquema com >40 tabelas e múltiplas FKs. Queries do dashboard e calendário (que filtram por data, status e técnica) realizarão full-table scans conforme o volume crescer.

**Recomendação:**
```sql
-- Índices prioritários para tabela jobs (>90% das queries)
CREATE INDEX idx_jobs_scheduled_date ON public.jobs(scheduled_date);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_technique_machine ON public.jobs(technique_id, machine_id);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);

-- Índice composto para dashboard do dia
CREATE INDEX idx_jobs_date_status ON public.jobs(scheduled_date, status) 
  WHERE status NOT IN ('cancelled', 'finished');
```

---

### 2.3 Trigger de Hashing do Audit Log com Race Condition

**Severidade:** ALTA | **Prioridade:** Importante

**Evidência:**
```sql
-- 20260512180411 — trigger de encadeamento de audit log
CREATE OR REPLACE FUNCTION public.process_audit_log_hashing()
RETURNS TRIGGER AS $$
DECLARE
    last_hash text;
BEGIN
    -- Obter o hash do registro anterior para encadeamento
    SELECT hash INTO last_hash 
    FROM public.audit_log 
    ORDER BY created_at DESC, id DESC 
    LIMIT 1;  -- PROBLEMA: sem lock, race condition em inserts concorrentes
    
    NEW.previous_hash := COALESCE(last_hash, 'GENESIS');
    NEW.hash := public.calculate_audit_hash(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Em ambiente de produção com múltiplas Edge Functions executando simultaneamente, dois inserts concorrentes podem ler o mesmo `last_hash` e gerar hashes encadeados divergentes, **quebrando a integridade da cadeia de auditoria** — o que é justamente a garantia que se quer oferecer.

**Recomendação:**
```sql
-- Usar SERIALIZABLE isolation ou lock explícito
CREATE OR REPLACE FUNCTION public.process_audit_log_hashing()
RETURNS TRIGGER AS $$
DECLARE
    last_hash text;
BEGIN
    -- Lock pessimista para evitar race condition
    SELECT hash INTO last_hash 
    FROM public.audit_log 
    ORDER BY created_at DESC, id DESC 
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
    
    NEW.previous_hash := COALESCE(last_hash, 'GENESIS');
    NEW.hash := public.calculate_audit_hash(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 2.4 Coluna `start_time`/`end_time` como TEXT na Tabela Principal

**Severidade:** BAIXA | **Prioridade:** Desejável

**Evidência:**
```sql
-- 20251212212803 — tabela jobs
CREATE TABLE public.jobs (
  start_time TEXT,   -- deveria ser TIME ou TIMESTAMP
  end_time TEXT,     -- sem constraint de formato
  ...
);
```

Colunas de tempo armazenadas como TEXT não permitem comparações temporais eficientes, ordenação correta, ou queries tipo `WHERE start_time BETWEEN`. Também não há validação de formato no banco.

**Recomendação:** Migrar para `TIME` ou `TIMESTAMP WITH TIME ZONE`.

---

## 3. Arquitetura e Manutenibilidade

### 3.1 Pirâmide de Context Providers (Provider Hell)

**Severidade:** MÉDIA | **Prioridade:** Importante

**Evidência:**
```tsx
// src/providers/AppProviders.tsx — 70 referências a Provider
function ComposedProviders({ children }) {
  return (
    <ThemeProvider>
      <ThemeContextProvider>
        <TooltipProvider>
          <UserPreferencesProvider>
            <FeatureFlagsProvider>
              <BreadcrumbProvider>
                <SearchProvider>
                  <SidebarProvider>
                    <ConfirmationProvider>
                      <NotificationsProvider>
                        <AuthProvider>
                          <ReauthProvider>
                            <PermissionsProvider>
                              <OfflineSyncProvider>
                                <NetworkStatusProvider>
                                  <WebSocketProvider>
                                    <EfficiencyNotificationProvider>
                                      <RealtimeNotificationsProvider>
                                        <ProductDesignProvider>
                                          <CelebrationProvider>
                                            <FeedbackProvider>
                                              {children}
```

**21 níveis de aninhamento de Context** causam:
- Re-renders em cascata quando qualquer estado muda
- Dificuldade de debug (qual provider causou o re-render?)
- Performance degradada em dispositivos móveis (KioskPage, OperatorView)
- Impossibilidade de lazy-load providers por funcionalidade

**Recomendação:** Consolidar providers relacionados e usar Zustand (já instalado) para estado global que não precisa de Context:
```tsx
// Antes: 3 providers separados
<NotificationsProvider>
  <EfficiencyNotificationProvider>
    <RealtimeNotificationsProvider>

// Depois: 1 store Zustand + 1 provider para subscription
const useNotificationStore = create<NotificationState>(...)
// + um único RealtimeProvider que alimenta o store
```

---

### 3.2 Cobertura de Testes Criticamente Baixa

**Severidade:** ALTA | **Prioridade:** Alta

**Evidência:**
- **802 arquivos** `.ts`/`.tsx` no projeto
- **10 arquivos** de teste (`.test.tsx`)
- **0 testes unitários** para Edge Functions de negócio crítico (ERP API, rate-limit, validate-login-ip)
- **0 coverage thresholds** configurados no `vitest.config.ts`
- Sem `c8` ou `istanbul` configurado com minimum coverage

```typescript
// vitest.config.ts — sem threshold de cobertura
export default defineConfig({
  test: {
    environment: 'jsdom',
    // sem coverage.thresholds
  }
});
```

Taxa estimada de cobertura: **< 1.5%**

**Recomendação:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
      },
      include: ['src/features/**', 'src/lib/**', 'src/hooks/**'],
    }
  }
});
```

Prioridade de testes: `authService`, `rateLimiter`, `circuitBreaker`, `sanitize`, `erp-api/handler`.

---

### 3.3 Duplicação de Lógica entre `erp-api/index.ts` e `erp-api/handler.ts`

**Severidade:** ALTA | **Prioridade:** Alta

**Evidência:**
- `index.ts` tem implementação completa das rotas (jobs, machines, operators, lots, KPIs)
- `handler.ts` tem implementação alternativa e **incompleta** das mesmas rotas
- `index.ts` chama `serve(handler)` (usa handler.ts), mas contém código morto implementando as mesmas rotas
- `handler.ts` retorna dados **falsos** (sem gravar no banco)

Resultado: a Edge Function deployada provavelmente retorna respostas falsas para integrações ERP.

**Recomendação:** Eliminar `handler.ts`, consolidar toda lógica em `index.ts` com implementação real.

---

### 3.4 Dependência Desatualizada com Vulnerabilidade Conhecida

**Severidade:** ALTA | **Prioridade:** Alta

**Evidência:**
```json
// package.json
"xlsx": "0.18.5"
```

`xlsx@0.18.5` (SheetJS Community) possui **CVE-2023-30533** — prototype pollution que permite RCE em Node.js ao processar arquivos XLS/XLSX maliciosos. Embora o uso seja client-side, a parsing de arquivos enviados por usuários apresenta risco de DoS.

Adicionalmente, as Edge Functions usam `deno.land/std@0.168.0` (21 funções), uma versão de 2022 com patches de segurança não aplicados.

**Recomendação:**
- Migrar xlsx para `exceljs` (ativo, auditado) ou `@xmldom/xmldom` + XLSX spec manual
- Atualizar deno.land/std para `0.224.0` (LTS atual)

---

### 3.5 Deno.land Import Map sem Lock File Verificado

**Severidade:** MÉDIA | **Prioridade:** Importante

**Evidência:**
```typescript
// Todas as Edge Functions — importação via esm.sh sem lock file
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.22.4";
```

Imports via `esm.sh` são resolvidos em runtime — se o CDN for comprometido ou mudar, o comportamento muda sem aviso. Sem `deno.lock` verificado no repositório, não há garantia de reprodutibilidade de builds.

**Recomendação:** Usar Import Maps do Supabase:
```json
// supabase/functions/import_map.json
{
  "imports": {
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2.47.0",
    "zod/": "https://esm.sh/zod@3.22.4/"
  }
}
```

---

## 4. Performance

### 4.1 Ausência de Paginação Server-Side em Listagens

**Severidade:** ALTA | **Prioridade:** Importante

**Evidência:**
```typescript
// erp-api/index.ts — handleKPIs busca todos os jobs do dia sem limit
const { data: todayJobs } = await supabase
  .from('jobs')
  .select('status, quantity, produced_quantity, ...')
  .eq('scheduled_date', today);  // sem .limit() — pode retornar milhares

// ml-predictions — busca 500 jobs de uma vez
supabase.from("jobs").select("*").in("status", [...]).limit(500)
```

Em produção com 1-2 anos de dados, queries sem paginação adequada causarão timeouts nas Edge Functions (máximo 10s para funções Supabase).

**Recomendação:** Implementar cursor-based pagination para todas as listagens e adicionar `.limit()` em todas as queries analíticas.

---

### 4.2 Logger Síncrono com Chamadas Supabase em Hot Path

**Severidade:** MÉDIA | **Prioridade:** Importante

**Evidência:**
```typescript
// src/lib/logger.ts — chamado em cada request de API
function createEntry(level: LogLevel, ...) {
  if (level === 'error' || level === 'warn') {
    const persistError = async () => {
      await supabase.from('error_logs').insert({ ... });  // I/O network call
    };
    persistError();  // fire-and-forget mas gera promises penduradas
  }
}

// src/integrations/supabase/client.ts — executa em CADA request
global: {
  fetch: async (url, options) => {
    // ...
    import('@/lib/logger').then(({ logger }) => {  // dynamic import em hot path
      if (!response.ok) logger.error(...)
      else if (duration > 1500) logger.warn(...)  // dispara insert no banco
    });
  }
}
```

Cada chamada lenta ao Supabase dispara um `warn` que dispara outro `insert` no Supabase (`error_logs`), criando potencial loop de latência.

**Recomendação:** 
- Usar buffer de logs com flush assíncrono (batched inserts)
- Separar instrumentação de telemetria da lógica de negócio
- Considerar Sentry (já listado como dependência opicional no `.env.example`) em vez de tabela customizada

---

### 4.3 Bundle Size Sem Análise

**Severidade:** MÉDIA | **Prioridade:** Desejável

**Evidência:**
```typescript
// vite.config.ts — sem bundle analysis, sem treeshaking report
build: {
  target: 'esnext',
  sourcemap: false,  // sem sourcemap em prod dificulta debug
  chunkSizeWarningLimit: 1000,  // limite alto (1MB) esconde problemas
}
```

Dependências de alto peso identificadas:
- `framer-motion@12.39.0` (~100KB gzip)
- `recharts@2.15.4` (~80KB)
- `mermaid@11.15.0` (~600KB — carregado em toda a aplicação?)
- `html2canvas` + `jspdf` + `jspdf-autotable` + `jszip` (raramente usados mas sempre no bundle)

**Recomendação:**
- Adicionar `rollup-plugin-visualizer` para análise de bundle
- Lazy-load mermaid apenas em páginas que o usam
- Mover exports (PDF, Excel, ZIP) para Edge Functions server-side

---

## 5. Operacionalidade

### 5.1 CI/CD Incompleto — Sem Pipeline de Deploy

**Severidade:** ALTA | **Prioridade:** Alta

**Evidência:**
- Apenas **1 workflow** de CI: `.github/workflows/playwright.yml`
- Nenhum workflow de **deploy automático** (Vercel, Netlify, ou Supabase CLI)
- Nenhum pipeline para aplicação de **migrações SQL** em produção
- Sem estágio de **security scan** (Snyk, Trivy, npm audit)
- Sem **lint check** obrigatório que bloqueie merges

```yaml
# playwright.yml — o único pipeline existente
# Só roda testes, sem deploy ou migration apply
```

**Recomendação:** Adicionar pipelines:
```yaml
# .github/workflows/deploy.yml
name: Deploy Production
on:
  push:
    branches: [main]
jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
  
  apply-migrations:
    needs: security-scan
    steps:
      - uses: supabase/setup-cli@v1
      - run: supabase db push --db-url ${{ secrets.DATABASE_URL }}
  
  deploy:
    needs: apply-migrations
    ...
```

---

### 5.2 Ausência de Monitoramento e Alertas Estruturados

**Severidade:** ALTA | **Prioridade:** Alta

**Evidência:**
- Sentry configurado como **opcional** (sem DSN em produção confirmado)
- Logger customizado que escreve em tabela `error_logs` (sem dashboard de alerta)
- Webhook de alerta crítico hardcoded (n8n) sem fallback
- Sem healthcheck endpoint documentado (existe `health-check` Edge Function mas não integrada a nenhum monitor externo)
- Sem métricas de SLA/SLO definidas

**Recomendação:**
- Configurar Sentry com DSN obrigatório em produção
- Definir alertas no Supabase Dashboard para queries lentas (> 2s)
- Integrar UptimeRobot ou Better Uptime no endpoint `health-check`
- Definir SLOs: uptime 99.5%, P95 latency < 800ms

---

### 5.3 Service Worker Manual Conflitando com vite-plugin-pwa

**Severidade:** BAIXA | **Prioridade:** Desejável

**Evidência:**
```javascript
// public/sw.js — Service Worker manual, básico (cache-first genérico)
const CACHE_NAME = 'fast-grava-v2';
```

```json
// package.json — vite-plugin-pwa também gera SW automaticamente
"vite-plugin-pwa": "^1.2.0"
```

Dois Service Workers em potencial conflito: o manual em `/public/sw.js` e o gerado pelo plugin Vite. Isso pode causar comportamento imprevisível de cache e atualizações de PWA que não chegam ao usuário.

**Recomendação:** Escolher um: usar exclusivamente `vite-plugin-pwa` com `generateSW` mode (mais completo, com Workbox strategies), removendo o SW manual.

---

## 6. Integração (Bitrix24)

### 6.1 Webhook Bitrix24 com TODO Não Implementado

**Severidade:** ALTA | **Prioridade:** Alta

**Evidência:**
```typescript
// supabase/functions/webhook-handler/index.ts
async function processBitrix24Webhook(supabase, event, data) {
  await supabase.from("bitrix24_sync_history").insert({
    event_type: event, payload: data, status: 'received'
  });

  // TODO: Implementar mapeamento dinâmico de campos Bitrix24 -> Hyper-Logistics
  return { source: "bitrix24", event, processed: true };
}
```

O webhook registra a chegada do evento, mas **não processa nada**. Todos os eventos Bitrix24 são marcados como `processed: true` sem ação real. A sincronização bidirecional é uma feature não implementada.

**Recomendação:** Implementar handler real com mapeamento `crm.deal` → `job`, incluindo testes de integração.

---

### 6.2 Credenciais OAuth Bitrix24 em Variáveis de Ambiente sem Rotação

**Severidade:** ALTA | **Prioridade:** Alta

**Evidência:**
```typescript
// bitrix24-sync/index.ts
const BITRIX24_ACCESS_TOKEN_ENV = Deno.env.get('BITRIX24_ACCESS_TOKEN');
const BITRIX24_REFRESH_TOKEN_ENV = Deno.env.get('BITRIX24_REFRESH_TOKEN');
```

Tokens OAuth armazenados como variáveis de ambiente de Edge Function não suportam rotação automática. Quando o access token expira (tipicamente 1 hora no Bitrix24), é necessário intervenção manual para atualizar a variável.

A função tenta persistir tokens renovados no banco (`bitrix24_oauth_tokens`), mas a lógica de seed inicial ainda depende das env vars — criando inconsistência.

**Recomendação:** Implementar OAuth flow completo server-side com refresh automático via cron job, usando exclusivamente a tabela `bitrix24_oauth_tokens`.

---

## 7. Lista de Prioridades (Roadmap de Correções)

### Crítico — Próximas 2 Semanas

| # | Ação | Esforço |
|---|------|---------|
| 1 | Corrigir ERP API: unificar index.ts + handler.ts, implementar autenticação real por API key | 2-3 dias |
| 2 | Corrigir políticas RLS: substituir `USING (true)` por verificações de role em todas as operações de escrita | 2-3 dias |
| 3 | Adicionar `.env` ao `.gitignore` e remover do histórico Git (`git filter-branch`) | 2h |
| 4 | Corrigir PATCH endpoint sem validação de schema (mass assignment) | 4h |

### Alta — Próximo Mês

| # | Ação | Esforço |
|---|------|---------|
| 5 | Implementar CORS restritivo nas Edge Functions | 1 dia |
| 6 | Mover webhook URL para env var | 2h |
| 7 | Atualizar xlsx para exceljs + deno.land/std para 0.224.0 | 1 dia |
| 8 | Criar pipeline de deploy + migration apply no CI/CD | 2 dias |
| 9 | Configurar Sentry obrigatório + alertas no Supabase Dashboard | 1 dia |
| 10 | Adicionar índices nas colunas de alta cardinalidade (scheduled_date, status, technique_id) | 4h |
| 11 | Aumentar cobertura de testes para mínimo 60% no core de negócio | 1-2 semanas |

### Importante — Próximo Trimestre

| # | Ação | Esforço |
|---|------|---------|
| 12 | Implementar mapeamento Bitrix24 webhook → jobs | 1 semana |
| 13 | Consolidar providers redundantes com Zustand | 1 semana |
| 14 | Corrigir race condition no trigger de audit log hashing | 4h |
| 15 | Implementar paginação server-side em todas as listagens | 1 semana |
| 16 | Consolidar 135 migrações em baseline | 2 dias |

### Desejável — Backlog

| # | Ação | Esforço |
|---|------|---------|
| 17 | Migrar colunas `start_time`/`end_time` TEXT → TIMESTAMP | 4h |
| 18 | Análise e otimização de bundle (mermaid lazy-load, exports server-side) | 3 dias |
| 19 | Migrar SW manual para vite-plugin-pwa | 1 dia |
| 20 | Implementar Import Maps para Edge Functions | 4h |
| 21 | Definir SLOs e dashboards de observabilidade | 3 dias |

---

## 8. Benchmarking — Comparação com Padrões de Mercado

| Dimensão | Fast Gravações ES v2 | Padrão Mercado (MES Industrial) |
|---------|---------------------|--------------------------------|
| Cobertura de testes | ~1.5% | 60-80% |
| Tempo de build | ~2-3 min (estimado) | < 2 min com cache |
| RLS granularidade | Baixa (USING true) | Alta (por role + tenant) |
| Número de migrações | 135 em ~6 meses | 20-40 por ciclo de release |
| Providers de Context | 21 aninhados | 3-5 (Zustand + React Query) |
| Edge Functions sem teste | 28/30 | 0% sem testes de integração |
| CI/CD pipelines | 1 (só testes E2E) | 3-5 (build, test, scan, deploy) |
| Monitoramento | Parcial (log table) | APM completo (Datadog/Sentry) |
| Documentação API | Inline no código | OpenAPI 3.0 + Postman Collection |

---

## 9. Pontos Fortes Identificados

Para equilíbrio, os seguintes aspectos estão bem implementados:

1. **Circuit Breaker Pattern** (`src/lib/circuitBreaker.ts`) — implementação correta com estados CLOSED/OPEN/HALF_OPEN
2. **Rate Limiter Client-Side** (`src/lib/rateLimiter.ts`) — Token Bucket algorithm com instâncias pré-configuradas
3. **Retry with Backoff** (`src/lib/retryWithBackoff.ts`) — exponential backoff com jitter, bem configurado
4. **Input Sanitization** (`src/lib/sanitize.ts`) — cobertura adequada de XSS e injection básico
5. **Lazy Loading de Rotas** — todas as páginas carregadas via `React.lazy()` com Suspense
6. **RBAC nas Rotas** — `ProtectedRoute` com `allowedRoles` implementado
7. **Zod Schema Validation** nos contratos ERP (`_shared/contracts.ts`)
8. **Audit Log com Hashing** — conceito correto (blockchain-like), precisa apenas corrigir race condition
9. **HMAC Signature Validation** no webhook handler — implementação correta quando `WEBHOOK_SECRET` configurado
10. **Session Timeout + Activity Detection** no AuthProvider — implementação robusta

---

## 10. Considerações Finais

O sistema demonstra visão técnica ambiciosa e inclui padrões modernos (circuit breaker, rate limiter, audit chain, RBAC). Entretanto, a velocidade de desenvolvimento acelerado (via plataforma Lovable, ~135 migrações em 6 meses) deixou lacunas críticas de segurança — especialmente nas políticas RLS e no ERP API — que devem ser endereçadas antes de qualquer ampliação de escopo ou onboarding de novos usuários.

A relação entre escopo de funcionalidades e cobertura de testes é o risco mais sistêmico: com menos de 2% de cobertura em 800+ arquivos, qualquer refactoring ou bug correction pode introduzir regressões não detectadas.

**Recomendação estratégica:** Priorizar um "Sprint de Qualidade" de 4-6 semanas focado exclusivamente nos itens Críticos e Alta prioridade antes de continuar com novas features.

---

*Relatório gerado em 2026-05-20 via análise estática completa do repositório.*
