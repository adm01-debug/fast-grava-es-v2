# 📘 Fast Grava ES - Documentação Técnica Completa

> Sistema de Gestão de Produção para Gravação a Laser
> Versão 1.0.0 | Dezembro 2024

---

## 📑 Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Estrutura do Projeto](#4-estrutura-do-projeto)
5. [Componentes](#5-componentes)
6. [Hooks Customizados](#6-hooks-customizados)
7. [Contextos](#7-contextos)
8. [Páginas](#8-páginas)
9. [Supabase Backend](#9-supabase-backend)
10. [Testes](#10-testes)
11. [Internacionalização](#11-internacionalização)
12. [PWA](#12-pwa)
13. [Deploy e CI/CD](#13-deploy-e-cicd)
14. [Guia de Contribuição](#14-guia-de-contribuição)

---

## 1. Visão Geral

### 1.1 Descrição
O **Fast Grava ES** é um sistema completo de gestão de produção para empresas de gravação a laser e personalização. O sistema oferece:

- Dashboard em tempo real
- Calendário de produção (diário/semanal)
- Kanban de tarefas
- Gestão de operadores
- Controle de máquinas
- Métricas OEE (Overall Equipment Effectiveness)
- Custeio ABC (Activity-Based Costing)
- TPM (Total Productive Maintenance)
- SPC (Statistical Process Control)
- BI e Analytics
- Notificações em tempo real
- Suporte offline (PWA)

### 1.2 Estatísticas do Projeto

| Categoria | Quantidade |
|-----------|------------|
| Total de Arquivos | 1.444 |
| Componentes React | 156 |
| Hooks Customizados | 103 |
| Páginas | 36 |
| Contextos | 12 |
| Services | 10 |
| Supabase Functions | 18 |
| Testes Unitários | 628 |
| Stories (Storybook) | 258 |
| Testes E2E | 39 |
| Documentação | 29 docs |
| Migrations SQL | 36 |

---

## 2. Arquitetura do Sistema

### 2.1 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   React 18  │  │  Vite 5.x   │  │  TailwindCSS + shadcn   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ React Query │  │   Zustand   │  │     Framer Motion       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  PostgreSQL │  │  Auth (JWT) │  │    Edge Functions       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Storage   │  │  Realtime   │  │       Row Level         │ │
│  │             │  │  (WebSocket)│  │       Security          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Fluxo de Dados

1. **Autenticação**: Supabase Auth com JWT
2. **API REST**: Supabase PostgREST auto-gerado
3. **Realtime**: WebSocket para atualizações em tempo real
4. **Cache**: React Query com estratégia stale-while-revalidate
5. **Offline**: Service Worker + IndexedDB

---

## 3. Stack Tecnológico

### 3.1 Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 18.x | Framework UI |
| TypeScript | 5.x | Tipagem estática |
| Vite | 5.x | Build tool |
| TailwindCSS | 3.x | Estilização |
| shadcn/ui | - | Componentes UI |
| React Query | 5.x | Server state |
| React Router | 6.x | Roteamento |
| Framer Motion | - | Animações |
| i18next | - | Internacionalização |
| Zod | - | Validação de schemas |
| React Hook Form | - | Formulários |

### 3.2 Backend (Supabase)

| Recurso | Uso |
|---------|-----|
| PostgreSQL | Banco de dados principal |
| Auth | Autenticação/autorização |
| Edge Functions | Lógica serverless (Deno) |
| Storage | Arquivos e imagens |
| Realtime | Atualizações em tempo real |
| Row Level Security | Segurança por linha |

### 3.3 DevOps

| Ferramenta | Propósito |
|------------|-----------|
| GitHub Actions | CI/CD |
| Vitest | Testes unitários |
| Playwright | Testes E2E |
| Storybook | Documentação de componentes |
| ESLint | Linting |
| Prettier | Formatação |
| Husky | Git hooks |
| Commitlint | Convenção de commits |

---

## 4. Estrutura do Projeto

```
fast-grava-es/
├── .github/                    # GitHub configs
│   ├── workflows/              # CI/CD pipelines
│   └── ISSUE_TEMPLATE/         # Templates de issues
├── .husky/                     # Git hooks
├── .storybook/                 # Config Storybook
├── docs/                       # Documentação (29 docs)
├── e2e/                        # Testes E2E (39 specs)
├── k8s/                        # Kubernetes configs
├── public/                     # Assets estáticos
│   └── pwa-icons/              # Ícones PWA
├── src/
│   ├── components/             # Componentes React (156)
│   │   ├── abc/                # Custeio ABC
│   │   ├── assistant/          # Assistente técnico
│   │   ├── auth/               # Autenticação
│   │   ├── dashboard/          # Widgets dashboard
│   │   ├── documents/          # Gestão documentos
│   │   ├── integrations/       # Integrações externas
│   │   ├── jobs/               # Gestão de jobs
│   │   ├── kanban/             # Board Kanban
│   │   ├── knowledge/          # Base de conhecimento
│   │   ├── layout/             # Layout principal
│   │   ├── ml/                 # Machine Learning
│   │   ├── navigation/         # Navegação
│   │   ├── notifications/      # Notificações
│   │   ├── oee/                # Métricas OEE
│   │   ├── offline/            # Suporte offline
│   │   ├── operators/          # Gestão operadores
│   │   ├── qrcode/             # Scanner QR
│   │   ├── reliability/        # Confiabilidade
│   │   ├── settings/           # Configurações
│   │   ├── shift/              # Gestão de turnos
│   │   ├── tpm/                # TPM
│   │   ├── traceability/       # Rastreabilidade
│   │   └── ui/                 # Componentes base
│   ├── contexts/               # React Contexts (12)
│   ├── hooks/                  # Custom Hooks (103)
│   ├── i18n/                   # Internacionalização
│   │   └── locales/            # pt-BR, en-US, es-ES
│   ├── integrations/           # Integrações Supabase
│   ├── lib/                    # Utilitários
│   ├── pages/                  # Páginas (36)
│   ├── schemas/                # Schemas Zod
│   ├── services/               # Services (10)
│   ├── stories/                # Storybook stories
│   ├── test/                   # Setup de testes
│   └── types/                  # TypeScript types
├── supabase/
│   ├── functions/              # Edge Functions (18)
│   └── migrations/             # SQL Migrations (36)
└── [config files]              # tsconfig, vite, etc.
```

---

## 5. Componentes

### 5.1 Componentes UI Base (shadcn/ui)

O projeto utiliza shadcn/ui como base para componentes:

- **Button**: Variantes (default, destructive, outline, secondary, ghost, gradient)
- **Card**: Container para conteúdo
- **Dialog**: Modais
- **Form**: Integração com React Hook Form
- **Input/Select/Checkbox**: Campos de formulário
- **Table**: Tabelas de dados
- **Toast/Sonner**: Notificações
- **Tabs**: Navegação por abas
- **Tooltip**: Dicas contextuais

### 5.2 Componentes de Negócio

#### Dashboard
- `OccupancyChart`: Gráfico de ocupação de máquinas
- `RecentJobsTable`: Tabela de jobs recentes
- `AlertsWidget`: Widget de alertas
- `BufferStatusWidget`: Status do buffer
- `BottleneckWidget`: Identificação de gargalos
- `StatsCard`: Cards de estatísticas

#### Kanban
- `KanbanBoard`: Board principal
- `KanbanColumn`: Colunas do board
- `KanbanCard`: Cards de tarefas
- `KanbanFilters`: Filtros

#### OEE
- `OEEGauge`: Indicador OEE
- `AvailabilityChart`: Disponibilidade
- `PerformanceChart`: Performance
- `QualityChart`: Qualidade

---

## 6. Hooks Customizados

### 6.1 Hooks de Estado

```typescript
// useDebounce - Debounce de valores
const debouncedValue = useDebounce(value, 300);

// useThrottle - Throttle de valores
const throttledValue = useThrottle(value, 100);

// useLocalStorage - Persistência local
const [value, setValue] = useLocalStorage('key', defaultValue);
```

### 6.2 Hooks de Dados

```typescript
// useJobs - CRUD de jobs
const { jobs, createJob, updateJob, deleteJob } = useJobs();

// useMachines - Gestão de máquinas
const { machines, isLoading } = useMachines();

// useOperators - Gestão de operadores
const { operators, rankings } = useOperators();

// useOEE - Métricas OEE
const { oeeData, availability, performance, quality } = useOEE();
```

### 6.3 Hooks de UI

```typescript
// useMediaQuery - Responsividade
const isMobile = useMediaQuery('(max-width: 768px)');

// useClickOutside - Detectar clique fora
useClickOutside(ref, () => setIsOpen(false));

// useScrollPosition - Posição do scroll
const scrollY = useScrollPosition();
```

---

## 7. Contextos

### 7.1 AuthContext

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: 'coordinator' | 'operator' | 'manager' | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  isCoordinator: boolean;
  isOperator: boolean;
  isManager: boolean;
}
```

### 7.2 OfflineSyncContext

```typescript
interface OfflineSyncContextType {
  isOnline: boolean;
  pendingSync: number;
  cacheData: () => Promise<void>;
  syncPending: () => Promise<void>;
}
```

---

## 8. Páginas

### 8.1 Páginas Principais

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Index | Dashboard principal |
| `/daily-calendar` | DailyCalendar | Calendário diário |
| `/weekly-calendar` | WeeklyCalendar | Calendário semanal |
| `/kanban` | KanbanBoard | Board Kanban |
| `/operators` | OperatorsPage | Gestão de operadores |
| `/machines` | MachinesPage | Gestão de máquinas |
| `/oee` | OEEDashboard | Dashboard OEE |
| `/abc-costing` | ABCCostingDashboard | Custeio ABC |
| `/tpm` | TPMDashboard | Dashboard TPM |
| `/spc` | SPCDashboard | Controle estatístico |
| `/bi` | BIDashboard | Business Intelligence |
| `/settings` | SettingsPage | Configurações |

### 8.2 Controle de Acesso

```typescript
// Rotas protegidas por role
<ProtectedRoute allowedRoles={['coordinator', 'manager']}>
  <AdminPage />
</ProtectedRoute>
```

---

## 9. Supabase Backend

### 9.1 Edge Functions

| Função | Descrição |
|--------|-----------|
| `health-check` | Verificação de saúde |
| `backup-scheduler` | Agendamento de backups |
| `bitrix24-sync` | Sincronização Bitrix24 |
| `calculate-rankings` | Cálculo de rankings |
| `create-operator` | Criação de operador |
| `update-operator` | Atualização de operador |
| `cron-cleanup` | Limpeza agendada |
| `daily-maintenance-summary` | Resumo de manutenção |
| `erp-api` | Integração ERP |
| `excel-export` | Exportação Excel |
| `image-optimizer` | Otimização de imagens |
| `metrics-collector` | Coleta de métricas |
| `ml-predictions` | Predições ML |
| `pdf-generator` | Geração de PDFs |
| `send-email-report` | Envio de relatórios |
| `send-push-notification` | Push notifications |
| `technical-assistant` | Assistente técnico |
| `webhook-handler` | Handler de webhooks |

### 9.2 Tabelas Principais

- `jobs`: Tarefas de produção
- `machines`: Máquinas
- `operators`: Operadores
- `profiles`: Perfis de usuário
- `user_roles`: Papéis de usuário
- `oee_records`: Registros OEE
- `abc_activities`: Atividades ABC
- `abc_cost_pools`: Pools de custo
- `maintenance_records`: Registros de manutenção
- `techniques`: Técnicas de gravação

---

## 10. Testes

### 10.1 Testes Unitários (Vitest)

```bash
# Executar todos os testes
npm run test

# Executar com coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### 10.2 Testes E2E (Playwright)

```bash
# Executar testes E2E
npm run test:e2e

# Modo UI
npm run test:e2e:ui
```

### 10.3 Cobertura

| Categoria | Cobertura |
|-----------|-----------|
| Componentes | 201% (314 testes) |
| Hooks | 103% (106 testes) |
| Pages | 100% (36 testes) |
| Contexts | 100% (12 testes) |
| Services | 170% (17 testes) |
| Supabase Functions | 100% (18 testes) |

---

## 11. Internacionalização

### 11.1 Idiomas Suportados

- 🇧🇷 Português (Brasil) - `pt-BR`
- 🇺🇸 English (US) - `en-US`
- 🇪🇸 Español - `es-ES`

### 11.2 Uso

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<h1>{t('dashboard.title')}</h1>
```

---

## 12. PWA

### 12.1 Funcionalidades

- ✅ Instalável como app
- ✅ Funciona offline
- ✅ Cache de assets
- ✅ Push notifications
- ✅ Sincronização em background

### 12.2 Ícones PWA

Todos os tamanhos necessários:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

---

## 13. Deploy e CI/CD

### 13.1 GitHub Workflows

| Workflow | Trigger | Ação |
|----------|---------|------|
| `ci.yml` | Push/PR | Build + Testes |
| `cd.yml` | Push main | Deploy produção |
| `lint.yml` | Push/PR | ESLint + Prettier |
| `tests.yml` | Push/PR | Vitest + Playwright |
| `security.yml` | Schedule | Audit de segurança |
| `preview.yml` | PR | Deploy preview |

### 13.2 Kubernetes

```yaml
# Deployment
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

---

## 14. Guia de Contribuição

### 14.1 Conventional Commits

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: manutenção
```

### 14.2 Fluxo de Desenvolvimento

1. Fork do repositório
2. Criar branch: `git checkout -b feat/nova-feature`
3. Commit: `git commit -m "feat: descrição"`
4. Push: `git push origin feat/nova-feature`
5. Abrir Pull Request

### 14.3 Requisitos

- Node.js 20+
- npm ou bun
- Conta Supabase

---

## 📞 Contato

- **Repositório**: https://github.com/adm01-debug/fast-grava-es
- **Segurança**: security@fastgrava.com

---

*Documentação gerada em Dezembro 2024*
*Versão 1.0.0*
