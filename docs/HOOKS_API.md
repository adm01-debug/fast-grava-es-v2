# API de Hooks - Documentação Técnica

Este documento descreve a API dos principais hooks do sistema de agendamento de produção.

---

## Índice

1. [Dados de Agendamento](#1-dados-de-agendamento)
2. [Eficiência Operacional](#2-eficiência-operacional)
3. [Operadores](#3-operadores)
4. [Manutenção (TPM)](#4-manutenção-tpm)
5. [Custos (ABC)](#5-custos-abc)
6. [Predições ML](#6-predições-ml)
7. [Conhecimento Técnico](#7-conhecimento-técnico)
8. [Utilitários](#8-utilitários)

---

## 1. Dados de Agendamento

### useSchedulingData

Hook centralizado para dados de agendamento com real-time.

```typescript
import { useSchedulingData } from '@/hooks/useSchedulingData';

const {
  jobs,           // Job[] - Lista de jobs
  techniques,     // Technique[] - Lista de técnicas
  machines,       // Machine[] - Lista de máquinas
  isLoading,      // boolean - Estado de carregamento
  stats,          // SchedulingStats - Estatísticas calculadas
} = useSchedulingData();
```

**Stats Retornadas:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `totalJobs` | `number` | Total de jobs |
| `pendingJobs` | `number` | Jobs na fila |
| `inProgressJobs` | `number` | Jobs em produção |
| `completedToday` | `number` | Finalizados hoje |
| `delayedJobs` | `number` | Jobs atrasados |

---

### useJobs

Hook para operações CRUD de jobs.

```typescript
import { useJobs } from '@/hooks/useJobs';

const {
  data,           // Job[] | undefined
  isLoading,      // boolean
  error,          // Error | null
  createJob,      // (job: JobInput) => Promise<void>
  updateJob,      // (id: string, updates: Partial<Job>) => Promise<void>
  deleteJob,      // (id: string) => Promise<void>
} = useJobs();
```

**Interface Job:**
```typescript
interface Job {
  id: string;
  order_number: string;
  client: string;
  product: string;
  technique_id: string;
  machine_id: string | null;
  status: 'queue' | 'ready' | 'scheduled' | 'production' | 'finished' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduled_date: string | null;
  start_time: string | null;
  end_time: string | null;
  estimated_duration: number;
  quantity: number;
  produced_quantity: number | null;
  lost_pieces: number | null;
  gravure_color: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

---

### usePaginatedJobs

Hook para jobs com paginação e filtros.

```typescript
import { usePaginatedJobs } from '@/hooks/usePaginatedJobs';

const {
  data,           // PaginatedResult<Job>
  isLoading,      // boolean
  page,           // number - Página atual
  pageSize,       // number - Itens por página
  totalPages,     // number - Total de páginas
  goToPage,       // (page: number) => void
  nextPage,       // () => void
  previousPage,   // () => void
  hasNextPage,    // boolean
  hasPreviousPage,// boolean
} = usePaginatedJobs({
  initialPage: 1,
  pageSize: 20,
  filters: {
    status: 'scheduled',
    technique: 'tech-1',
    machine: 'machine-1',
    search: 'cliente',
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31',
  },
});
```

---

## 2. Eficiência Operacional

### useLoadBalancingWithActions

Análise de balanceamento de carga com ações de redistribuição.

```typescript
import { useLoadBalancingWithActions } from '@/hooks/useLoadBalancingWithActions';

const {
  byTechnique,          // TechniqueSummary[] - Resumo por técnica
  suggestions,          // LoadBalancingSuggestion[] - Sugestões
  isLoading,            // boolean
  isApplying,           // boolean - Aplicando sugestão
  applySuggestion,      // (suggestion) => Promise<void>
  applyAllForTechnique, // (techniqueId) => Promise<void>
  applyAllSuggestions,  // () => Promise<void>
} = useLoadBalancingWithActions(targetDate?: Date);
```

**Interface LoadBalancingSuggestion:**
```typescript
interface LoadBalancingSuggestion {
  id: string;
  jobId: string;
  jobOrderNumber: string;
  fromMachine: { id: string; name: string; code: string };
  toMachine: { id: string; name: string; code: string };
  techniqueId: string;
  techniqueName: string;
  loadDifference: number;
  reason: string;
}
```

---

### useSmartSequencingWithActions

Otimização de sequenciamento por cor/material.

```typescript
import { useSmartSequencingWithActions } from '@/hooks/useSmartSequencingWithActions';

const {
  suggestions,          // SequencingSuggestion[] - Sugestões
  totalSavings,         // number - Economia total (minutos)
  hasSuggestions,       // boolean
  isApplying,           // boolean
  applySequencing,      // (suggestion) => Promise<void>
  applyAllSequencing,   // () => Promise<void>
} = useSmartSequencingWithActions();
```

**Interface SequencingSuggestion:**
```typescript
interface SequencingSuggestion {
  id: string;
  machineId: string;
  machineName: string;
  machineCode: string;
  techniqueId: string;
  techniqueName: string;
  currentSequence: Job[];
  optimizedSequence: Job[];
  estimatedSavings: number;
  colorGroups: ColorGroup[];
}
```

---

### useBottleneckPrediction

Previsão de gargalos por técnica.

```typescript
import { useBottleneckPrediction } from '@/hooks/useBottleneckPrediction';

const {
  predictions,    // BottleneckPrediction[] - Previsões
  isLoading,      // boolean
  hasBottlenecks, // boolean
  criticalCount,  // number - Gargalos críticos
} = useBottleneckPrediction();
```

**Interface BottleneckPrediction:**
```typescript
interface BottleneckPrediction {
  techniqueId: string;
  techniqueName: string;
  currentCapacity: number;      // Capacidade atual (%)
  projectedCapacity: number;    // Capacidade projetada (%)
  pendingJobs: number;
  availableMachines: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}
```

---

### useAutoBufferPromotion

Promoção automática de buffer (3 jobs prontos por técnica).

```typescript
import { useAutoBufferPromotion } from '@/hooks/useAutoBufferPromotion';

const {
  bufferStatus,       // BufferStatus[] - Status por técnica
  isPromoting,        // boolean
  promoteForTechnique,// (techniqueId) => Promise<void>
  promoteAll,         // () => Promise<void>
} = useAutoBufferPromotion();
```

---

### useKPIs

Indicadores chave de performance.

```typescript
import { useKPIs } from '@/hooks/useKPIs';

const { data } = useKPIs(jobs, machines, techniques);
```

**Retorno:**
```typescript
interface KPIData {
  totalJobs: number;
  completedJobs: number;
  completedPieces: number;
  lostPieces: number;
  lossRate: number;              // Percentual
  averageProductionTime: number; // Minutos
  occupancyRate: number;         // Percentual
  delayRate: number;             // Percentual
  machineStats: MachineStats[];
}
```

---

### useOEE

Overall Equipment Effectiveness.

```typescript
import { useOEE } from '@/hooks/useOEE';

const { data } = useOEE(jobs, machines, techniques);
```

**Retorno:**
```typescript
interface OEEData {
  overall: {
    oee: number;          // 0-100
    availability: number; // 0-100
    performance: number;  // 0-100
    quality: number;      // 0-100
  };
  byMachine: MachineOEE[];
  byTechnique: TechniqueOEE[];
  trend: OEETrendPoint[];
}
```

---

## 3. Operadores

### useOperators

Gestão de operadores.

```typescript
import { useOperators } from '@/hooks/useOperators';

const {
  data,           // OperatorWithProfile[]
  isLoading,      // boolean
  removeOperator, // (operatorId) => Promise<void>
  toggleActive,   // (operatorId, isActive) => Promise<void>
  isRemoving,     // boolean
  isToggling,     // boolean
} = useOperators();
```

---

### useOperatorMachines

Atribuição de máquinas a operadores.

```typescript
import { useOperatorMachines } from '@/hooks/useOperatorMachines';

const {
  data,           // OperatorMachine[]
  isLoading,      // boolean
  assignMachine,  // (operatorId, machineId) => Promise<void>
  unassignMachine,// (operatorId, machineId) => Promise<void>
} = useOperatorMachines(operatorId?: string);
```

---

### useOperatorGoals

Metas de operadores.

```typescript
import { useOperatorGoals } from '@/hooks/useOperatorGoals';

const {
  goals,          // OperatorGoal[]
  isLoading,      // boolean
  createGoal,     // (goal: GoalInput) => Promise<void>
  updateGoal,     // (id, updates) => Promise<void>
  deleteGoal,     // (id) => Promise<void>
} = useOperatorGoals(operatorId?: string);
```

---

### useOperatorProductivity

Métricas de produtividade.

```typescript
import { useOperatorProductivity } from '@/hooks/useOperatorProductivity';

const {
  data,           // ProductivityData
  isLoading,      // boolean
} = useOperatorProductivity(operatorId, period: '7d' | '30d' | '90d' | 'all');
```

---

## 4. Manutenção (TPM)

### useTPMData

Dados de manutenção produtiva total.

```typescript
import { useTPMData } from '@/hooks/tpm';

const {
  schedules,      // MaintenanceSchedule[]
  records,        // MaintenanceRecord[]
  types,          // MaintenanceType[]
  alerts,         // MaintenanceAlert[]
  checklists,     // MaintenanceChecklist[]
  machines,       // Machine[]
  isLoading,      // boolean
} = useTPMData();
```

---

### useTPMMutations

Operações de manutenção.

```typescript
import { useTPMMutations } from '@/hooks/tpm';

const {
  createSchedule,     // (schedule) => Promise<void>
  updateSchedule,     // (id, updates) => Promise<void>
  deleteSchedule,     // (id) => Promise<void>
  createRecord,       // (record) => Promise<void>
  completeRecord,     // (id, data) => Promise<void>
  resolveAlert,       // (alertId) => Promise<void>
} = useTPMMutations();
```

---

### useMTBFMTTR

Métricas de confiabilidade.

```typescript
import { useMTBFMTTR } from '@/hooks/useMTBFMTTR';

const {
  data,           // MTBFMTTRData
  isLoading,      // boolean
} = useMTBFMTTR();
```

**Retorno:**
```typescript
interface MTBFMTTRData {
  byMachine: {
    machineId: string;
    machineName: string;
    mtbf: number;         // Mean Time Between Failures (horas)
    mttr: number;         // Mean Time To Repair (horas)
    availability: number; // Percentual
    failureCount: number;
  }[];
  overall: {
    avgMTBF: number;
    avgMTTR: number;
    avgAvailability: number;
    totalFailures: number;
  };
}
```

---

## 5. Custos (ABC)

### useABCData

Dados de custeio baseado em atividades.

```typescript
import { useABCData } from '@/hooks/abc';

const {
  activities,     // ABCActivity[]
  costPools,      // ABCCostPool[]
  activityRates,  // ABCActivityRate[]
  jobCosts,       // ABCJobCost[]
  jobs,           // Job[]
  isLoading,      // boolean
} = useABCData();
```

---

### useABCCalculations

Cálculos de custeio.

```typescript
import { useABCCalculations } from '@/hooks/abc';

const {
  costByTechnique,    // TechniqueCost[]
  costByJob,          // JobCost[]
  totalCosts,         // number
  averageUnitCost,    // number
} = useABCCalculations(activities, costPools, activityRates, jobCosts, jobs);
```

---

### useABCMutations

Operações de custeio.

```typescript
import { useABCMutations } from '@/hooks/abc';

const {
  createActivity,     // (activity) => Promise<void>
  updateActivity,     // (id, updates) => Promise<void>
  deleteActivity,     // (id) => Promise<void>
  createCostPool,     // (pool) => Promise<void>
  calculateJobCosts,  // (jobId) => Promise<void>
  calculateAllCosts,  // () => Promise<void>
} = useABCMutations();
```

---

## 6. Predições ML

### useMLPredictions

Predições de falha com machine learning.

```typescript
import { useMLPredictions } from '@/hooks/useMLPredictions';

const {
  predictions,          // MachinePrediction[]
  predictionHistory,    // PredictionHistory[]
  machines,             // Machine[]
  isLoading,            // boolean
  stats,                // PredictionStats
  generatePredictions,  // () => Promise<void>
  acknowledgePrediction,// (id) => Promise<void>
  getRiskLevel,         // (score) => { label, color }
} = useMLPredictions();
```

**Interface MachinePrediction:**
```typescript
interface MachinePrediction {
  id: string;
  machine_id: string;
  risk_score: number;           // 0-100
  confidence: number;           // 0-100
  prediction_type: string;
  predicted_failure_date: string | null;
  factors: PredictionFactor[];
  recommendations: string[];
  is_active: boolean;
  acknowledged_at: string | null;
}
```

---

## 7. Conhecimento Técnico

### useTechnicalSheets

Fichas técnicas de procedimentos.

```typescript
import { useTechnicalSheets } from '@/hooks/useTechnicalSheets';

const {
  sheets,         // TechnicalSheet[]
  categories,     // ProductCategory[]
  materials,      // Material[]
  isLoading,      // boolean
} = useTechnicalSheets();
```

---

### useTechnicalSheetDetails

Detalhes de uma ficha técnica.

```typescript
import { useTechnicalSheetDetails } from '@/hooks/useTechnicalSheets';

const {
  sheet,          // TechnicalSheet | null
  steps,          // TechnicalSheetStep[]
  materials,      // TechnicalSheetMaterial[]
  tips,           // TechnicalSheetTip[]
  isLoading,      // boolean
} = useTechnicalSheetDetails(sheetId: string);
```

---

### useTechnicalConversations

Conversas com assistente técnico.

```typescript
import { useTechnicalConversations } from '@/hooks/useTechnicalConversations';

const {
  conversations,      // TechnicalConversation[]
  isLoading,          // boolean
  createConversation, // () => Promise<string>
  deleteConversation, // (id) => Promise<void>
  searchConversations,// (query) => TechnicalConversation[]
} = useTechnicalConversations();
```

---

## 8. Utilitários

### useRetryableQuery

Query com retry automático e error handling.

```typescript
import { useRetryableQuery } from '@/hooks/useRetryableQuery';

const {
  data,
  isLoading,
  error,
  appError,           // AppError estruturado
  isRetryable,        // boolean
  isNetworkError,     // boolean
  isAuthError,        // boolean
  manualRetry,        // () => void
  forceRefetch,       // () => Promise<void>
} = useRetryableQuery({
  queryKey: ['exemplo'],
  queryFn: fetchData,
  showErrorToast: true,
  customErrorMessage: 'Erro ao carregar',
  onRetry: (attempt, error) => {},
  onMaxRetriesReached: (error) => {},
});
```

---

### useEfficiencyAlertHistory

Histórico de alertas de eficiência.

```typescript
import { useEfficiencyAlertHistory } from '@/hooks/useEfficiencyAlertHistory';

const {
  alerts,         // EfficiencyAlertHistory[]
  activeAlerts,   // EfficiencyAlertHistory[]
  resolvedAlerts, // EfficiencyAlertHistory[]
  totalCount,     // number
  hasMore,        // boolean
  isLoading,      // boolean
  recordAlert,    // (alert) => Promise<void>
  resolveAlert,   // (id, notes) => Promise<void>
  refetch,        // () => void
} = useEfficiencyAlertHistory(page?: number, pageSize?: number);
```

---

### useNotifications

Notificações do sistema.

```typescript
import { useNotifications } from '@/hooks/useNotifications';

const {
  delayedJobs,        // Job[]
  lowBufferTechniques,// Technique[]
  hasNotifications,   // boolean
  notificationCount,  // number
} = useNotifications();
```

---

### usePushNotifications

Push notifications do navegador.

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications';

const {
  isSupported,        // boolean
  isEnabled,          // boolean
  permission,         // NotificationPermission
  requestPermission,  // () => Promise<void>
  sendNotification,   // (title, options) => void
} = usePushNotifications();
```

---

### useQuickFavorites

Favoritos rápidos do usuário.

```typescript
import { useQuickFavorites } from '@/hooks/useQuickFavorites';

const {
  favorites,          // QuickFavorite[]
  isLoading,          // boolean
  addFavorite,        // (favorite) => void
  removeFavorite,     // (id) => void
  reorderFavorites,   // (favorites) => void
  resetToDefaults,    // () => void
} = useQuickFavorites();
```

---

### useDashboardLayout

Layout customizável do dashboard.

```typescript
import { useDashboardLayout } from '@/hooks/useDashboardLayout';

const {
  layout,             // WidgetConfig[]
  isEditMode,         // boolean
  setEditMode,        // (mode) => void
  updateLayout,       // (layout) => void
  toggleWidget,       // (widgetId) => void
  resetLayout,        // () => void
} = useDashboardLayout();
```

---

## Padrões de Uso

### Composição de Hooks

```typescript
// Exemplo: Dashboard completo
function ProductionDashboard() {
  const { jobs, machines, techniques, isLoading } = useSchedulingData();
  const { data: kpis } = useKPIs(jobs, machines, techniques);
  const { predictions } = useBottleneckPrediction();
  const { suggestions } = useLoadBalancingWithActions();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <KPICards data={kpis} />
      <BottleneckAlerts predictions={predictions} />
      <LoadBalancingSuggestions suggestions={suggestions} />
    </div>
  );
}
```

### Error Handling

```typescript
import { showErrorToast, createAppError } from '@/lib/errorHandling';

try {
  await mutation.mutateAsync(data);
} catch (error) {
  const appError = createAppError(error);
  if (appError.retryable) {
    // Pode tentar novamente
  }
  showErrorToast(error, 'Contexto da operação');
}
```

### Real-time Updates

```typescript
// Hooks com real-time já configurado:
// - useSchedulingData
// - useEfficiencyAlertHistory
// - useTechnicalSheets
// - useTechnicalConversations
// - useOperatorGoals
// - useOperatorMachines

// Não é necessário configurar subscriptions manualmente
```

---

## Referências

- [Error Handling Patterns](./ERROR_HANDLING_PATTERNS.md)
- [Supabase Types](../src/integrations/supabase/types.ts)
- [Query Config](../src/lib/queryConfig.ts)
