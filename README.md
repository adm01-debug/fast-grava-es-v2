# 🏭 Fast Gravações — Sistema de Produção Industrial

![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Tests](https://img.shields.io/badge/tests-1263%20passing-brightgreen)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

Sistema completo de agendamento e gerenciamento de produção para personalização de produtos, com suporte a **16 técnicas de gravação**, **52 máquinas** e **28 módulos**.

## 🚀 Quick Start

```bash
# 1. Clone e instale
git clone <YOUR_GIT_URL> && cd fast-gravacoes
npm install

# 2. Dev server
npm run dev

# 3. Testes
npm test

# 4. Build
npm run build
```

## 🏗️ Arquitetura

```
src/
├── components/     # UI por domínio (kanban/, operators/, maintenance/)
├── hooks/          # Custom hooks (abc/, scheduling/)
├── services/       # Camada de serviço (auth, jobs, machines)
├── schemas/        # Validação Zod (job, operator, machine)
├── constants/      # Enums, thresholds, configurações
├── contexts/       # React contexts (Auth, Theme, Offline)
├── lib/            # Utils (logger, validation, jobStateMachine)
├── pages/          # Componentes de rota (38 rotas)
└── integrations/   # Supabase client + types (auto-gerado)

supabase/
├── functions/      # 25 Edge Functions (Deno)
├── migrations/     # Migrations versionadas
└── config.toml     # Configuração do projeto

docs/
├── adr/            # Architecture Decision Records
├── PERFORMANCE.md  # Guia de performance
└── LEVANTAMENTO_COMPLETO_FUNCIONALIDADES.md
```

**Decisões documentadas:** Ver [`docs/adr/`](docs/adr/)

## 🔑 Funcionalidades Principais

| Módulo | Descrição |
|--------|-----------|
| 📅 Calendário | Visualização diária/semanal com drag-and-drop |
| 📋 Kanban | WIP limits, aging, swimlanes, bulk actions |
| 🎯 Buffer Auto | Mantém 3 jobs prontos por técnica |
| ⚡ Smart Sequencing | Otimização por cor/material |
| ⚖️ Load Balancing | Redistribuição inteligente de carga |
| 🔮 Predições ML | Previsão de falhas via machine learning |
| 📊 OEE/BI | Dashboards executivos e operacionais |
| 🔧 TPM | Manutenção produtiva total com checklists |
| 💰 ABC Costing | Custeio baseado em atividades |
| 🏷️ Rastreabilidade | QR Code, genealogia, inspeções |
| 📖 Base Conhecimento | Fichas técnicas com versionamento |
| ⚡ Energia | Monitoramento de consumo energético |
| 🤖 Assistente IA | Suporte técnico com Lovable AI |
| 📱 Offline-First | IndexedDB + Service Worker |

## 🔐 Segurança

- **RBAC** com 3 roles: Coordinator, Operator, Manager
- **RLS** (Row Level Security) em 100% das tabelas
- **HIBP** leak check em senhas
- **Strict TypeScript** (`strict: true`)
- **Audit logging** para ações sensíveis
- Ver [ADR-003](docs/adr/003-rbac-with-rls.md)

## 🧪 Testes

```bash
npm test                    # Todos os testes (1.263)
npm test -- --coverage      # Com cobertura
npm test -- --run jobState  # Testes específicos
```

| Tipo | Quantidade | Localização |
|------|-----------|-------------|
| Unit | ~900 | `src/hooks/__tests__/` |
| Component | ~250 | `src/components/**/__tests__/` |
| Integration | ~100 | `src/test/__tests__/` |

## 📦 Stack

- **Frontend:** React 18 + Vite 5 + TypeScript 5 (strict)
- **UI:** Tailwind CSS + shadcn/ui + Framer Motion
- **State:** TanStack Query + Zustand
- **Backend:** Lovable Cloud (Supabase)
- **Auth:** Supabase Auth + RBAC
- **Validação:** Zod schemas
- **Testes:** Vitest + Testing Library

## 🚢 Deploy

Abra o projeto no [Lovable](https://lovable.dev) → Share → Publish.

Para domínio customizado: Project → Settings → Domains → Connect Domain.

## 📖 Documentação

- [`docs/adr/`](docs/adr/) — Architecture Decision Records
- [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) — Guia de performance
- [`docs/ERROR_HANDLING_PATTERNS.md`](docs/ERROR_HANDLING_PATTERNS.md) — Padrões de error handling
- [`docs/LEVANTAMENTO_COMPLETO_FUNCIONALIDADES.md`](docs/LEVANTAMENTO_COMPLETO_FUNCIONALIDADES.md) — Mapa funcional completo
