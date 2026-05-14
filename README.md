# Sistema de Agendamento de Produção

![Coverage](https://img.shields.io/badge/coverage-checking-yellow)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff)

## Visão Geral

### 📄 Relatórios de Auditoria
- [Relatório Enterprise (Markdown)](AUDITORIA_ENTERPRISE_2026.md)
- [Relatório Enterprise (PDF)](docs/AUDITORIA_ENTERPRISE_2026.pdf)

*Nota: O PDF é gerado automaticamente durante o processo de CI sempre que houver atualizações no relatório Markdown.*


Sistema completo de agendamento e gerenciamento de produção para personalização de produtos, com suporte a 16 técnicas de gravação e 52 máquinas.

### Funcionalidades Principais

- 📅 **Calendário de Produção** - Visualização diária/semanal com drag-and-drop
- 🎯 **Gestão de Buffer** - Manutenção automática de 3 jobs prontos por técnica
- ⚡ **Smart Sequencing** - Otimização automática por cor/material
- ⚖️ **Load Balancing** - Redistribuição inteligente de carga entre máquinas
- 🔮 **ML Predictions** - Previsão de falhas com machine learning
- 📊 **OEE Dashboard** - Métricas de eficiência operacional
- 🔧 **TPM** - Manutenção produtiva total
- 💰 **ABC Costing** - Custeio baseado em atividades
- 🤖 **Assistente Técnico IA** - Suporte técnico com IA

## Testes

```bash
# Executar todos os testes
npm test

# Executar com coverage report
npm test -- --coverage

# Executar testes específicos
npm test -- --run useLoadBalancingWithActions
```

### Estrutura de Testes

| Categoria | Arquivos | Cobertura |
|-----------|----------|-----------|
| Hooks | `src/hooks/*.test.ts` | Unitários |
| Componentes | `src/components/**/*.test.tsx` | Componentes |
| Integração | `src/test/integration/*.test.ts` | E2E |

### Padrões Implementados

- ✅ Error Handling centralizado (`src/lib/errorHandling.ts`)
- ✅ Retry automático com exponential backoff (`src/lib/queryConfig.ts`)
- ✅ Validação de dados em hooks críticos
- ✅ Real-time subscriptions para sincronização
- ✅ Paginação para grandes conjuntos de dados

📖 Documentação completa: [`docs/ERROR_HANDLING_PATTERNS.md`](docs/ERROR_HANDLING_PATTERNS.md)

## Project Info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
