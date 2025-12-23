# Auditoria do Repositório — Fluxos, Imports e Arquitetura (nível import/fluxo)

> **Objetivo**: mapear os fluxos principais (entrada, providers, rotas, camadas de dados, backend functions) a partir dos imports/exports e estruturas identificadas.

## 1) Bootstrap / Entrada

### `src/main.tsx`
Fluxo:
- `createRoot(...).render(...)`
- Envolve o app com `ThemeProvider` (`next-themes`) usando `attribute="class"`, `defaultTheme="dark"`.
- Importa `./i18n` para inicializar internacionalização.

**Import chain**:
- `src/main.tsx` → `src/App.tsx` → páginas lazy-load (`src/pages/*`) + contexts + componentes UI.

## 2) App Shell e Providers

### `src/App.tsx`
Providers (ordem de composição):
1. `ErrorBoundary` (`src/components/ui/error-boundary`)
2. `QueryClientProvider` (TanStack Query)
3. `TooltipProvider` (Radix Tooltip)
4. `Toaster` + `Sonner` (duas stacks de toast)
5. `BrowserRouter`
6. `NavigationListener`
7. `AuthProvider`
8. `OfflineSyncProvider`
9. `EfficiencyNotificationProvider`
10. `AnimatedRoutes` (com `AnimatePresence` + `PageTransition`)

**Observação de coerência de roles**:
- Rotas usam `allowedRoles={['coordinator','manager']}` etc.
- Tipos mostrados no contexto (`src/types/auth.types.ts`) têm `UserRole = 'admin' | 'manager' | 'supervisor' | 'operator' | 'viewer'`.
- Isso sugere que `coordinator` pode ser um papel vindo do backend (ex.: `app_role`) ou um descompasso entre frontend e backend.

## 3) Rotas (React Router)

Todas as páginas são lazy-loaded (`lazy(() => import('./pages/X'))`) com fallbacks via skeletons.

Rotas principais (path → page):
- `/auth` → `AuthPage`
- `/` → `Index`
- `/calendar/daily` → `DailyCalendar`
- `/calendar/weekly` → `WeeklyCalendar`
- `/pending` → `PendingQueue`
- `/alerts` → `AlertsDashboard`
- `/kanban` → `KanbanBoard`
- `/kpis` → `KPIDashboard`
- `/operator` → `OperatorView`
- `/efficiency` → `EfficiencyDashboard`
- `/assistant` → `TechnicalAssistantPage`
- `/scanner` → `QRScannerPage`
- `/integrations/bitrix24` → `Bitrix24ConfigPage`
- `/knowledge` → `TechnicalKnowledgeBase`
- `/design-system` → `DesignSystemPage` (sem `ProtectedRoute`)
- `/new-job` → `NewJobPage`
- `/machines` → `MachinesPage`
- `/operators` → `OperatorsPage`
- `/operators/productivity` → `OperatorProductivityPage`
- `/oee` → `OEEDashboard`
- `/abc` → `ABCCostingDashboard`
- `/tpm` → `TPMDashboard`
- `/ml-predictions` → `MLPredictionsDashboard`
- `/bi` → `BIDashboard`
- `/code-quality` → `CodeQualityDashboard`
- `/notifications` → `NotificationsPage`
- `/shift-handover` → `ShiftHandoverPage`
- `/traceability` → `TraceabilityPage`
- `/spc` → `SPCDashboard`
- `/executive` → `ExecutiveDashboard`
- `/energy` → `EnergyDashboard`
- `/gamification` → `GamificationPage`
- `/documents` → `DocumentsPage`
- `/settings` → `SettingsPage`
- `/install` → `InstallAppPage`
- `*` → `NotFound`

## 4) Exemplo de fluxo de UI: Modal de Job + QR

### `src/components/jobs/JobDetailsModal.tsx`
Imports relevantes:
- UI: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Button`, `Badge`, `Separator`, `StatusBadge`
- Data: `useSchedulingData`, tipo `DbJob` vindo de `useJobs`
- Feature: `JobQRCode`

Fluxo:
- Recebe `job` e renderiza dados + ações rápidas.
- Ao acionar ações, chama `onStatusChange(job.id, newStatus)` e fecha modal.

### `src/components/qrcode/JobQRCode.tsx`
Fluxo:
- Gera payload JSON `{ type:'job', id, order }`.
- Renderiza `QRCodeSVG` e oferece `handleDownload` (SVG→canvas→PNG) e `handlePrint` (abre `window.open` e injeta HTML).

## 5) UI primitives / acessibilidade (Dialog)

### `src/components/ui/dialog.tsx`
- Implementa wrappers Radix com `forwardRef`.
- Exporta `DialogDescription` (porém nem sempre é usado nos modais).

## 6) PWA / Runtime caching

### `vite.config.ts`
- Usa `vite-plugin-pwa` com `registerType: autoUpdate`.
- `manifest` com `name/short_name/description` e ícones em `public/pwa-icons`.
- Workbox runtime caching:
  - Google Fonts (CacheFirst)
  - `/api/*` (NetworkFirst) **observação**: no projeto atual, as funções backend não são expostas como `/api/*` por padrão; vale checar se isso está sendo realmente utilizado.

---

## Estado: comparação com GitHub via API
Sem uma conexão GitHub disponível aqui, eu **não consigo**:
- listar arquivos diretamente do GitHub via API
- identificar “quem upou” (Claude vs Lovable) via blame/commits

O que eu consigo (já realizado):
- inventário estrutural completo do snapshot local
- leitura de arquivos-chave para mapear imports e fluxos

