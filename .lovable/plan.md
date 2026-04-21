

## Documento de Gaps de UI — Fast Gravações

Vou gerar **um único arquivo** `/mnt/documents/GAPS_UI_FAST_GRAVACOES.md` (~400 linhas) listando funcionalidades existentes em código mas **sem interface visual completa**.

### Conteúdo do documento

**1. Resumo Executivo**
- Total de hooks: 100+
- Hooks consumidos por UI: ~93
- Hooks órfãos / parcialmente expostos: ~12
- Camada de Services criada mas **não consumida** (10 services)

**2. Hooks Órfãos (sem nenhum componente consumindo)**
| Hook | Funcionalidade | UI Atual | Gap |
|---|---|---|---|
| `useDataImport` | Importação CSV/Excel | nenhuma | Wizard de import faltante |
| `useRecordDuplication` | Duplicar registros genéricos | nenhuma | Botão duplicar em lots/inspeções |
| `useVersionHistory` | Versionamento de documentos | parcial | Timeline visual ausente |
| `useBulkActions` | Ações em massa | nenhuma | Toolbar de seleção múltipla |
| `useOperatorRankings` | Ranking detalhado | só GamificationPage | Dashboard de pódio dedicado |
| `useSavedFilters` | Filtros salvos/favoritos | nenhuma | Sidebar de filtros salvos |
| `useABCCalculations` | Cálculos ABC avançados | parcial | Drill-down por activity rate |

**3. Hooks Parcialmente Expostos** (existe UI básica mas falta funcionalidade)
- `useStuckJobsDetection` — só card em /alerts, falta página dedicada com resolução
- `useOrphanedDataDetection` — só badge, falta painel de saneamento
- `useGoalAlerts` — widget pequeno, falta inbox completo
- `useExecutiveDashboard` — KPIs ok, falta export comparativo período-a-período
- `useMTBFMTTR` — calculado mas não exibido em dashboard próprio
- `useTraceability` — página existe mas falta árvore Forward/Backward
- `useShiftHandover` — modais ok, falta histórico timeline anual
- `useABCCosts` — drill-down até job mas falta what-if de rate

**4. Services Layer Não Consumida (10 arquivos, 0 consumidores)**
- `JobsService`, `MachinesService`, `OperatorsService`, `MaintenanceService`, `NotificationsService`, `AuthService`, `EnergyService`, `TraceabilityService`, `ReportsService`, `IntegrationsService`
- Componentes acessam Supabase direto via hooks → camada service ficou redundante
- **Recomendação**: ou refatorar hooks para usar services, ou remover services

**5. Edge Functions sem UI de monitoramento**
- `cleanup-security-logs`, `rate-limit-check`, `security-alert`, `validate-login-ip` — rodam em background sem dashboard
- `calculate-rankings` — sem trigger manual na UI
- `bitrix24-sync` — UI de config existe (`/integrations/bitrix24`) mas falta dashboard de execuções/erros

**6. Funcionalidades de DB sem UI**
- `audit_log` (recém-criada) — UI de leitura ok, falta verificador manual de chain integrity acionável
- `efficiency_alert_history` — gravado, sem leitura visual
- `operator_status_audit` — gravado, exibido só em modal pequeno
- `daily_summaries` — calculado, sem página de relatório diário

**7. Componentes em `design-system/hooks/*Demos.tsx`**
- 8 demos interativas existem só na página `/design-system`
- Servem como showcase, não como produto final

**8. Recomendações Prioritárias**
- **P0**: Remover ou consumir Services Layer (débito técnico)
- **P1**: Criar página `/data-quality` consumindo `useStuckJobsDetection` + `useOrphanedDataDetection`
- **P1**: Wizard de import genérico (`useDataImport`)
- **P2**: Toolbar de bulk actions no Kanban (`useBulkActions`)
- **P2**: Timeline de versões em `/documents` (`useVersionHistory`)
- **P3**: Dashboard de saved filters globais

**9. Sumário Final**
- Tabela final: feature × estado (✅ completa / ⚠️ parcial / ❌ sem UI)
- Esforço estimado em horas para cada gap

### Geração

Comando único `cat > /mnt/documents/GAPS_UI_FAST_GRAVACOES.md` + emissão de `<lov-artifact>` para download. Nenhum arquivo do codebase será alterado.

