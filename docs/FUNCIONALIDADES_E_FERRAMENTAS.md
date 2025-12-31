# Fast Grava ES - Documentação Completa de Funcionalidades e Ferramentas

> **Última atualização:** 31/12/2024  
> **Versão:** 1.0.0  
> **Autor:** Lovable AI

Este documento contém um levantamento exaustivo de todas as funcionalidades implementadas no sistema e as ferramentas/bibliotecas utilizadas para sua criação.

---

## 📋 Índice

1. [Stack Tecnológico](#stack-tecnológico)
2. [Funcionalidades de Autenticação e Segurança](#funcionalidades-de-autenticação-e-segurança)
3. [Funcionalidades de Gestão de Jobs/Produção](#funcionalidades-de-gestão-de-jobsprodução)
4. [Funcionalidades de Operadores](#funcionalidades-de-operadores)
5. [Funcionalidades de Máquinas e Manutenção](#funcionalidades-de-máquinas-e-manutenção)
6. [Funcionalidades de Qualidade e SPC](#funcionalidades-de-qualidade-e-spc)
7. [Funcionalidades de Dashboards e BI](#funcionalidades-de-dashboards-e-bi)
8. [Funcionalidades de Rastreabilidade](#funcionalidades-de-rastreabilidade)
9. [Funcionalidades de Notificações](#funcionalidades-de-notificações)
10. [Funcionalidades PWA e Offline](#funcionalidades-pwa-e-offline)
11. [Funcionalidades de Integrações](#funcionalidades-de-integrações)
12. [Edge Functions (Backend)](#edge-functions-backend)
13. [Componentes UI](#componentes-ui)
14. [Hooks Customizados](#hooks-customizados)
15. [Contextos React](#contextos-react)
16. [Sistema de Design](#sistema-de-design)
17. [Internacionalização](#internacionalização)
18. [Testes](#testes)

---

## 🛠️ Stack Tecnológico

### Framework Principal
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **React** | ^18.3.1 | Framework de UI |
| **TypeScript** | ^5.8.3 | Tipagem estática |
| **Vite** | ^5.4.19 | Build tool e dev server |

### Backend
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **Supabase** | ^2.87.1 | Backend as a Service (BaaS) |
| **Edge Functions** | Deno | Serverless functions |
| **PostgreSQL** | - | Banco de dados relacional |

### Estilização
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **Tailwind CSS** | ^3.4.17 | Framework CSS utilitário |
| **tailwindcss-animate** | ^1.0.7 | Animações para Tailwind |
| **@tailwindcss/typography** | ^0.5.16 | Plugin de tipografia |
| **class-variance-authority** | ^0.7.1 | Variantes de componentes |
| **clsx** | ^2.1.1 | Utilitário para classes condicionais |
| **tailwind-merge** | ^2.6.0 | Merge inteligente de classes |

### UI Components
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **Radix UI** | Vários | Componentes primitivos acessíveis |
| **shadcn/ui** | - | Sistema de componentes baseado em Radix |
| **Lucide React** | ^0.462.0 | Biblioteca de ícones |
| **cmdk** | ^1.1.1 | Command palette |
| **Vaul** | ^0.9.9 | Drawer/modal mobile |
| **Sonner** | ^1.7.4 | Toast notifications |

### Animações
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **Framer Motion** | ^12.23.26 | Animações declarativas |
| **Embla Carousel** | ^8.6.0 | Carrossel performático |

### State Management & Data Fetching
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **TanStack React Query** | ^5.83.0 | Server state management |
| **React Hook Form** | ^7.61.1 | Gerenciamento de formulários |
| **Zod** | ^3.25.76 | Validação de schemas |
| **@hookform/resolvers** | ^3.10.0 | Integrações Zod + React Hook Form |

### Roteamento
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **React Router DOM** | ^6.30.1 | Roteamento SPA |

### Drag & Drop
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **@dnd-kit/core** | ^6.3.1 | Core drag and drop |
| **@dnd-kit/sortable** | ^10.0.0 | Listas ordenáveis |
| **@dnd-kit/utilities** | ^3.2.2 | Utilitários DnD |

### Datas
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **date-fns** | ^3.6.0 | Manipulação de datas |
| **react-day-picker** | ^8.10.1 | Seletor de datas |

### Gráficos
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **Recharts** | ^2.15.4 | Gráficos React |

### QR Code
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **qrcode.react** | ^4.2.0 | Geração de QR codes |
| **html5-qrcode** | ^2.3.8 | Leitura de QR codes |

### PDF
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **jsPDF** | ^3.0.4 | Geração de PDFs |
| **jspdf-autotable** | ^5.0.2 | Tabelas em PDF |

### Internacionalização
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **i18next** | ^25.7.3 | Framework de i18n |
| **react-i18next** | ^16.5.0 | Integração React |
| **i18next-browser-languagedetector** | ^8.2.0 | Detecção de idioma |

### PWA
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **vite-plugin-pwa** | ^1.2.0 | PWA support para Vite |
| **Workbox** | - | Service worker caching |

### Virtualização
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **@tanstack/react-virtual** | ^3.13.13 | Virtualização de listas |

### Monitoramento
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **@sentry/react** | ^8.55.0 | Error tracking |
| **web-vitals** | ^4.2.4 | Métricas de performance |

### Testes
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **Vitest** | ^4.0.15 | Test runner |
| **jsdom** | ^27.3.0 | DOM simulation |
| **@testing-library/react** | ^16.3.0 | React testing utilities |
| **@testing-library/jest-dom** | ^6.9.1 | Custom matchers |
| **@testing-library/user-event** | ^14.6.1 | User event simulation |

### Misc
| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **react-helmet** | ^6.1.0 | Gerenciamento de head |
| **next-themes** | ^0.3.0 | Tema claro/escuro |
| **react-resizable-panels** | ^2.1.9 | Painéis redimensionáveis |
| **input-otp** | ^1.4.2 | Input OTP para 2FA |

---

## 🔐 Funcionalidades de Autenticação e Segurança

### 1. Autenticação de Usuários
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Login/Logout** | Sistema de login com email/senha | `@supabase/supabase-js`, `AuthContext` |
| **Registro de Usuários** | Cadastro de novos usuários | `Supabase Auth` |
| **Reset de Senha com Aprovação** | Fluxo de reset com aprovação de gestor | `password_reset_requests` table, `approve-password-reset` edge function |
| **Recuperação de Senha** | Email de recuperação | `Supabase Auth` |

### 2. Autenticação de Dois Fatores (2FA)
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **TOTP Setup** | Configuração de autenticação TOTP | `Supabase MFA`, `TwoFactorSetup.tsx` |
| **MFA Challenge** | Verificação de código TOTP no login | `MFAChallenge.tsx`, `input-otp` |
| **Gerenciamento MFA** | Ativar/desativar 2FA por usuário | `user_mfa_settings` table |

### 3. Controle de Acesso por IP
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **IP Allowlist** | Lista de IPs permitidos | `ip_allowlist` table, `IPAllowlist.tsx` |
| **Validação de IP no Login** | Bloqueio de IPs não autorizados | `validate-login-ip` edge function |
| **IPs Globais vs Por Usuário** | Configuração granular de acesso | `is_global` flag |
| **Expiração de Regras** | IPs com data de expiração | `expires_at` column |

### 4. Auditoria de Login
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Log de Tentativas** | Registro de todas as tentativas de login | `login_audit` table |
| **Status de Login** | Sucesso, falha, bloqueado, MFA | `login_status` enum |
| **Histórico de Auditoria** | Visualização do histórico | `LoginAuditLog.tsx` |

### 5. Controle de Acesso Baseado em Roles (RBAC)
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Roles de Usuário** | admin, coordinator, manager, operator | `user_roles` table, `app_role` enum |
| **Verificação de Permissões** | Funções para checar roles | `has_role()`, `get_user_role()` DB functions |
| **Proteção de Rotas** | Rotas protegidas por role | `ProtectedRoute.tsx`, `useRBAC.tsx` |
| **Hook de RBAC** | Hook para verificar permissões | `useRBAC.tsx` |

### 6. Notificações em Tempo Real para Admins
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Reset Requests Realtime** | Notificação de novos resets | `useRealtimeResetRequests.tsx`, Supabase Realtime |
| **Provider de Notificações** | Wrapper para realtime | `RealtimeNotificationsProvider.tsx` |

---

## 📦 Funcionalidades de Gestão de Jobs/Produção

### 1. CRUD de Jobs
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Criação de Jobs** | Formulário completo de novo job | `NewJobPage.tsx`, `react-hook-form`, `zod` |
| **Listagem de Jobs** | Lista paginada e filtrada | `usePaginatedJobs.ts`, `@tanstack/react-virtual` |
| **Edição de Jobs** | Atualização de dados do job | `JobDetailsModal.tsx` |
| **Exclusão de Jobs** | Remoção com confirmação | `ConfirmationContext.tsx` |

### 2. Kanban Board
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Board Kanban** | Visualização em colunas por status | `KanbanBoard.tsx`, `@dnd-kit/core` |
| **Drag & Drop** | Arrastar jobs entre colunas | `@dnd-kit/sortable`, `useKanbanDragDrop.ts` |
| **Ordenação** | Ordenar jobs dentro de colunas | `@dnd-kit/sortable` |

### 3. Calendário
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Calendário Diário** | Visualização por dia | `DailyCalendar.tsx`, `date-fns` |
| **Calendário Semanal** | Visualização por semana | `WeeklyCalendar.tsx` |
| **Agendamento** | Agendar jobs em datas | `react-day-picker` |

### 4. Fila de Pendentes
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Fila de Produção** | Jobs aguardando processamento | `PendingQueue.tsx` |
| **Buffer Automático** | Promoção automática de jobs | `useAutoBufferPromotion.ts` |
| **Priorização** | Ordenação por prioridade | `priority` field |

### 5. QR Code
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Geração de QR Code** | QR code único por job | `qrcode.react`, `JobQRCode.tsx` |
| **Leitura de QR Code** | Scanner de QR codes | `html5-qrcode`, `QRScannerPage.tsx` |
| **Histórico de Scans** | Registro de leituras | `qr_scan_history` table |

### 6. Técnicas de Gravação
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Gestão de Técnicas** | CRUD de técnicas | `techniques` table |
| **Associação com Jobs** | Jobs vinculados a técnicas | `technique_id` FK |
| **Associação com Máquinas** | Máquinas por técnica | `machines.technique_id` FK |

### 7. Fotos de Produção
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Upload de Fotos** | Anexar fotos aos jobs | `Supabase Storage`, `production-photos` bucket |
| **Galeria** | Visualização de fotos | `ProductionPhotos.tsx` |

---

## 👷 Funcionalidades de Operadores

### 1. Gestão de Operadores
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Criar Operador** | Cadastro via edge function | `create-operator` edge function |
| **Atualizar Operador** | Edição de dados | `update-operator` edge function |
| **Listar Operadores** | Lista com status | `useOperators.ts` |
| **Auditoria de Status** | Histórico de ativações/desativações | `operator_status_audit` table, `useOperatorAudit.ts` |

### 2. Atribuição de Máquinas
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Vincular Máquinas** | Associar operador a máquinas | `operator_machines` table |
| **Gerenciar Vínculos** | UI de atribuição | `useOperatorMachines.ts` |

### 3. Produtividade
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Dashboard do Operador** | Visão individual | `OperatorView.tsx`, `useOperatorDashboardData.ts` |
| **Métricas de Produtividade** | Peças produzidas, perdas | `useOperatorProductivity.ts` |
| **Evolução** | Gráfico de evolução | `useOperatorEvolution.ts` |
| **Presença** | Status online/offline | `useOperatorPresence.ts` |

### 4. Gamificação
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Pontos e XP** | Sistema de pontuação | `GamificationPage.tsx`, `useGamification.ts` |
| **Conquistas** | Badges e achievements | `operator_achievements` table |
| **Rankings** | Leaderboard de operadores | `operator_rankings` table, `calculate-rankings` edge function |
| **Metas** | Definição de objetivos | `operator_goals` table, `useOperatorGoals.ts` |
| **Configurações** | Ajustes do sistema de gamificação | `gamification_settings` table |

---

## 🔧 Funcionalidades de Máquinas e Manutenção

### 1. Gestão de Máquinas
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **CRUD de Máquinas** | Cadastro e edição | `MachinesPage.tsx` |
| **Status de Máquinas** | Ativo/inativo | `is_active` field |
| **Associação com Técnicas** | Máquinas por técnica | `technique_id` FK |

### 2. TPM (Total Productive Maintenance)
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Dashboard TPM** | Visão geral de manutenção | `TPMDashboard.tsx`, `useTPM.ts` |
| **Tipos de Manutenção** | Preventiva, corretiva, etc. | `maintenance_types` table |
| **Agendamentos** | Cronograma de manutenções | `maintenance_schedules` table |
| **Registros** | Histórico de manutenções | `maintenance_records` table |
| **Checklists** | Listas de verificação | `maintenance_checklists`, `maintenance_checklist_items` tables |
| **Respostas de Checklist** | Execução de checklists | `maintenance_item_responses` table |
| **Alertas** | Notificações de manutenção | `maintenance_alerts` table |
| **Notificações TPM** | Sistema de notificação | `useTPMNotifications.ts` |

### 3. Predição de Falhas (ML)
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Dashboard ML** | Visualização de predições | `MLPredictionsDashboard.tsx` |
| **Predições de Máquina** | Análise preditiva | `machine_predictions` table, `useMLPredictions.ts` |
| **Histórico de Predições** | Registro de acurácia | `prediction_history` table |
| **Notificações ML** | Alertas de predição | `useMLPredictionNotifications.ts` |
| **Edge Function ML** | Processamento de predições | `ml-predictions` edge function |

### 4. MTBF/MTTR
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Cálculo MTBF** | Mean Time Between Failures | `useMTBFMTTR.ts` |
| **Cálculo MTTR** | Mean Time To Repair | `useMTBFMTTR.ts` |
| **Métricas de Saúde** | Health metrics por máquina | `machine_health_metrics` table |

### 5. Energia
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Dashboard de Energia** | Consumo energético | `EnergyDashboard.tsx`, `useEnergy.ts` |
| **Consumo por Máquina** | Métricas de consumo | `energy_consumption` table |
| **Metas de Energia** | Targets de consumo | `energy_targets` table |
| **Alertas de Energia** | Notificações de consumo | `energy_alerts` table |

---

## 📊 Funcionalidades de Qualidade e SPC

### 1. SPC (Statistical Process Control)
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Dashboard SPC** | Controle estatístico | `SPCDashboard.tsx`, `useSPC.ts` |
| **Parâmetros de Controle** | Definição de limites | `spc_control_parameters` table |
| **Medições** | Registro de medições | `spc_measurements` table |
| **Alertas SPC** | Fora de controle | `spc_alerts` table |
| **Histórico de Capabilidade** | Cp, Cpk, Pp, Ppk | `spc_capability_history` table |

### 2. Checklists de Qualidade
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Templates de Checklist** | Modelos de verificação | `shift_checklist_templates` table |
| **Execução** | Preenchimento de checklists | `useQualityChecklist.ts` |

### 3. Inspeções de Lote
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Inspeções** | Registro de inspeções | `lot_quality_inspections` table |
| **Fotos de Inspeção** | Evidências visuais | `photos` array field |

---

## 📈 Funcionalidades de Dashboards e BI

### 1. Dashboard Principal
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **KPIs** | Indicadores principais | `KPIDashboard.tsx`, `useKPIs.ts` |
| **Layout Customizável** | Arranjo de widgets | `useDashboardLayout.ts` |
| **Sumário Diário** | Resumo do dia | `daily_summaries` table |

### 2. Dashboard Executivo
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Visão Executiva** | Métricas de alto nível | `ExecutiveDashboard.tsx`, `useExecutiveDashboard.ts` |
| **Gráficos** | Visualizações | `recharts` |

### 3. Dashboard de Eficiência
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Métricas de Eficiência** | Análise de produtividade | `EfficiencyDashboard.tsx` |
| **Alertas de Eficiência** | Notificações de queda | `efficiency_alert_history` table, `useEfficiencyAlertHistory.ts` |
| **Notificações** | Provider de alertas | `EfficiencyNotificationProvider.tsx`, `useEfficiencyNotifications.ts` |

### 4. OEE (Overall Equipment Effectiveness)
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Dashboard OEE** | Métricas OEE | `OEEDashboard.tsx`, `useOEE.ts` |
| **Disponibilidade** | % de tempo disponível | Cálculo automático |
| **Performance** | % de velocidade | Cálculo automático |
| **Qualidade** | % de peças boas | Cálculo automático |

### 5. ABC Costing
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Dashboard ABC** | Custeio por atividade | `ABCCostingDashboard.tsx` |
| **Atividades** | Definição de atividades | `abc_activities` table |
| **Pools de Custo** | Agrupamentos de custo | `abc_cost_pools` table |
| **Taxas de Atividade** | Rates por período | `abc_activity_rates` table |
| **Custos por Job** | Alocação de custos | `abc_job_costs` table |
| **Hooks ABC** | Lógica de ABC | `useABCCosts.ts`, `useABCCalculations.test.tsx` |

### 6. Dashboard de Alertas
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Central de Alertas** | Todos os alertas | `AlertsDashboard.tsx`, `useAlertCount.ts` |
| **Contagem de Alertas** | Badge de alertas | `useAlertCount.ts` |

### 7. Dashboard de Qualidade de Código
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Métricas de Código** | Análise do codebase | `CodeQualityDashboard.tsx`, `useCodeQualityMetrics.ts` |

---

## 🔍 Funcionalidades de Rastreabilidade

### 1. Lotes de Produção
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Gestão de Lotes** | CRUD de lotes | `TraceabilityPage.tsx`, `useTraceability.ts` |
| **Production Lots** | Registro de lotes | `production_lots` table |
| **Componentes de Lote** | Materiais utilizados | `lot_components` table |
| **Movimentações** | Histórico de movimentos | `lot_movements` table |

### 2. Materiais
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Cadastro de Materiais** | CRUD de materiais | `materials` table |
| **Categorias de Produto** | Organização | `product_categories` table |

---

## 🔔 Funcionalidades de Notificações

### 1. Sistema de Notificações
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Central de Notificações** | Página de notificações | `NotificationsPage.tsx` |
| **Context de Notificações** | Estado global | `NotificationsContext.tsx`, `useNotifications.ts` |
| **Sons de Notificação** | Feedback sonoro | `useNotificationSounds.ts`, `useThemeSound.ts` |

### 2. Push Notifications
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Subscrições Push** | Registro de devices | `push_subscriptions` table |
| **Envio de Push** | Notificações push | `send-push-notification` edge function |
| **Notificações Nativas** | Push nativo | `useNativePushNotifications.ts`, `usePushNotifications.ts` |
| **Gestão de Subscrição** | Opt-in/out | `usePushSubscription.ts` |
| **Armazenamento** | Histórico de push | `push_notifications` table |

### 3. Relatórios por Email
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Envio de Relatórios** | Relatórios periódicos | `send-email-report` edge function |
| **Hook de Email** | Lógica de envio | `useEmailReports.ts` |

### 4. Alertas de Metas
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Alertas de Goal** | Notificação de metas | `useGoalAlerts.ts` |
| **Metas de Máquina** | Targets por máquina | `useMachineGoals.ts` |

### 5. Resumos Diários
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Sumário Diário** | Resumo automático | `daily-maintenance-summary` edge function |
| **Notificações de Sumário** | Alertas diários | `useDailySummaryNotifications.ts` |

---

## 📱 Funcionalidades PWA e Offline

### 1. PWA
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Manifest** | Configuração PWA | `public/manifest.json`, `vite-plugin-pwa` |
| **Service Worker** | Caching e offline | `Workbox` |
| **Ícones PWA** | Ícones para instalação | `/public/pwa-icons/` |
| **Instalação** | Prompt de instalação | `InstallAppPage.tsx` |

### 2. Offline
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Context Offline** | Estado de conexão | `OfflineSyncContext.tsx` |
| **Sync Offline** | Sincronização | `useOfflineSync.ts` |
| **Indicador Offline** | UI de status | `OfflineIndicator.tsx` |
| **Pull to Refresh** | Atualização mobile | `use-pull-to-refresh.tsx`, `pull-to-refresh.tsx` |

### 3. Cache Strategies
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Google Fonts** | Cache de fontes | `CacheFirst` strategy |
| **API Requests** | Cache de requisições | `NetworkFirst` strategy |
| **Assets Estáticos** | Cache de assets | `globPatterns` |

---

## 🔗 Funcionalidades de Integrações

### 1. Bitrix24
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Configuração** | Setup da integração | `Bitrix24ConfigPage.tsx` |
| **Sync de Jobs** | Sincronização de dados | `bitrix24-sync` edge function, `useBitrix24Sync.ts` |
| **OAuth Tokens** | Gestão de tokens | `bitrix24_oauth_tokens` table |
| **Field Mappings** | Mapeamento de campos | `bitrix24_field_mappings` table |
| **Histórico de Sync** | Log de sincronizações | `bitrix24_sync_history` table |
| **Service** | Serviço de integração | `src/services/bitrix24.ts` |

### 2. Webhooks
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **Handler** | Recepção de webhooks | `webhook-handler` edge function |
| **Logs** | Histórico de webhooks | `webhook_logs` table |

### 3. ERP
| Funcionalidade | Descrição | Ferramentas |
|----------------|-----------|-------------|
| **API ERP** | Integração com ERPs | `erp-api` edge function |

---

## ⚡ Edge Functions (Backend)

| Edge Function | Descrição | Autenticação |
|---------------|-----------|--------------|
| **approve-password-reset** | Aprovação de reset de senha | JWT required |
| **backup-scheduler** | Agendamento de backups | JWT required |
| **bitrix24-sync** | Sincronização com Bitrix24 | JWT required |
| **calculate-rankings** | Cálculo de rankings de operadores | JWT required |
| **create-operator** | Criação de operador | JWT required |
| **cron-cleanup** | Limpeza de dados antigos | No JWT |
| **daily-maintenance-summary** | Resumo diário de manutenção | JWT required |
| **erp-api** | API de integração ERP | No JWT |
| **excel-export** | Exportação para Excel/CSV | JWT required |
| **health-check** | Verificação de saúde do sistema | No JWT |
| **image-optimizer** | Otimização de imagens | JWT required |
| **metrics-collector** | Coleta de métricas | JWT required |
| **ml-predictions** | Predições de machine learning | JWT required |
| **pdf-generator** | Geração de PDFs | JWT required |
| **send-email-report** | Envio de relatórios por email | JWT required |
| **send-push-notification** | Envio de push notifications | JWT required |
| **technical-assistant** | Assistente técnico AI | JWT required |
| **update-operator** | Atualização de operador | JWT required |
| **validate-login-ip** | Validação de IP no login | No JWT |
| **webhook-handler** | Recepção de webhooks | JWT required |

---

## 🎨 Componentes UI

### Componentes Base (shadcn/ui + Radix)
| Componente | Descrição | Base |
|------------|-----------|------|
| **Accordion** | Conteúdo expansível | `@radix-ui/react-accordion` |
| **AlertDialog** | Diálogos de confirmação | `@radix-ui/react-alert-dialog` |
| **Alert** | Alertas e avisos | Custom |
| **AspectRatio** | Proporção de aspecto | `@radix-ui/react-aspect-ratio` |
| **Avatar** | Avatares de usuário | `@radix-ui/react-avatar` |
| **Badge** | Badges/tags | Custom |
| **Breadcrumb** | Navegação breadcrumb | Custom |
| **Button** | Botões | Custom + CVA |
| **Calendar** | Calendário | `react-day-picker` |
| **Card** | Cards | Custom |
| **Carousel** | Carrossel | `embla-carousel-react` |
| **Chart** | Gráficos | `recharts` |
| **Checkbox** | Checkboxes | `@radix-ui/react-checkbox` |
| **Collapsible** | Conteúdo colapsável | `@radix-ui/react-collapsible` |
| **Command** | Command palette | `cmdk` |
| **ContextMenu** | Menu de contexto | `@radix-ui/react-context-menu` |
| **Dialog** | Modais | `@radix-ui/react-dialog` |
| **Drawer** | Drawer mobile | `vaul` |
| **DropdownMenu** | Menus dropdown | `@radix-ui/react-dropdown-menu` |
| **Form** | Formulários | `react-hook-form` |
| **HoverCard** | Cards hover | `@radix-ui/react-hover-card` |
| **Input** | Campos de texto | Custom |
| **InputOTP** | Input de OTP | `input-otp` |
| **Label** | Labels | `@radix-ui/react-label` |
| **Menubar** | Barra de menu | `@radix-ui/react-menubar` |
| **NavigationMenu** | Menu de navegação | `@radix-ui/react-navigation-menu` |
| **Pagination** | Paginação | Custom |
| **Popover** | Popovers | `@radix-ui/react-popover` |
| **Progress** | Barras de progresso | `@radix-ui/react-progress` |
| **RadioGroup** | Radio buttons | `@radix-ui/react-radio-group` |
| **Resizable** | Painéis redimensionáveis | `react-resizable-panels` |
| **ScrollArea** | Área de scroll | `@radix-ui/react-scroll-area` |
| **Select** | Selects | `@radix-ui/react-select` |
| **Separator** | Separadores | `@radix-ui/react-separator` |
| **Sheet** | Side sheets | Custom |
| **Sidebar** | Sidebar navegação | Custom |
| **Skeleton** | Loading skeletons | Custom |
| **Slider** | Sliders | `@radix-ui/react-slider` |
| **Sonner** | Toast notifications | `sonner` |
| **Switch** | Toggle switches | `@radix-ui/react-switch` |
| **Table** | Tabelas | Custom |
| **Tabs** | Abas | `@radix-ui/react-tabs` |
| **Textarea** | Áreas de texto | Custom |
| **Toast** | Toasts | `@radix-ui/react-toast` |
| **Toggle** | Toggles | `@radix-ui/react-toggle` |
| **ToggleGroup** | Grupos de toggle | `@radix-ui/react-toggle-group` |
| **Tooltip** | Tooltips | `@radix-ui/react-tooltip` |

### Componentes de Acessibilidade
| Componente | Descrição |
|------------|-----------|
| **AriaLabel** | Labels acessíveis |
| **FocusRing** | Indicador de foco |
| **FocusTrap** | Trap de foco |
| **HighContrast** | Alto contraste |
| **KeyboardNav** | Navegação por teclado |
| **LiveRegion** | Regiões ARIA live |
| **ReducedMotion** | Redução de movimento |
| **ScreenReaderOnly** | Conteúdo só para screen readers |
| **SkipLink** | Skip navigation links |
| **VisuallyHidden** | Conteúdo visualmente oculto |

### Componentes de Performance
| Componente | Descrição | Ferramenta |
|------------|-----------|------------|
| **VirtualizedList** | Lista virtualizada | `@tanstack/react-virtual` |
| **VirtualizedTable** | Tabela virtualizada | `@tanstack/react-virtual` |
| **PageSkeletons** | Skeletons de página | Custom |
| **ResponsiveTable** | Tabela responsiva | Custom |

---

## 🪝 Hooks Customizados

### Hooks de Dados
| Hook | Descrição |
|------|-----------|
| `useJobs` | CRUD de jobs |
| `usePaginatedJobs` | Jobs com paginação |
| `useOperators` | Gestão de operadores |
| `useDocuments` | Gestão de documentos |
| `useTraceability` | Rastreabilidade |
| `useSchedulingData` | Dados de agendamento |
| `useSchedulingConflicts` | Conflitos de agendamento |

### Hooks de Funcionalidades
| Hook | Descrição |
|------|-----------|
| `useTPM` | TPM completo |
| `useTPMData` | Dados TPM |
| `useTPMMutations` | Mutations TPM |
| `useTPMStats` | Estatísticas TPM |
| `useTPMNotifications` | Notificações TPM |
| `useSPC` | Controle estatístico |
| `useOEE` | OEE metrics |
| `useEnergy` | Consumo de energia |
| `useGamification` | Sistema de gamificação |
| `useMLPredictions` | Predições ML |
| `useABCCosts` | Custeio ABC |
| `useMTBFMTTR` | MTBF/MTTR |
| `useShiftHandover` | Passagem de turno |

### Hooks de UI/UX
| Hook | Descrição |
|------|-----------|
| `useDebounce` | Debounce de valores |
| `useThrottle` | Throttle de valores |
| `useLocalStorage` | Persistência local |
| `useMediaQuery` | Media queries |
| `useMobile` | Detecção mobile |
| `useDevice` | Informações do device |
| `useClickOutside` | Clique fora |
| `useKeyboard` | Atalhos de teclado |
| `useFocusTrap` | Trap de foco |
| `useScrollDirection` | Direção do scroll |
| `useSwipeGesture` | Gestos de swipe |
| `useHapticFeedback` | Feedback háptico |
| `usePullToRefresh` | Pull to refresh |

### Hooks de Notificações
| Hook | Descrição |
|------|-----------|
| `useNotifications` | Sistema de notificações |
| `useNotificationSounds` | Sons de notificação |
| `usePushNotifications` | Push notifications |
| `usePushSubscription` | Subscrição push |
| `useNativePushNotifications` | Push nativo |
| `useEfficiencyNotifications` | Alertas de eficiência |
| `useMLPredictionNotifications` | Alertas ML |
| `useDailySummaryNotifications` | Resumos diários |
| `useGoalAlerts` | Alertas de metas |
| `useRealtimeResetRequests` | Realtime para reset requests |

### Hooks de Operadores
| Hook | Descrição |
|------|-----------|
| `useOperatorDashboardData` | Dados do dashboard |
| `useOperatorProductivity` | Produtividade |
| `useOperatorEvolution` | Evolução |
| `useOperatorPresence` | Presença |
| `useOperatorMachines` | Máquinas do operador |
| `useOperatorGoals` | Metas do operador |
| `useOperatorAudit` | Auditoria de operador |

### Hooks de Infraestrutura
| Hook | Descrição |
|------|-----------|
| `useOfflineSync` | Sincronização offline |
| `useRealtimeConnection` | Conexão realtime |
| `useRetryableQuery` | Queries com retry |
| `useBitrix24Sync` | Sync Bitrix24 |
| `useAuditLog` | Log de auditoria |

### Hooks de Análise
| Hook | Descrição |
|------|-----------|
| `useKPIs` | Indicadores KPI |
| `useExecutiveDashboard` | Dashboard executivo |
| `useDashboardLayout` | Layout do dashboard |
| `useAlertCount` | Contagem de alertas |
| `useEfficiencyAlertHistory` | Histórico de alertas |
| `useTrendingAnalysis` | Análise de tendências |
| `useCodeQualityMetrics` | Métricas de código |
| `useBottleneckPrediction` | Predição de gargalos |

### Hooks de Otimização
| Hook | Descrição |
|------|-----------|
| `useSmartSequencing` | Sequenciamento inteligente |
| `useSmartSequencingWithActions` | Sequenciamento com ações |
| `useLoadBalancing` | Balanceamento de carga |
| `useLoadBalancingWithActions` | Balanceamento com ações |
| `useAutoBufferPromotion` | Promoção de buffer |
| `useStuckJobsDetection` | Detecção de jobs travados |
| `useOrphanedDataDetection` | Detecção de dados órfãos |

### Hooks de Conhecimento
| Hook | Descrição |
|------|-----------|
| `useTechnicalSheets` | Fichas técnicas |
| `useTechnicalConversations` | Conversas técnicas |
| `useQuickFavorites` | Favoritos rápidos |

---

## 🌐 Contextos React

| Context | Descrição |
|---------|-----------|
| `AuthContext` | Autenticação e usuário |
| `BreadcrumbContext` | Navegação breadcrumb |
| `ConfirmationContext` | Diálogos de confirmação |
| `FeatureFlagsContext` | Feature flags |
| `NotificationsContext` | Sistema de notificações |
| `OfflineSyncContext` | Estado offline |
| `PermissionsContext` | Permissões do usuário |
| `SearchContext` | Busca global |
| `SidebarContext` | Estado do sidebar |
| `ThemeContext` | Tema claro/escuro |
| `UserPreferencesContext` | Preferências do usuário |
| `WebSocketContext` | Conexão websocket |

---

## 🎨 Sistema de Design

### Tokens de Cor
```
--background, --foreground
--primary, --primary-foreground, --primary-glow
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--success, --success-foreground
--warning, --warning-foreground
--info, --info-foreground
--card, --card-foreground, --card-elevated
--popover, --popover-foreground
--border, --input, --ring
```

### Tokens de Status (Jobs)
```
--status-queue, --status-ready, --status-scheduled
--status-production, --status-finished, --status-paused
--status-cancelled, --status-delayed, --status-rework
```

### Tokens de Gamificação
```
--xp, --coins, --streak
--rank-gold, --rank-silver, --rank-bronze
```

### Tokens de Gráficos
```
--chart-1 through --chart-5
```

### Tokens de Sidebar
```
--sidebar-background, --sidebar-foreground
--sidebar-primary, --sidebar-accent, --sidebar-muted
--sidebar-border, --sidebar-ring
```

### Sombras
```
--shadow-xs, --shadow-sm, --shadow-md
--shadow-lg, --shadow-xl, --shadow-2xl
--shadow-glow-primary, --shadow-glow-success
```

### Animações
```
accordion-down, accordion-up
fade-in, fade-out
scale-in
slide-up, slide-down
shimmer, pulse
enter, exit
```

---

## 🌍 Internacionalização

### Idiomas Suportados
| Idioma | Código | Arquivo |
|--------|--------|---------|
| Português (Brasil) | `pt-BR` | `src/i18n/locales/pt-BR.json` |
| Inglês (EUA) | `en-US` | `src/i18n/locales/en-US.json` |
| Espanhol (Espanha) | `es-ES` | `src/i18n/locales/es-ES.json` |

### Configuração
- **Biblioteca:** i18next + react-i18next
- **Detecção:** i18next-browser-languagedetector
- **Fallback:** pt-BR

---

## 🧪 Testes

### Framework
- **Test Runner:** Vitest
- **DOM Simulation:** jsdom
- **Testing Library:** @testing-library/react

### Cobertura de Testes
Praticamente todos os componentes, hooks e serviços possuem arquivos de teste correspondentes (`.test.ts` ou `.test.tsx`).

### Storybook
- **Biblioteca:** @storybook/react
- **Stories:** `src/components/ui/stories/`, `src/stories/`

---

## 📁 Estrutura de Diretórios

```
src/
├── components/         # Componentes React
│   ├── abc/           # Custeio ABC
│   ├── assistant/     # Assistente técnico
│   ├── auth/          # Autenticação
│   ├── dashboard/     # Dashboard
│   ├── design-system/ # Design system
│   ├── documents/     # Documentos
│   ├── integrations/  # Integrações
│   ├── jobs/          # Jobs/Produção
│   ├── kanban/        # Kanban board
│   ├── knowledge/     # Base de conhecimento
│   ├── layout/        # Layouts
│   ├── ml/            # Machine Learning
│   ├── navigation/    # Navegação
│   ├── notifications/ # Notificações
│   ├── oee/           # OEE
│   ├── offline/       # Offline support
│   ├── operator/      # Operadores
│   ├── qrcode/        # QR Code
│   ├── reliability/   # Confiabilidade
│   ├── settings/      # Configurações
│   ├── shift/         # Turnos
│   ├── tpm/           # TPM
│   ├── traceability/  # Rastreabilidade
│   └── ui/            # UI primitives
├── constants/         # Constantes
├── contexts/          # React Contexts
├── hooks/             # Custom Hooks
├── i18n/              # Internacionalização
├── integrations/      # Integrações (Supabase)
├── lib/               # Utilitários
├── pages/             # Páginas/Rotas
├── schemas/           # Schemas Zod
├── services/          # Serviços/APIs
├── stories/           # Storybook
├── test/              # Configuração de testes
└── types/             # TypeScript types

supabase/
├── functions/         # Edge Functions
├── migrations/        # Migrações SQL
└── config.toml        # Configuração Supabase

public/
├── pwa-icons/         # Ícones PWA
└── manifest.json      # Manifest PWA
```

---

## 📌 Resumo Rápido de Funcionalidades

### Segurança
- ✅ Autenticação com email/senha
- ✅ 2FA com TOTP
- ✅ Controle de acesso por IP
- ✅ Auditoria de login
- ✅ RBAC (Role-Based Access Control)
- ✅ Reset de senha com aprovação
- ✅ Notificações realtime para admins

### Produção
- ✅ CRUD de Jobs
- ✅ Kanban Board com drag & drop
- ✅ Calendário diário/semanal
- ✅ QR Code (geração e leitura)
- ✅ Fila de pendentes
- ✅ Priorização inteligente

### Manutenção
- ✅ TPM completo
- ✅ Manutenção preventiva/corretiva
- ✅ Checklists de manutenção
- ✅ Alertas de manutenção
- ✅ MTBF/MTTR
- ✅ Predição de falhas (ML)

### Qualidade
- ✅ SPC (Controle Estatístico)
- ✅ Cp, Cpk, Pp, Ppk
- ✅ Alertas de qualidade
- ✅ Inspeções de lote

### Analytics
- ✅ Dashboard KPI
- ✅ Dashboard Executivo
- ✅ OEE
- ✅ ABC Costing
- ✅ Análise de eficiência
- ✅ Análise de energia

### Operadores
- ✅ Gestão de operadores
- ✅ Dashboard individual
- ✅ Gamificação (XP, coins, rankings)
- ✅ Metas e conquistas

### PWA/Offline
- ✅ Instalação como app
- ✅ Modo offline
- ✅ Push notifications
- ✅ Pull to refresh

### Integrações
- ✅ Bitrix24
- ✅ Webhooks
- ✅ ERP API

---

**Documento gerado automaticamente em 31/12/2024**
