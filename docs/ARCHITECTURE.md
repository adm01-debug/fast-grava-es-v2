# 🏗️ Arquitetura do Sistema Fast-Grava-ES

## Visão Geral
Sistema MES (Manufacturing Execution System) para gestão de gravação industrial.

## Stack Tecnológica

### Frontend
- **React 18** + **TypeScript** - Framework UI
- **Vite** - Build tool
- **TailwindCSS** + **Shadcn/UI** - Estilização
- **TanStack Query** - Estado servidor
- **React Router** - Navegação

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL - Banco de dados
  - Auth - Autenticação
  - Storage - Arquivos
  - Edge Functions - Serverless
  - Realtime - Subscriptions

## Estrutura de Diretórios
```
src/
├── components/     # Componentes React
│   ├── ui/        # Componentes base
│   ├── dashboard/ # Widgets
│   └── ...
├── hooks/         # Custom hooks (74)
├── pages/         # Páginas (36)
├── lib/           # Utilitários
├── contexts/      # Contextos React
├── schemas/       # Schemas Zod
├── types/         # Tipos TypeScript
└── i18n/          # Internacionalização
```

## Fluxo de Dados
```
[UI] → [Hook] → [TanStack Query] → [Supabase] → [PostgreSQL]
```

## Módulos Principais
1. **Dashboard** - Visão geral
2. **Jobs** - Gestão de trabalhos
3. **Operators** - Operadores
4. **Machines** - Máquinas
5. **Quality** - Qualidade
6. **Maintenance** - Manutenção
7. **Reports** - Relatórios
8. **BI** - Business Intelligence
