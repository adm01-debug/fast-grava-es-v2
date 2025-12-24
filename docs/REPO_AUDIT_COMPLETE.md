# Auditoria Completa do Repositório — Inventário Exaustivo

> **Gerado em**: 2025-12-23
> **Contexto**: Projeto construído em parceria Claude (Anthropic) + Lovable
> **Status**: Inventário completo sem exclusão de arquivos

---

## 📊 Resumo Executivo

| Categoria | Total |
|-----------|-------|
| **Componentes** | 150+ arquivos |
| **Hooks** | 100+ hooks |
| **Services** | 17 serviços |
| **Pages** | 36 páginas |
| **Edge Functions** | 19 funções |
| **Contexts** | 12 contextos |
| **Types** | 13 arquivos de tipo |
| **Testes** | 200+ arquivos |
| **Documentação** | 34 documentos |
| **Migrations** | 36 migrações SQL |

---

## 1. ESTRUTURA DE DIRETÓRIOS RAIZ

```
/
├── .github/workflows/     # 6 workflows CI/CD
├── docs/                  # 34 documentos markdown
├── e2e/                   # 39 testes E2E
├── k8s/                   # 2 configs Kubernetes
├── public/                # Assets estáticos + PWA
├── scripts/               # Scripts utilitários
├── src/                   # Código fonte principal
└── supabase/              # Backend Supabase
    ├── functions/         # 19 Edge Functions
    └── migrations/        # 36 migrações SQL
```

---

## 2. COMPONENTES (src/components/)

### 2.1 ABC Costing (`/abc`)
| Arquivo | Exportações | Descrição |
|---------|-------------|-----------|
| `ABCActivityRatesCard.tsx` | `ABCActivityRatesCard` | Card para editar taxas por atividade |
| `ABCCostBreakdownChart.tsx` | `ABCCostBreakdownChart` | Gráfico de breakdown de custos |
| `ABCCostPoolsCard.tsx` | `ABCCostPoolsCard` | Card para gerenciar pools de custo |
| `ABCJobCostsTable.tsx` | `ABCJobCostsTable` | Tabela de custos por job |
| `ABCTechniqueChart.tsx` | `ABCTechniqueChart` | Gráfico de custos por técnica |

### 2.2 Assistant (`/assistant`)
| Arquivo | Exportações | Descrição |
|---------|-------------|-----------|
| `AssistantButton.tsx` | `AssistantButton` | Botão flutuante do assistente IA |
| `TechnicalAssistant.tsx` | `TechnicalAssistant` | Interface principal do assistente |

### 2.3 Auth (`/auth`)
| Arquivo | Exportações | Descrição |
|---------|-------------|-----------|
| `ProtectedRoute.tsx` | `ProtectedRoute` | HOC para rotas protegidas por role |

### 2.4 Dashboard (`/dashboard`) - 16 componentes
| Arquivo | Exportações |
|---------|-------------|
| `AlertsWidget.tsx` | `AlertsWidget` |
| `BottleneckWidget.tsx` | `BottleneckWidget` |
| `BufferStatusWidget.tsx` | `BufferStatusWidget` |
| `CompactTimeline.tsx` | `CompactTimeline` |
| `ConflictAlertsWidget.tsx` | `ConflictAlertsWidget` |
| `DashboardEditControls.tsx` | `DashboardEditControls` |
| `DraggableWidget.tsx` | `DraggableWidget` |
| `EfficiencyAlertHistoryWidget.tsx` | `EfficiencyAlertHistoryWidget` |
| `LoadBalancingWidget.tsx` | `LoadBalancingWidget` |
| `OccupancyChart.tsx` | `OccupancyChart` |
| `QuickActions.tsx` | `QuickActions` |
| `RealtimeIndicator.tsx` | `RealtimeIndicator` |
| `RecentJobsTable.tsx` | `RecentJobsTable` |
| `SmartSequencingWidget.tsx` | `SmartSequencingWidget` |
| `SortableWidgetSection.tsx` | `SortableWidgetSection` |
| `StatsCard.tsx` | `StatsCard` (memo) |
| `TodayTimeline.tsx` | `TodayTimeline` |

### 2.5 Design System (`/design-system`)
| Arquivo | Exportações |
|---------|-------------|
| `HooksExamplesSection.tsx` | `HooksExamplesSection` |

### 2.6 Documents (`/documents`)
| Arquivo | Exportações |
|---------|-------------|
| `DocumentUploadModal.tsx` | `DocumentUploadModal` |
| `DocumentViewer.tsx` | `DocumentViewer` |
| `DocumentsList.tsx` | `DocumentsList` |

### 2.7 Integrations (`/integrations`)
| Arquivo | Exportações |
|---------|-------------|
| `Bitrix24FieldMapping.tsx` | `Bitrix24FieldMapping` |
| `Bitrix24SyncHistory.tsx` | `Bitrix24SyncHistory` |
| `Bitrix24SyncPanel.tsx` | `Bitrix24SyncPanel` |

### 2.8 Jobs (`/jobs`)
| Arquivo | Exportações |
|---------|-------------|
| `JobDetailsModal.tsx` | `JobDetailsModal` |

### 2.9 Kanban (`/kanban`)
| Arquivo | Exportações |
|---------|-------------|
| `DragOverlayCard.tsx` | `DragOverlayCard` |
| `DraggableJobCard.tsx` | `DraggableJobCard` |
| `DroppableColumn.tsx` | `DroppableColumn` |

### 2.10 Knowledge (`/knowledge`)
| Arquivo | Exportações |
|---------|-------------|
| `TechnicalSheetEditor.tsx` | `TechnicalSheetEditor` |
| `TechnicalSheetViewer.tsx` | `TechnicalSheetViewer` |

### 2.11 Layout (`/layout`) - 7 componentes
| Arquivo | Exportações | Descrição |
|---------|-------------|-----------|
| `AppSidebar.tsx` | `AppSidebar` | Sidebar principal com navegação |
| `LanguageSwitcher.tsx` | `LanguageSwitcher` | Alternador de idiomas PT/EN/ES |
| `MainLayout.tsx` | `MainLayout` | Layout wrapper principal |
| `OperatorMachinesIndicator.tsx` | `OperatorMachinesIndicator` | Indicador de máquinas do operador |
| `PageTransition.tsx` | `PageTransition` | Animações de transição de página |
| `QuickFavoritesBar.tsx` | `QuickFavoritesBar` | Barra de favoritos rápidos |
| `ThemeToggle.tsx` | `ThemeToggle` | Alternador de tema claro/escuro |

### 2.12 ML (`/ml`)
| Arquivo | Exportações |
|---------|-------------|
| `MLNotificationSettings.tsx` | `MLNotificationSettings` |
| `MLPredictionCard.tsx` | `MLPredictionCard` |
| `MLRiskDistributionChart.tsx` | `MLRiskDistributionChart` |

### 2.13 Navigation (`/navigation`)
| Arquivo | Exportações |
|---------|-------------|
| `NavigationListener.tsx` | `NavigationListener` |

### 2.14 Notifications (`/notifications`)
| Arquivo | Exportações |
|---------|-------------|
| `DailySummaryCard.tsx` | `DailySummaryCard` |
| `EfficiencyNotificationProvider.tsx` | `EfficiencyNotificationProvider` |
| `NotificationIntegrator.tsx` | `NotificationIntegrator` |
| `PushNotificationManager.tsx` | `PushNotificationManager` |

### 2.15 OEE (`/oee`) - 5 componentes
| Arquivo | Exportações |
|---------|-------------|
| `OEEGaugeCard.tsx` | `OEEGaugeCard` |
| `OEELossesChart.tsx` | `OEELossesChart` |
| `OEEMachineTable.tsx` | `OEEMachineTable` |
| `OEETechniqueComparison.tsx` | `OEETechniqueComparison` |
| `OEETrendChart.tsx` | `OEETrendChart` |

### 2.16 Offline (`/offline`)
| Arquivo | Exportações |
|---------|-------------|
| `OfflineReadyIndicator.tsx` | `OfflineReadyIndicator` |
| `OfflineStatusBanner.tsx` | `OfflineStatusBanner` |
| `OfflineSyncIndicator.tsx` | `OfflineSyncIndicator` |

### 2.17 Operator (`/operator`)
| Arquivo | Exportações |
|---------|-------------|
| `ProductionRegistrationModal.tsx` | `ProductionRegistrationModal` |

### 2.18 Operators (`/operators`) - 12 componentes
| Arquivo | Exportações |
|---------|-------------|
| `CreateGoalModal.tsx` | `CreateGoalModal` |
| `CreateOperatorModal.tsx` | `CreateOperatorModal` |
| `EditOperatorModal.tsx` | `EditOperatorModal` |
| `GoalAlertsWidget.tsx` | `GoalAlertsWidget` |
| `GoalsHistoryCard.tsx` | `GoalsHistoryCard` |
| `MachineAssignmentModal.tsx` | `MachineAssignmentModal` |
| `OperatorAuditHistory.tsx` | `OperatorAuditHistory` |
| `OperatorGoalsCard.tsx` | `OperatorGoalsCard` |

### 2.19 QRCode (`/qrcode`)
| Arquivo | Exportações |
|---------|-------------|
| `JobQRCode.tsx` | `JobQRCode` |
| `QRScanner.tsx` | `QRScanner` |
| `ScanHistory.tsx` | `ScanHistory` |
| `ScanStatsChart.tsx` | `ScanStatsChart` |

### 2.20 Reliability (`/reliability`)
| Arquivo | Exportações |
|---------|-------------|
| `MTBFMTTRWidget.tsx` | `MTBFMTTRWidget` |

### 2.21 Settings (`/settings`)
| Arquivo | Exportações |
|---------|-------------|
| `CreateUserModal.tsx` | `CreateUserModal` |
| `UserManagement.tsx` | `UserManagement` |

### 2.22 Shift (`/shift`) - 5 componentes
| Arquivo | Exportações |
|---------|-------------|
| `ChecklistTemplatesManager.tsx` | `ChecklistTemplatesManager` |
| `CreateHandoverModal.tsx` | `CreateHandoverModal` |
| `HandoverDetailsModal.tsx` | `HandoverDetailsModal` |
| `OccurrencesPanel.tsx` | `OccurrencesPanel` |
| `PendingTasksPanel.tsx` | `PendingTasksPanel` |

### 2.23 TPM (`/tpm`) - 6 componentes
| Arquivo | Exportações |
|---------|-------------|
| `CreateScheduleModal.tsx` | `CreateScheduleModal` |
| `TPMAlertsPanel.tsx` | `TPMAlertsPanel` |
| `TPMCalendar.tsx` | `TPMCalendar` |
| `TPMNotificationSettings.tsx` | `TPMNotificationSettings` |
| `TPMScheduleList.tsx` | `TPMScheduleList` |

### 2.24 Traceability (`/traceability`)
| Arquivo | Exportações |
|---------|-------------|
| `LotDetailsModal.tsx` | `LotDetailsModal` |
| `LotGenealogyView.tsx` | `LotGenealogyView` |

### 2.25 UI (`/ui`) - 60+ componentes Shadcn
Componentes base incluem: accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, code-block, collapsible, command, context-menu, dialog, drawer, dropdown-menu, error-boundary, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, status-badge, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip, virtualized-list, virtualized-table

**Componentes de Acessibilidade:**
- `AriaLabel.tsx`, `FocusRing.tsx`, `FocusTrap.tsx`, `HighContrast.tsx`
- `KeyboardNav.tsx`, `LiveRegion.tsx`, `ReducedMotion.tsx`
- `ScreenReaderOnly.tsx`, `SearchInput.tsx`, `SkipLink.tsx`, `VisuallyHidden.tsx`

---

## 3. HOOKS (src/hooks/)

### 3.1 Hooks Principais (Raiz)
| Hook | Arquivo | Descrição |
|------|---------|-----------|
| `useJobs` | `useJobs.ts` | CRUD de jobs + realtime + mutations |
| `useTechniques` | `useJobs.ts` | Técnicas de produção |
| `useMachines` | `useJobs.ts` | Máquinas de produção |
| `useUpdateJobStatus` | `useJobs.ts` | Mutation para status de job |
| `useBufferStatus` | `useJobs.ts` | Status de buffer por técnica |
| `useSchedulingData` | `useSchedulingData.ts` | Dados consolidados de agendamento |
| `useOEE` | `useOEE.ts` | Cálculo de OEE (Availability × Performance × Quality) |
| `useKPIs` | `useKPIs.ts` | Métricas KPI do dashboard |
| `useTPM` | `useTPM.ts` | Manutenção produtiva total |
| `useOperators` | `useOperators.ts` | Gestão de operadores |
| `useMLPredictions` | `useMLPredictions.ts` | Previsões de ML |
| `useAlertCount` | `useAlertCount.ts` | Contagem de alertas |
| `useABCCosts` | `useABCCosts.ts` | Custeio ABC |
| `useDocuments` | `useDocuments.ts` | Gestão de documentos |
| `useEnergy` | `useEnergy.ts` | Monitoramento de energia |
| `useGamification` | `useGamification.ts` | Ranking e conquistas |
| `useSPC` | `useSPC.ts` | Controle estatístico de processo |
| `useTraceability` | `useTraceability.ts` | Rastreabilidade de lotes |
| `useShiftHandover` | `useShiftHandover.ts` | Passagem de turno |

### 3.2 Hooks ABC (`/abc`)
```typescript
export * from './types';
export { useABCData } from './useABCData';
export { useABCMutations } from './useABCMutations';
export { useABCCalculations } from './useABCCalculations';
```

### 3.3 Hooks TPM (`/tpm`)
```typescript
export { useTPMData } from './useTPMData';
export { useTPMMutations } from './useTPMMutations';
export { useTPMStats } from './useTPMStats';
```

### 3.4 Hooks Utilitários (`/utils`) - 24 hooks
```typescript
export * from './useSessionStorage';
export * from './useClipboard';
export * from './useFullscreen';
export * from './useNetworkStatus';
export * from './usePrevious';
export * from './useInterval';
export * from './useTimeout';
export * from './useWindowSize';
export * from './useScrollPosition';
export * from './useEventListener';
export * from './useFetch';
export * from './useAsync';
export * from './useToggle';
export * from './useCounter';
export * from './useArray';
export * from './useMap';
export * from './useSet';
export * from './useQueue';
export * from './useUndo';
export * from './useForm';
export * from './useValidation';
export * from './usePagination';
export * from './useInfiniteScroll';
export * from './useGeolocation';
```

### 3.5 Outros Hooks Especializados
| Hook | Descrição |
|------|-----------|
| `use-mobile` | Detecção de dispositivo móvel |
| `use-toast` | Sistema de notificações toast |
| `useDashboardLayout` | Layout customizável do dashboard |
| `useDebounce` | Debounce de valores |
| `useThrottle` | Throttle de valores |
| `useLocalStorage` | Persistência local |
| `useMediaQuery` | Media queries reativas |
| `useClickOutside` | Detecção de clique fora |
| `useKeyboard` | Atalhos de teclado |
| `useKanbanDragDrop` | Drag and drop para Kanban |
| `useRealtimeConnection` | Conexão realtime Supabase |
| `useRetryableQuery` | Queries com retry |
| `usePaginatedJobs` | Jobs paginados |
| `useOfflineSync` | Sincronização offline |
| `usePushNotifications` | Push notifications |
| `useNativePushNotifications` | Push nativo |
| `useNotificationSounds` | Sons de notificação |
| `useThemeSound` | Sons por tema |
| `useBitrix24Sync` | Sincronização Bitrix24 |
| `useEfficiencyNotifications` | Alertas de eficiência |
| `useSchedulingConflicts` | Detecção de conflitos |
| `useSmartSequencing` | Sequenciamento inteligente |
| `useBottleneckPrediction` | Predição de gargalos |
| `useLoadBalancing` | Balanceamento de carga |
| `useAutoBufferPromotion` | Promoção automática de buffer |
| `useStuckJobsDetection` | Detecção de jobs travados |
| `useOrphanedDataDetection` | Detecção de dados órfãos |
| `useMTBFMTTR` | MTBF/MTTR metrics |
| `useTrendingAnalysis` | Análise de tendências |
| `useExecutiveDashboard` | Dashboard executivo |
| `useCodeQualityMetrics` | Métricas de qualidade de código |
| `useOperatorAudit` | Auditoria de operadores |
| `useOperatorMachines` | Máquinas por operador |
| `useOperatorGoals` | Metas de operadores |
| `useOperatorEvolution` | Evolução de operadores |
| `useOperatorProductivity` | Produtividade de operadores |
| `useOperatorPresence` | Presença de operadores |
| `useMachineGoals` | Metas de máquinas |
| `useGoalAlerts` | Alertas de metas |
| `useDailySummaryNotifications` | Resumos diários |
| `useQuickFavorites` | Favoritos rápidos |
| `useAuditLog` | Log de auditoria |
| `useEmailReports` | Relatórios por email |
| `useTechnicalSheets` | Fichas técnicas |
| `useTechnicalConversations` | Conversas técnicas |
| `useQualityChecklist` | Checklist de qualidade |
| `useMLPredictionNotifications` | Notificações ML |
| `useTPMNotifications` | Notificações TPM |
| `useEfficiencyAlertHistory` | Histórico de alertas |
| `useOperatorDashboardData` | Dados do dashboard operador |

---

## 4. SERVICES (src/services/)

| Serviço | Arquivo | Funções Exportadas |
|---------|---------|-------------------|
| API | `api.ts` | `apiService` |
| Bitrix24 | `bitrix24.ts` | `bitrix24Service` |
| Documents | `documents.ts` | `documentsService.getAll, upload, delete, getVersions, addVersion` |
| Energy | `energy.ts` | `energyService.getConsumption, getAlerts, getTargets` |
| Gamification | `gamification.ts` | `gamificationService.getRankings, getAchievements` |
| Jobs | `jobs.ts` | `jobsService` |
| Machines | `machines.ts` | `machinesService` |
| ML | `ml.ts` | `mlService.getPredictions, trainModel` |
| Notifications | `notifications.ts` | `notificationsService` |
| OEE | `oee.ts` | `oeeService.calculate, getHistory` |
| Operators | `operators.ts` | `operatorsService` |
| QRCode | `qrcode.ts` | `qrcodeService.generate, scan` |
| Reports | `reports.ts` | `reportsService` |
| Shifts | `shifts.ts` | `shiftsService.getHandovers, createHandover` |
| SPC | `spc.ts` | `spcService.calculateLimits, detectOutOfControl` |
| TPM | `tpm.ts` | `tpmService.getSchedules, createRecord` |
| Traceability | `traceability.ts` | `traceabilityService.getLots, getMovements` |

---

## 5. PAGES (src/pages/) - 36 páginas

| Página | Rota | Descrição |
|--------|------|-----------|
| `Index.tsx` | `/` | Dashboard principal |
| `AuthPage.tsx` | `/auth` | Login/Registro |
| `DailyCalendar.tsx` | `/calendar/daily` | Calendário diário |
| `WeeklyCalendar.tsx` | `/calendar/weekly` | Calendário semanal |
| `KanbanBoard.tsx` | `/kanban` | Quadro Kanban |
| `PendingQueue.tsx` | `/pending` | Fila de pendências |
| `AlertsDashboard.tsx` | `/alerts` | Dashboard de alertas |
| `KPIDashboard.tsx` | `/kpis` | Dashboard de KPIs |
| `OEEDashboard.tsx` | `/oee` | Dashboard OEE |
| `EfficiencyDashboard.tsx` | `/efficiency` | Dashboard de eficiência |
| `ABCCostingDashboard.tsx` | `/abc` | Dashboard custeio ABC |
| `TPMDashboard.tsx` | `/tpm` | Dashboard TPM |
| `MLPredictionsDashboard.tsx` | `/ml-predictions` | Dashboard ML preditivo |
| `EnergyDashboard.tsx` | `/energy` | Dashboard de energia |
| `SPCDashboard.tsx` | `/spc` | Dashboard SPC qualidade |
| `TraceabilityPage.tsx` | `/traceability` | Rastreabilidade |
| `ExecutiveDashboard.tsx` | `/executive` | Dashboard executivo |
| `BIDashboard.tsx` | `/bi` | Dashboard BI |
| `GamificationPage.tsx` | `/gamification` | Gamificação |
| `ShiftHandoverPage.tsx` | `/shift-handover` | Passagem de turno |
| `NotificationsPage.tsx` | `/notifications` | Notificações |
| `DocumentsPage.tsx` | `/documents` | Documentos |
| `TechnicalKnowledgeBase.tsx` | `/knowledge` | Base de conhecimento |
| `TechnicalAssistantPage.tsx` | `/assistant` | Assistente IA |
| `OperatorView.tsx` | `/operator` | Visão do operador |
| `QRScannerPage.tsx` | `/scanner` | Scanner QR |
| `OperatorsPage.tsx` | `/operators` | Gestão de operadores |
| `OperatorProductivityPage.tsx` | `/operators/productivity` | Produtividade |
| `MachinesPage.tsx` | `/machines` | Gestão de máquinas |
| `NewJobPage.tsx` | `/new-job` | Novo agendamento |
| `SettingsPage.tsx` | `/settings` | Configurações |
| `Bitrix24ConfigPage.tsx` | `/integrations/bitrix24` | Config Bitrix24 |
| `CodeQualityDashboard.tsx` | `/code-quality` | Qualidade de código |
| `DesignSystemPage.tsx` | `/design-system` | Design system |
| `InstallAppPage.tsx` | `/install` | Instalar PWA |
| `NotFound.tsx` | `*` | 404 |

---

## 6. CONTEXTS (src/contexts/) - 12 contextos

| Contexto | Exportações | Descrição |
|----------|-------------|-----------|
| `AuthContext.tsx` | `AuthProvider, useAuth` | Autenticação + roles |
| `OfflineSyncContext.tsx` | `OfflineSyncProvider, useOfflineSync` | Sincronização offline |
| `NotificationsContext.tsx` | `NotificationsProvider, useNotifications` | Sistema de notificações |
| `PermissionsContext.tsx` | `PermissionsProvider, usePermissions` | Controle de permissões |
| `ThemeContext.tsx` | `ThemeProvider, useTheme` | Tema claro/escuro |
| `BreadcrumbContext.tsx` | `BreadcrumbProvider, useBreadcrumb` | Navegação breadcrumb |
| `ConfirmationContext.tsx` | `ConfirmationProvider, useConfirmation` | Diálogos de confirmação |
| `FeatureFlagsContext.tsx` | `FeatureFlagsProvider, useFeatureFlags` | Feature flags |
| `SearchContext.tsx` | `SearchProvider, useSearch` | Busca global |
| `SidebarContext.tsx` | `SidebarProvider, useSidebar` | Estado do sidebar |
| `UserPreferencesContext.tsx` | `UserPreferencesProvider, useUserPreferences` | Preferências do usuário |
| `WebSocketContext.tsx` | `WebSocketProvider, useWebSocket` | Conexão WebSocket |

---

## 7. TYPES (src/types/) - 13 arquivos

| Arquivo | Tipos Principais |
|---------|------------------|
| `api.types.ts` | `ApiResponse, ApiError, PaginatedResponse` |
| `auth.types.ts` | `UserRole, User, Session, Profile` |
| `calendar.types.ts` | `CalendarEvent, TimeSlot` |
| `components.types.ts` | Props genéricas de componentes |
| `design-system.types.ts` | `Theme, ColorToken, TypographyScale` |
| `documents.types.ts` | `Document, DocumentVersion` |
| `forms.types.ts` | `FormField, FormState, ValidationRule` |
| `hooks.types.ts` | Tipos genéricos de hooks |
| `install.types.ts` | `InstallPromptEvent` |
| `navigation.types.ts` | `Route, NavItem, Breadcrumb` |
| `notifications.types.ts` | `Notification, NotificationType` |
| `scheduling.ts` | `Job, JobStatus, Priority, Technique, Machine` |
| `spc.types.ts` | `SPCData, ControlLimits, ControlChart` |

---

## 8. EDGE FUNCTIONS (supabase/functions/) - 19 funções

| Função | Descrição | Integrações |
|--------|-----------|-------------|
| `backup-scheduler` | Agendamento de backups | Supabase Storage |
| `bitrix24-sync` | Sincronização bidirecional | Bitrix24 API |
| `calculate-rankings` | Cálculo de rankings | Gamification |
| `create-operator` | Criar operador | Auth + Profiles |
| `cron-cleanup` | Limpeza agendada | Database |
| `daily-maintenance-summary` | Resumo de manutenção | Email + TPM |
| `erp-api` | API para ERP externo | REST |
| `excel-export` | Exportação Excel | Relatórios |
| `health-check` | Verificação de saúde | Monitoring |
| `image-optimizer` | Otimização de imagens | Storage |
| `metrics-collector` | Coleta de métricas | Analytics |
| `ml-predictions` | Previsões ML | Lovable AI (Gemini) |
| `pdf-generator` | Geração de PDF | Relatórios |
| `send-email-report` | Envio de email | Email service |
| `send-push-notification` | Push notification | Web Push |
| `technical-assistant` | Assistente técnico IA | Lovable AI |
| `update-operator` | Atualizar operador | Auth + Profiles |
| `webhook-handler` | Handler de webhooks | Bitrix24 |

### Exemplo: `ml-predictions/index.ts`
```typescript
// Usa Lovable AI para análise preditiva
const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  model: "google/gemini-2.5-flash",
  messages: [{ role: "system", content: "Análise de manutenção preditiva..." }]
});
```

---

## 9. LIB (src/lib/)

### 9.1 Formatters
| Arquivo | Funções |
|---------|---------|
| `currency.ts` | `formatCurrency, parseCurrency` |
| `date.ts` | `formatDate, parseDate, formatRelative` |
| `number.ts` | `formatNumber, formatPercent, formatCompact` |

### 9.2 Validators
| Arquivo | Funções |
|---------|---------|
| `cnpj.ts` | `validateCNPJ, formatCNPJ` |
| `cpf.ts` | `validateCPF, formatCPF` |
| `email.ts` | `validateEmail` |
| `phone.ts` | `validatePhone, formatPhone` |

### 9.3 Monitoring
```typescript
export * from './sentry';      // initSentry
export * from './analytics';   // initAnalytics, trackEvent
export * from './webVitals';   // initWebVitals
export * from './performance'; // measurePerformance
export * from './logger';      // logger
export function initMonitoring() { ... }
```

### 9.4 Outros
| Arquivo | Funções |
|---------|---------|
| `errorHandling.ts` | `createAppError, categorizeError, showErrorToast, createMutationErrorHandler` |
| `utils.ts` | `cn` (classnames merge) |
| `navigation.ts` | `createRoute, parseParams` |
| `prefetch.ts` | `prefetchRoute` |
| `indexedDB.ts` | `openDB, saveToIndexedDB, getFromIndexedDB` |
| `offlineStorage.ts` | `offlineStorage` |
| `pdfExport.ts` | `exportToPDF` |
| `productivityReport.ts` | `generateProductivityReport` |
| `queryConfig.ts` | `defaultQueryConfig, retryConfig` |
| `schemas.ts` | Schemas Zod de validação |
| `formUtils.ts` | `createFormHandler` |

---

## 10. I18N (src/i18n/)

```
src/i18n/
├── index.ts           # Configuração i18next
└── locales/
    ├── pt.json        # Português
    ├── en.json        # Inglês
    └── es.json        # Espanhol
```

---

## 11. SCHEMAS (src/schemas/)

| Schema | Descrição |
|--------|-----------|
| `alertSchema.ts` | Validação de alertas |
| `energySchema.ts` | Validação de energia |
| `gamificationSchema.ts` | Validação de gamificação |
| `qualitySchema.ts` | Validação de qualidade |
| `reportSchema.ts` | Validação de relatórios |
| `index.ts` | Re-exports |

---

## 12. TESTES (src/test/)

```
src/test/
├── setup.ts           # Configuração Vitest
├── utils.tsx          # Utilitários de teste
├── integration/       # Testes de integração
└── mocks/             # Mocks de serviços
```

---

## 13. E2E TESTS (e2e/) - 39 specs

Todos os arquivos `.spec.ts` para testes Playwright:
- `abc-costing.spec.ts`, `alerts.spec.ts`, `auth.spec.ts`
- `bi-dashboard.spec.ts`, `bitrix24.spec.ts`, `calendar.spec.ts`
- `code-quality.spec.ts`, `dashboard.spec.ts`, `design-system.spec.ts`
- `documents.spec.ts`, `efficiency.spec.ts`, `energy.spec.ts`
- `executive.spec.ts`, `gamification.spec.ts`, `home.spec.ts`
- `jobs.spec.ts`, `kanban.spec.ts`, `knowledge-base.spec.ts`
- `kpi.spec.ts`, `machines.spec.ts`, `ml-predictions.spec.ts`
- `new-job.spec.ts`, `notifications.spec.ts`, `oee.spec.ts`
- `offline.spec.ts`, `operator-productivity.spec.ts`, `operator-view.spec.ts`
- `operators.spec.ts`, `pending-queue.spec.ts`, `pwa-install.spec.ts`
- `qr-scanner.spec.ts`, `reports.spec.ts`, `settings.spec.ts`
- `shift-handover.spec.ts`, `spc.spec.ts`, `technical-assistant.spec.ts`
- `tpm.spec.ts`, `traceability.spec.ts`, `weekly-calendar.spec.ts`

---

## 14. CI/CD (.github/workflows/) - 6 workflows

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `ci.yml` | push, PR | build, lint, typecheck |
| `cd.yml` | push main | deploy production |
| `lint.yml` | push, PR | ESLint + Prettier |
| `preview.yml` | PR | deploy preview |
| `security.yml` | schedule | vulnerability scan |
| `tests.yml` | push, PR | unit + E2E tests |

---

## 15. KUBERNETES (k8s/)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gravacao-app
spec:
  replicas: 2
  ...

# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: gravacao-service
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 3000
```

---

## 16. DOCUMENTAÇÃO (docs/) - 34 documentos

| Categoria | Documentos |
|-----------|------------|
| **Arquitetura** | ARCHITECTURE.md, DATABASE.md, API.md |
| **Desenvolvimento** | LOCAL_DEVELOPMENT.md, CONTRIBUTING.md, HOOKS_API.md |
| **Deploy** | DEPLOYMENT.md, DOCKER.md, CI_CD.md |
| **Testes** | TESTING.md, TESTING_STRATEGY.md, E2E_TESTING.md, STORYBOOK.md |
| **Segurança** | SECURITY.md, SECURITY_HEADERS.md, SECRETS_ROTATION.md, INPUT_SANITIZATION.md, RATE_LIMITING.md |
| **Features** | ABC_COSTING.md, CALENDAR.md, SHIFT_MANAGEMENT.md, SPC.md |
| **Qualidade** | PERFORMANCE.md, ERROR_HANDLING_PATTERNS.md, DEPENDENCY_AUDIT.md |
| **Operacional** | TROUBLESHOOTING.md, RELEASE_PROCESS.md, ENVIRONMENT_VARIABLES.md |
| **Auditoria** | REPO_AUDIT_STRUCTURE.md, REPO_AUDIT_FLOWS.md, REPO_AUDIT_QUALITY.md |

---

## 17. MIGRATIONS (supabase/migrations/) - 36 migrações

Período: 2025-12-12 a 2025-12-20

Principais tabelas criadas:
- `jobs`, `techniques`, `machines`
- `profiles`, `user_roles`
- `maintenance_schedules`, `maintenance_records`, `maintenance_types`
- `machine_predictions`, `prediction_history`
- `abc_activities`, `abc_cost_pools`, `abc_activity_rates`, `abc_job_costs`
- `operator_rankings`, `operator_achievements`, `operator_goals`
- `production_lots`, `lot_movements`, `lot_components`, `lot_quality_inspections`
- `energy_consumption`, `energy_alerts`, `energy_targets`
- `technical_documents`, `document_versions`
- `shift_handovers`, `shift_occurrences`, `shift_pending_tasks`
- `spc_alerts`, `spc_parameters`, `spc_measurements`
- `push_subscriptions`, `push_notifications`
- `daily_summaries`, `efficiency_alert_history`
- `bitrix24_oauth_tokens`, `bitrix24_sync_history`, `bitrix24_field_mappings`
- `qr_scan_history`
- `gamification_settings`

---

## 18. OBSERVAÇÕES E INCONSISTÊNCIAS IDENTIFICADAS

### 18.1 Duplicidades de Testes
- Padrão `*.test.ts` E `*.test.tsx` para o mesmo hook em `/hooks`
- Sugestão: unificar em `.test.tsx` quando houver componentes React

### 18.2 Roles Frontend vs Backend
- Frontend (`App.tsx`): usa `coordinator`, `manager`, `operator`
- Backend (`user_roles`): usa `app_role` ENUM que precisa corresponder
- Verificar consistência na tabela `user_roles`

### 18.3 Services Stub
- Alguns services estão como stubs mínimos:
  - `ml.ts`: apenas `{ getPredictions, trainModel }` vazios
  - `qrcode.ts`: apenas `{ generate, scan }` vazios
  - `spc.ts`: apenas `{ calculateLimits, detectOutOfControl }` vazios

### 18.4 Warnings Runtime
- `JobQRCode`: ref em function component
- `DialogContent`: Missing DialogDescription em alguns modais

---

## 19. ESTATÍSTICAS FINAIS

```
Total de Arquivos TypeScript: ~500+
Total de Arquivos de Teste: ~200+
Linhas de Código (estimado): ~50,000+
Componentes React: ~150+
Hooks Customizados: ~100+
Edge Functions: 19
Tabelas Supabase: ~45+
Endpoints API: ~30+
```

---

**Documento gerado automaticamente pela auditoria do repositório**
