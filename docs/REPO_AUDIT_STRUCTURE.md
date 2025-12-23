# Auditoria do Repositório — Inventário Estrutural (Exaustivo)

> **Escopo**: este relatório descreve **apenas este projeto** (snapshot atual no ambiente Lovable).
>
> **Importante (GitHub API)**: no momento, não há conexão/credencial disponível aqui para consultar o GitHub via API. Portanto, a “comparação com GitHub” fica limitada ao **snapshot local sincronizado** (o que normalmente reflete o repositório), sem validação direta de histórico/autor/commits via API.

## 0) Raiz do repositório (.)

### Pastas
- .github/
- .husky/
- .storybook/
- docs/
- e2e/
- k8s/
- node_modules/
- public/
- scripts/
- src/
- supabase/

### Arquivos (top-level)
- .editorconfig
- .env
- .env.example
- .env.production
- .env.staging
- .git
- .gitignore
- .lintstagedrc
- .nvmrc
- .prettierrc
- CHANGELOG.md
- CODE_OF_CONDUCT.md
- CONTRIBUTING.md
- Dockerfile
- LICENSE
- README.md
- SECURITY.md
- bun.lock
- bun.lockb
- commitlint.config.js
- components.json
- docker-compose.yml
- eslint.config.js
- index.html
- nginx.conf
- package-lock.json
- package.json
- playwright.config.ts
- postcss.config.js
- tailwind.config.ts
- tsconfig.app.json
- tsconfig.app.tsbuildinfo
- tsconfig.json
- tsconfig.node.json
- tsconfig.node.tsbuildinfo
- vite.config.ts
- vitest.config.ts

## 1) .github/

### .github/workflows/
- cd.yml
- ci.yml
- lint.yml
- preview.yml
- security.yml
- tests.yml

### Outros
- .github/ISSUE_TEMPLATE/
- .github/CODEOWNERS
- .github/PULL_REQUEST_TEMPLATE.md
- .github/dependabot.yml

## 2) docs/

- ABC_COSTING.md
- API.md
- ARCHITECTURE.md
- CALENDAR.md
- CHANGELOG.md
- CI_CD.md
- CONTRIBUTING.md
- DATABASE.md
- DEPENDENCY_AUDIT.md
- DEPLOYMENT.md
- DOCKER.md
- DOCUMENTACAO_TECNICA.docx
- DOCUMENTACAO_TECNICA.md
- E2E_TESTING.md
- ENVIRONMENT_VARIABLES.md
- ERROR_HANDLING_PATTERNS.md
- HOOKS_API.md
- INPUT_SANITIZATION.md
- LOCAL_DEVELOPMENT.md
- PERFORMANCE.md
- RATE_LIMITING.md
- RELEASE_PROCESS.md
- SECRETS_ROTATION.md
- SECURITY.md
- SECURITY_HEADERS.md
- SHIFT_MANAGEMENT.md
- SPC.md
- STORYBOOK.md
- TESTING.md
- TESTING_STRATEGY.md
- TROUBLESHOOTING.md

## 3) e2e/

- abc-costing.spec.ts
- alerts.spec.ts
- auth.spec.ts
- bi-dashboard.spec.ts
- bitrix24.spec.ts
- calendar.spec.ts
- code-quality.spec.ts
- dashboard.spec.ts
- design-system.spec.ts
- documents.spec.ts
- efficiency.spec.ts
- energy.spec.ts
- executive.spec.ts
- gamification.spec.ts
- home.spec.ts
- jobs.spec.ts
- kanban.spec.ts
- knowledge-base.spec.ts
- kpi.spec.ts
- machines.spec.ts
- ml-predictions.spec.ts
- new-job.spec.ts
- notifications.spec.ts
- oee.spec.ts
- offline.spec.ts
- operator-productivity.spec.ts
- operator-view.spec.ts
- operators.spec.ts
- pending-queue.spec.ts
- pwa-install.spec.ts
- qr-scanner.spec.ts
- reports.spec.ts
- settings.spec.ts
- shift-handover.spec.ts
- spc.spec.ts
- technical-assistant.spec.ts
- tpm.spec.ts
- traceability.spec.ts
- weekly-calendar.spec.ts

## 4) k8s/

- deployment.yaml
- service.yaml

## 5) scripts/

- generate-pwa-icons.sh

## 6) public/

### public/
- favicon.ico
- manifest.json
- offline.html
- placeholder.svg
- robots.txt
- sw.js

### public/icons/
- icon.svg

### public/pwa-icons/
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## 7) src/

### src/ (raiz)
- App.css
- App.tsx
- index.css
- main.tsx
- tailwind.config.lov.json
- vite-env.d.ts

### src/ diretórios
- components/
- constants/
- contexts/
- hooks/
- i18n/
- integrations/
- lib/
- pages/
- schemas/
- services/
- stories/
- test/
- types/

### 7.1) src/components/
Subpastas:
- abc/
- assistant/
- auth/
- dashboard/
- design-system/
- documents/
- integrations/
- jobs/
- kanban/
- knowledge/
- layout/
- ml/
- navigation/
- notifications/
- oee/
- offline/
- operator/
- operators/
- qrcode/
- reliability/
- settings/
- shift/
- tpm/
- traceability/
- ui/

Arquivos no nível src/components/:
- NavLink.tsx
- NavLink.test.tsx

#### src/components/abc/
- ABCActivityRatesCard.tsx (+ .test.tsx)
- ABCCostBreakdownChart.tsx (+ .test.tsx)
- ABCCostPoolsCard.tsx (+ .test.tsx)
- ABCJobCostsTable.tsx (+ .test.tsx)
- ABCTechniqueChart.tsx (+ .test.tsx)
- __tests__/

#### src/components/assistant/
- AssistantButton.tsx (+ .test.tsx)
- TechnicalAssistant.tsx (+ .test.tsx)
- __tests__/

#### src/components/auth/
- ProtectedRoute.tsx (+ .test.tsx)
- __tests__/

#### src/components/dashboard/
- AlertsWidget.tsx (+ .test.tsx)
- BottleneckWidget.tsx (+ .test.tsx)
- BufferStatusWidget.tsx (+ .test.tsx)
- CompactTimeline.tsx (+ .test.tsx)
- ConflictAlertsWidget.tsx (+ .test.tsx)
- DashboardEditControls.tsx (+ .test.tsx)
- DraggableWidget.tsx (+ .test.tsx)
- EfficiencyAlertHistoryWidget.tsx (+ .test.tsx)
- LoadBalancingWidget.tsx (+ .test.tsx)
- OccupancyChart.tsx (+ .test.tsx)
- QuickActions.tsx (+ .test.tsx)
- RealtimeIndicator.tsx (+ .test.tsx)
- RecentJobsTable.tsx (+ .test.tsx)
- SmartSequencingWidget.tsx (+ .test.tsx)
- SortableWidgetSection.tsx (+ .test.tsx)
- StatsCard.tsx (+ .test.tsx)
- TodayTimeline.tsx (+ .test.tsx)
- __tests__/

#### src/components/design-system/
- HooksExamplesSection.tsx (+ .test.tsx)

#### src/components/documents/
- DocumentUploadModal.tsx (+ .test.tsx)
- DocumentViewer.tsx (+ .test.tsx)
- DocumentsList.tsx (+ .test.tsx)
- __tests__/

#### src/components/integrations/
- Bitrix24FieldMapping.tsx (+ .test.tsx)
- Bitrix24SyncHistory.tsx (+ .test.tsx)
- Bitrix24SyncPanel.tsx (+ .test.tsx)
- __tests__/

#### src/components/jobs/
- JobDetailsModal.tsx (+ .test.tsx)
- __tests__/

#### src/components/kanban/
- DragOverlayCard.tsx (+ .test.tsx)
- DraggableJobCard.tsx (+ .test.tsx)
- DroppableColumn.tsx (+ .test.tsx)
- __tests__/

#### src/components/knowledge/
- TechnicalSheetEditor.tsx (+ .test.tsx)
- TechnicalSheetViewer.tsx (+ .test.tsx)
- __tests__/

#### src/components/layout/
- AppSidebar.tsx (+ .test.tsx)
- LanguageSwitcher.tsx (+ .test.tsx)
- MainLayout.tsx (+ .test.tsx)
- OperatorMachinesIndicator.tsx (+ .test.tsx)
- PageTransition.tsx (+ .test.tsx)
- QuickFavoritesBar.tsx (+ .test.tsx)
- ThemeToggle.tsx (+ .test.tsx)
- __tests__/

#### src/components/ml/
- MLNotificationSettings.tsx (+ .test.tsx)
- MLPredictionCard.tsx (+ .test.tsx)
- MLRiskDistributionChart.tsx (+ .test.tsx)
- __tests__/

#### src/components/navigation/
- NavigationListener.tsx (+ .test.tsx)
- __tests__/

#### src/components/notifications/
- DailySummaryCard.tsx (+ .test.tsx)
- EfficiencyNotificationProvider.tsx (+ .test.tsx)
- NotificationIntegrator.tsx (+ .test.tsx)
- NotificationsList.test.tsx
- PushNotificationManager.tsx (+ .test.tsx)
- NotificationBell.test.tsx
- __tests__/

#### src/components/oee/
- OEEGaugeCard.tsx (+ .test.tsx)
- OEELossesChart.tsx (+ .test.tsx)
- OEEMachineTable.tsx (+ .test.tsx)
- OEETechniqueComparison.tsx (+ .test.tsx)
- OEETrendChart.tsx (+ .test.tsx)
- __tests__/

#### src/components/offline/
- OfflineReadyIndicator.tsx (+ .test.tsx)
- OfflineStatusBanner.tsx (+ .test.tsx)
- OfflineSyncIndicator.tsx (+ .test.tsx)
- __tests__/

#### src/components/operator/
- ProductionRegistrationModal.tsx (+ .test.tsx)
- __tests__/

#### src/components/operators/
- CreateGoalModal.tsx (+ .test.tsx)
- CreateOperatorModal.tsx
- EditOperatorModal.tsx
- GoalAlertsWidget.tsx
- GoalsHistoryCard.tsx
- MachineAssignmentModal.tsx (+ .test.tsx)
- OperatorAuditHistory.tsx (+ .test.tsx)
- OperatorCard.test.tsx
- OperatorFilters.test.tsx
- OperatorGoals.test.tsx
- OperatorGoalsCard.tsx (+ .test.tsx)
- OperatorPerformanceChart.test.tsx
- OperatorRankings.test.tsx
- OperatorStats.test.tsx
- __tests__/

#### src/components/qrcode/
- JobQRCode.tsx (+ .test.tsx)
- QRScanner.tsx (+ .test.tsx)
- ScanHistory.tsx (+ .test.tsx)
- ScanStatsChart.tsx (+ .test.tsx)
- __tests__/

#### src/components/reliability/
- MTBFMTTRWidget.tsx (+ .test.tsx)
- __tests__/

#### src/components/settings/
- CreateUserModal.tsx (+ .test.tsx)
- UserManagement.tsx (+ .test.tsx)
- __tests__/

#### src/components/shift/
- ChecklistTemplatesManager.tsx (+ .test.tsx)
- CreateHandoverModal.tsx (+ .test.tsx)
- HandoverDetailsModal.tsx (+ .test.tsx)
- OccurrencesPanel.tsx (+ .test.tsx)
- PendingTasksPanel.tsx (+ .test.tsx)
- __tests__/

#### src/components/tpm/
- CreateScheduleModal.tsx (+ .test.tsx)
- TPMAlertsPanel.tsx (+ .test.tsx)
- TPMCalendar.tsx (+ .test.tsx)
- TPMNotificationSettings.tsx (+ .test.tsx)
- TPMScheduleList.tsx (+ .test.tsx)
- TPMScheduleCard.test.tsx
- __tests__/

#### src/components/traceability/
- LotDetailsModal.tsx (+ .test.tsx)
- LotGenealogyView.tsx (+ .test.tsx)
- __tests__/

#### src/components/ui/
- ui/__tests__/
- ui/stories/
- (grande coleção de componentes base: accordion, dialog, drawer, toast, tooltip, etc. + arquivos *.test.tsx e *.stories.tsx)

> Listagem completa de `src/components/ui/` está disponível via diretórios `src/components/ui` + `src/components/ui/__tests__` + `src/components/ui/stories` (ver snapshots de listagem usados na auditoria).

### 7.2) src/hooks/
- Subpastas: abc/, tpm/, utils/
- Arquivos: grande conjunto de hooks `use*.ts` e respectivos testes `*.test.ts`/`*.test.tsx`.

#### src/hooks/abc/
- index.ts (+ index.test.ts)
- types.ts (+ types.test.ts)
- useABCCalculations.ts (+ .test.ts)
- useABCData.ts (+ .test.ts)
- useABCMutations.ts (+ .test.ts)

#### src/hooks/tpm/
- index.ts (+ index.test.ts)
- types.ts (+ types.test.ts)
- useTPMData.ts (+ .test.ts)
- useTPMMutations.ts (+ .test.ts)
- useTPMStats.ts (+ .test.ts)

#### src/hooks/utils/
- index.ts (+ index.test.ts)
- (coleção de hooks utilitários: useAsync, useClipboard, usePagination, useWindowSize, etc. + testes)

### 7.3) src/pages/
- Pasta de testes: src/pages/__tests__/
- Páginas: ABCCostingDashboard.tsx, AlertsDashboard.tsx, AuthPage.tsx, ... (36 páginas listadas via `src/pages/`).

### 7.4) src/services/
- Serviços: documents.ts, energy.ts, gamification.ts, ml.ts, oee.ts, qrcode.ts, shifts.ts, spc.ts, tpm.ts, traceability.ts e arquivos de teste associados.

### 7.5) src/lib/
- Pastas: formatters/, monitoring/, utils/, validators/
- Arquivos: errorHandling.ts, indexedDB.ts, offlineStorage.ts, pdfExport.ts, queryConfig.ts, etc. + testes.

### 7.6) src/contexts/
- AuthContext.tsx (+ .test.tsx)
- BreadcrumbContext.tsx (+ .test.tsx)
- ConfirmationContext.tsx (+ .test.tsx)
- FeatureFlagsContext.tsx (+ .test.tsx)
- NotificationsContext.tsx (+ .test.tsx)
- OfflineSyncContext.tsx (+ .test.tsx)
- PermissionsContext.tsx (+ .test.tsx)
- SearchContext.tsx (+ .test.tsx)
- SidebarContext.tsx (+ .test.tsx)
- ThemeContext.tsx (+ .test.tsx)
- UserPreferencesContext.tsx (+ .test.tsx)
- WebSocketContext.tsx (+ .test.tsx)

### 7.7) src/i18n/
- index.ts
- locales/en-US.json
- locales/es-ES.json
- locales/pt-BR.json

### 7.8) src/types/
- api.types.ts
- auth.types.ts
- calendar.types.ts
- components.types.ts
- design-system.types.ts
- documents.types.ts
- forms.types.ts
- hooks.types.ts
- install.types.ts
- navigation.types.ts
- notifications.types.ts
- scheduling.ts
- spc.types.ts

### 7.9) src/schemas/
- alertSchema.ts (+ .test.ts)
- energySchema.ts (+ .test.ts)
- gamificationSchema.ts (+ .test.ts)
- qualitySchema.ts (+ .test.ts)
- reportSchema.ts (+ .test.ts)
- index.ts (+ .test.ts)

### 7.10) src/test/
- setup.ts
- utils.tsx
- integration/ (vários testes de integração)
- mocks/ (data.ts, supabase.ts)

### 7.11) src/stories/
- Subpastas por domínio (abc, dashboard, oee, etc.)
- NavLink.stories.tsx

### 7.12) src/integrations/
- supabase/

## 8) supabase/

### supabase/functions/
- __tests__/
- backup-scheduler/index.ts
- bitrix24-sync/index.ts
- calculate-rankings/index.ts
- create-operator/index.ts
- cron-cleanup/index.ts
- daily-maintenance-summary/index.ts
- erp-api/index.ts
- excel-export/index.ts
- health-check/index.ts
- image-optimizer/index.ts
- metrics-collector/index.ts
- ml-predictions/index.ts
- pdf-generator/index.ts
- send-email-report/index.ts
- send-push-notification/index.ts
- technical-assistant/index.ts
- update-operator/index.ts
- webhook-handler/index.ts

### supabase/migrations/
- (lista extensa de arquivos .sql com timestamps 20251212…20251220…)

---

**Próximo relatório:** `docs/REPO_AUDIT_FLOWS.md` (fluxos/imports) + `docs/REPO_AUDIT_QUALITY.md` (achados: erros/warnings/duplicidades).
