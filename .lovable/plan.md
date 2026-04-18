
## Análise Exaustiva de Funcionalidades — Fast Gravações

Vou mapear **todas** as funcionalidades do sistema cruzando: páginas (`src/pages`), hooks (`src/hooks`), componentes (`src/components`), serviços (`src/services`), edge functions (`supabase/functions`), tabelas do banco, contextos e integrações.

### Fontes a inspecionar
1. `src/routes/AppRoutes.tsx` — todas as rotas registradas
2. `src/pages/*` — 36+ páginas
3. `src/hooks/*` — 74+ hooks customizados
4. `src/components/*` — agrupados por domínio (dashboard, kiosk, operator, quality, etc.)
5. `src/services/*` — camada de serviços
6. `supabase/functions/*` — edge functions deployadas
7. `src/contexts/*` — providers globais
8. `src/i18n/*` — idiomas suportados
9. Schema do banco (tabelas + RLS)
10. Integrações externas (Bitrix24, TaskGeeks, Lovable AI, Resend, Push/VAPID)

### Estrutura do Relatório Final
Vou entregar um documento Markdown salvo em `/mnt/documents/FUNCIONALIDADES_SISTEMA.md` com:

1. **Visão geral** — stack, escala (52 máquinas, 16 técnicas), papéis
2. **Mapa de rotas** — tabela rota → página → permissão
3. **Módulos funcionais** (organizados pelos 7 grupos do sidebar):
   - Início / Dashboard
   - Planejamento (Calendário, Kanban, Pendências)
   - Analytics (BI, Executivo, KPIs, OEE, Eficiência, SPC, ABC)
   - Operações (TPM, Máquinas, Comparativo, Energia, Rastreabilidade)
   - Equipe (Operadores, Produtividade, Histórico, Gamificação, Turno, Visão Operador)
   - Inteligência (ML, Assistente IA, Conhecimento, Documentos)
   - Sistema (Alertas, Notificações, Scanner QR, Configurações)
   - Admin (Code Quality, Bitrix24, Design System, Install)
4. **Funcionalidades transversais**:
   - Autenticação (email/senha + Google OAuth + RBAC 3 papéis)
   - Offline-first (IndexedDB `fastgravacoes_offline`)
   - Realtime (Supabase channels)
   - i18n (pt-BR, en-US, es-ES)
   - PWA + Push Notifications (VAPID)
   - Impressão térmica (etiquetas 10x15, 5x7, 8x5)
   - Modo Kiosk
   - Confirmações, Celebrações, Feedback, Command Palette, Onboarding
5. **Lógica de negócio**:
   - Máquina de estados de jobs
   - Buffer auto-promotion (3 jobs ready/técnica)
   - Conflict resolution (Urgência > Prazo > VIP > Valor)
   - SPC (Western Electric rules, A2 dinâmico)
   - OEE (thresholds 85/70/55)
   - ABC Costing (Σ atividade × taxa × tempo)
   - KPIs (penalidade assimétrica, limite 72h)
   - Detecção de jobs travados / dados órfãos
6. **Integrações**:
   - Bitrix24 (OAuth bidirecional, pg_cron 5min, 16 SPAs)
   - TaskGeeks (gamificação bidirecional)
   - Lovable AI (Gemini/GPT models)
   - Resend (e-mail)
   - Storage (production-photos, technical-documents)
7. **Edge Functions** — listar todas com propósito
8. **Tabelas + RLS** — resumo do schema e políticas
9. **Engenharia / Qualidade**:
   - Circuit Breaker, Rate Limiter, Retry com backoff
   - Validação Zod
   - Logger estruturado
   - 1386 testes automatizados
   - Política 400 linhas/arquivo
10. **Gaps / Itens cancelados** — IoT (cancelado)

### Processo de execução (modo padrão)
1. Listar `src/pages`, `src/hooks`, `src/services`, `src/components`, `supabase/functions` via `code--list_dir`
2. Ler `AppRoutes.tsx` para mapa completo de rotas e proteções
3. Consultar schema via `security--get_table_schema`
4. Inspecionar contextos e providers
5. Ler READMEs/docs em `docs/`
6. Compilar relatório em `/mnt/documents/FUNCIONALIDADES_SISTEMA.md`
7. Entregar via `<lov-artifact>`

Sem mudanças no código — apenas geração de documento.
