# 📋 FAST GRAVA ES — Levantamento Exaustivo de Funcionalidades

> **Documento compilado a partir de todas as sessões de desenvolvimento**
> Última atualização: 15/03/2026 | Status: ✅ 100% Implementado

---

## 📑 SUMÁRIO

1. [Módulo Dashboard](#1-módulo-dashboard)
2. [Módulo Calendário de Produção](#2-módulo-calendário-de-produção)
3. [Módulo Kanban](#3-módulo-kanban)
4. [Módulo Gestão de Jobs](#4-módulo-gestão-de-jobs)
5. [Módulo Gestão de Operadores](#5-módulo-gestão-de-operadores)
6. [Módulo Gestão de Máquinas](#6-módulo-gestão-de-máquinas)
7. [Módulo OEE](#7-módulo-oee)
8. [Módulo ABC Costing](#8-módulo-abc-costing)
9. [Módulo TPM](#9-módulo-tpm)
10. [Módulo SPC](#10-módulo-spc)
11. [Módulo BI / Analytics](#11-módulo-bi--analytics)
12. [Módulo Assistente Técnico IA](#12-módulo-assistente-técnico-ia)
13. [Módulo Base de Conhecimento](#13-módulo-base-de-conhecimento)
14. [Módulo Notificações](#14-módulo-notificações)
15. [Módulo Autenticação e Segurança](#15-módulo-autenticação-e-segurança)
16. [Módulo Configurações](#16-módulo-configurações)
17. [Módulo Integrações](#17-módulo-integrações)
18. [Módulo Offline / PWA](#18-módulo-offline--pwa)
19. [Módulo CRUD Avançado](#19-módulo-crud-avançado)
20. [Módulo Relatórios](#20-módulo-relatórios)
21. [Módulo Rastreabilidade](#21-módulo-rastreabilidade)
22. [Módulo Gamificação](#22-módulo-gamificação)
23. [Módulo ML / Predições](#23-módulo-ml--predições)
24. [Módulo Energia](#24-módulo-energia)
25. [Módulo Documentos](#25-módulo-documentos)
26. [Módulo Passagem de Turno](#26-módulo-passagem-de-turno)
27. [Infraestrutura Técnica](#27-infraestrutura-técnica)
28. [Stack Tecnológico](#28-stack-tecnológico)

---

## 1. MÓDULO DASHBOARD

### 1.1 Dashboard Principal (`/`)
**Página:** `src/pages/Index.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Widgets Draggable | Arrastar e reorganizar widgets via drag-and-drop com persistência em localStorage | ✅ |
| 2 | Gráfico de Ocupação | Visualizar ocupação de máquinas em tempo real (OccupancyChart) | ✅ |
| 3 | Tabela Jobs Recentes | Listar últimos jobs processados (RecentJobsTable) | ✅ |
| 4 | Widget de Alertas | Exibir alertas críticos do sistema (AlertsWidget) | ✅ |
| 5 | Status do Buffer | Monitorar fila de produção (BufferStatusWidget) | ✅ |
| 6 | Identificação de Gargalos | Detectar pontos de atraso (BottleneckWidget) | ✅ |
| 7 | Cards de Estatísticas | KPIs principais: jobs na fila, em produção, finalizados, alertas | ✅ |
| 8 | Atualização em Tempo Real | WebSocket com Supabase Realtime | ✅ |
| 9 | Responsividade | Layout adaptativo mobile/desktop | ✅ |
| 10 | Smart Sequencing Widget | Agrupamento inteligente por cor/material | ✅ |
| 11 | Load Balancing Widget | Redistribuição de carga entre máquinas | ✅ |
| 12 | Conflict Alerts Widget | Alertas de conflitos de agendamento | ✅ |
| 13 | Compact Timeline | Timeline compacta de produção | ✅ |
| 14 | Daily Summary Card | Resumo diário consolidado | ✅ |
| 15 | Dashboard Edit Controls | Modo edição com toggle de visibilidade de widgets | ✅ |
| 16 | Sortable Widget Sections | Seções reorganizáveis (main, sidebar, efficiency, bottom) | ✅ |
| 17 | Tabs de Navegação | Visão Geral, Eficiência, Timeline, Jobs | ✅ |
| 18 | Role-based Dashboard | Operadores veem apenas suas máquinas; coordenadores veem tudo | ✅ |
| 19 | Favoritos | Botão de favorito na página e dropdown de favoritos | ✅ |
| 20 | Assistente IA Flutuante | FloatingAIAssistant sempre disponível | ✅ |
| 21 | Comandos de Voz | VoiceButton para comandos por voz | ✅ |
| 22 | Status de Conexão | Indicador online/offline | ✅ |
| 23 | Command Palette | Atalho ⌘K para acesso rápido | ✅ |

### 1.2 Dashboard de Eficiência (`/efficiency`)
**Página:** `src/pages/EfficiencyDashboard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Métricas de Eficiência | Indicadores de produtividade | ✅ |
| 2 | Comparativo por Operador | Ranking de desempenho | ✅ |
| 3 | Comparativo por Máquina | Performance por equipamento | ✅ |
| 4 | Tendências Históricas | Gráficos de evolução | ✅ |
| 5 | Histórico de Alertas | EfficiencyAlertHistoryWidget | ✅ |

### 1.3 Dashboard Executivo (`/executive`)
**Página:** `src/pages/ExecutiveDashboard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Metas e Objetivos | Definição e tracking de metas | ✅ |
| 2 | Visão Consolidada | Resumo gerencial com KPIs | ✅ |
| 3 | Gráficos Interativos | Charts com drill-down | ✅ |
| 4 | Exportação PDF/Excel | Relatórios exportáveis | ✅ |
| 5 | Filtros Avançados | Multi-filtros combinados | ✅ |
| 6 | Comparativo Períodos | YoY, MoM, WoW | ✅ |

### 1.4 Dashboard de KPIs (`/kpis`)
**Página:** `src/pages/KPIDashboard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Indicadores Customizáveis | KPIs personalizados | ✅ |
| 2 | Metas por Indicador | Target vs Realizado | ✅ |
| 3 | Alertas de Desvio | Notificação de anomalias | ✅ |
| 4 | Histórico de Performance | Evolução temporal | ✅ |
| 5 | Ocupação % | Porcentagem por máquina | ✅ |
| 6 | Volume Produção | Diário/semanal/mensal | ✅ |
| 7 | Índice de Perdas | Taxa de peças perdidas | ✅ |
| 8 | Taxa de Atraso | Jobs atrasados vs total | ✅ |
| 9 | Produtividade Máquina | Comparativo entre máquinas | ✅ |
| 10 | Produtividade Operador | Comparativo entre operadores | ✅ |
| 11 | Tempo Médio Produção | Por técnica e produto | ✅ |

---

## 2. MÓDULO CALENDÁRIO DE PRODUÇÃO

### 2.1 Calendário Diário (`/calendar/daily`)
**Página:** `src/pages/DailyCalendar.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Visualização Diária | Timeline do dia 07:00-20:00 com intervalos de 15min | ✅ |
| 2 | Drag-and-Drop Jobs | Mover jobs entre horários | ✅ |
| 3 | Visualização por Máquina | Lanes por equipamento | ✅ |
| 4 | Indicador de Conflitos | Destacar sobreposições | ✅ |
| 5 | Quick Actions | Ações rápidas no hover | ✅ |
| 6 | Zoom Temporal | Ajustar escala de tempo | ✅ |
| 7 | Status Visual | Cores por status do job | ✅ |
| 8 | Filtros por Técnica | Filtrar por tipo de gravação | ✅ |
| 9 | Filtros por Máquina | Filtrar por estúdio específico | ✅ |

### 2.2 Calendário Semanal (`/calendar/weekly`)
**Página:** `src/pages/WeeklyCalendar.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Visualização Semanal | 7 dias panorâmicos para coordenador/gestão | ✅ |
| 2 | Navegação entre Semanas | Anterior/Próxima | ✅ |
| 3 | Drag-and-Drop entre Dias | Reagendar para outro dia | ✅ |
| 4 | Capacidade por Dia | Indicador de carga | ✅ |
| 5 | Mini-map de Jobs | Preview dos jobs | ✅ |
| 6 | Exportar Agenda | PDF/Excel da semana | ✅ |

### 2.3 Smart Sequencing
**Hook:** `src/hooks/useSmartSequencing.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Agrupamento por Cor | Minimizar trocas de cor | ✅ |
| 2 | Agrupamento por Material | Otimizar setup | ✅ |
| 3 | Sugestão de Sequência | Ordem otimizada | ✅ |
| 4 | Aplicar Sequência | Reordenar automaticamente | ✅ |

### 2.4 Detecção de Conflitos
**Hook:** `src/hooks/useSchedulingConflicts.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Conflitos de Horário | Detectar sobreposição | ✅ |
| 2 | Conflitos de Recurso | Máquina já alocada | ✅ |
| 3 | Conflitos de Operador | Operador indisponível | ✅ |
| 4 | Alertas Visuais | Destacar conflitos | ✅ |
| 5 | Resolução Sugerida | Propor alternativas | ✅ |

---

## 3. MÓDULO KANBAN

### 3.1 Board Principal (`/kanban`)
**Página:** `src/pages/KanbanBoard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Colunas por Status | Visualização em colunas (pendente, produção, concluído, etc.) | ✅ |
| 2 | Drag-and-Drop Cards | Mover entre colunas via @dnd-kit | ✅ |
| 3 | Filtros por Status | Filtrar cards | ✅ |
| 4 | Filtros por Operador | Ver por responsável | ✅ |
| 5 | Filtros por Máquina | Ver por equipamento | ✅ |
| 6 | Filtros por Técnica | Ver por tipo gravação | ✅ |
| 7 | Pesquisa de Cards | Buscar por texto | ✅ |
| 8 | Cards com Detalhes | Expandir informações (JobDetailsModal) | ✅ |
| 9 | Indicadores WIP | Limites de trabalho em progresso | ✅ |
| 10 | Cores por Prioridade | Visual de urgência | ✅ |
| 11 | Drag Overlay | Preview visual durante arrasto (DragOverlayCard) | ✅ |

### 3.2 Cards de Job
**Componente:** `src/components/kanban/DraggableJobCard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Preview de Informações | Dados essenciais visíveis | ✅ |
| 2 | Indicador de Prazo | Deadline visual | ✅ |
| 3 | Operador Atribuído | Avatar do responsável | ✅ |
| 4 | Máquina Alocada | Equipamento designado | ✅ |
| 5 | Quick Edit | Edição inline | ✅ |
| 6 | Ações Contextuais | Menu de opções | ✅ |

---

## 4. MÓDULO GESTÃO DE JOBS

### 4.1 Criação de Jobs (`/new-job`)
**Página:** `src/pages/NewJobPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Formulário Completo | Todos campos: cliente, produto, técnica, máquina, quantidade | ✅ |
| 2 | Validação em Tempo Real | Zod + React Hook Form | ✅ |
| 3 | Upload de Arquivos | Anexar arte/design (Supabase Storage) | ✅ |
| 4 | Seleção de Técnica | 16 técnicas de gravação | ✅ |
| 5 | Seleção de Máquina | 52 máquinas disponíveis | ✅ |
| 6 | Estimativa de Tempo | Cálculo automático | ✅ |
| 7 | Priorização | Definir urgência (baixa/normal/alta/urgente) | ✅ |
| 8 | Templates de Job | Modelos reutilizáveis | ✅ |
| 9 | Duplicação | Copiar job existente (useRecordDuplication) | ✅ |

### 4.2 Fila de Pendentes (`/pending`)
**Página:** `src/pages/PendingQueue.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Lista de Aguardando | Jobs não iniciados | ✅ |
| 2 | Ordenação por Prioridade | Ranking de urgência | ✅ |
| 3 | Ordenação por Prazo | Deadline mais próximo | ✅ |
| 4 | Ações em Lote | Bulk operations (useBulkActions) | ✅ |
| 5 | Atribuição Rápida | Designar operador | ✅ |
| 6 | Reagendamento | Mudar data/hora | ✅ |
| 7 | Buffer Automático | Promoção automática de 3 jobs por técnica (useAutoBufferPromotion) | ✅ |

### 4.3 Detecção de Jobs Travados
**Hook:** `src/hooks/useStuckJobsDetection.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Jobs Parados | Detectar sem progresso | ✅ |
| 2 | Tempo Limite | Alerta após X horas | ✅ |
| 3 | Notificação Automática | Avisar responsável | ✅ |
| 4 | Escalação | Notificar supervisor | ✅ |

### 4.4 Paginação e Busca
**Hook:** `src/hooks/usePaginatedJobs.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Paginação Server-side | Performance otimizada | ✅ |
| 2 | Busca Fulltext | Pesquisa via useFuseSearch | ✅ |
| 3 | Filtros Combinados | Multi-filtros | ✅ |
| 4 | Ordenação Dinâmica | Sort por qualquer coluna | ✅ |
| 5 | Infinite Scroll | Carregamento contínuo (useInfiniteScroll) | ✅ |

### 4.5 Detalhes do Job
**Componente:** `src/components/jobs/JobDetailsModal.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Visualização Completa | Todos os dados do job | ✅ |
| 2 | Edição Inline | Alterar campos diretamente | ✅ |
| 3 | Fotos de Produção | Upload e galeria | ✅ |
| 4 | QR Code | Geração de QR por job (JobQRCode) | ✅ |
| 5 | Histórico | Log de alterações | ✅ |

---

## 5. MÓDULO GESTÃO DE OPERADORES

### 5.1 Lista de Operadores (`/operators`)
**Página:** `src/pages/OperatorsPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | CRUD Completo | Criar/Ler/Editar/Excluir via Edge Functions | ✅ |
| 2 | Perfil do Operador | Nome, telefone, foto/avatar | ✅ |
| 3 | Certificações | Técnicas habilitadas | ✅ |
| 4 | Histórico de Performance | Evolução do operador | ✅ |
| 5 | Status Ativo/Inativo | Ativação/desativação temporária | ✅ |
| 6 | Busca por Nome | Pesquisa rápida | ✅ |
| 7 | Filtro por Máquina | Ver operadores de máquina específica | ✅ |
| 8 | Status Online/Offline | Indicador em tempo real com "last seen" | ✅ |
| 9 | Auditoria de Status | Log de ativações/desativações (OperatorAuditHistory) | ✅ |

### 5.2 Atribuição de Máquinas
**Componente:** `src/components/operators/MachineAssignmentModal.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Vincular Máquinas | Associar operador a máquinas (junction table) | ✅ |
| 2 | Gerenciar Vínculos | UI de atribuição | ✅ |
| 3 | Indicador no Header | OperatorMachinesIndicator com tooltip | ✅ |

### 5.3 Visão do Operador (`/operator`)
**Página:** `src/pages/OperatorView.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Meus Jobs | Jobs atribuídos ao operador | ✅ |
| 2 | Minha Performance | Métricas pessoais | ✅ |
| 3 | Minhas Metas | Objetivos individuais | ✅ |
| 4 | Histórico | Jobs concluídos | ✅ |
| 5 | Rankings | Posição entre pares | ✅ |
| 6 | Registro de Produção | Modal de registro (ProductionRegistrationModal) | ✅ |

### 5.4 Produtividade (`/operators/productivity`)
**Página:** `src/pages/OperatorProductivityPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Métricas Detalhadas | Eficiência, jobs, peças, perdas, velocidade | ✅ |
| 2 | Comparativo | Benchmark entre operadores | ✅ |
| 3 | Tendências | Evolução com trend lines e previsão 7 dias | ✅ |
| 4 | Pontos Fortes/Fracos | Análise de habilidades | ✅ |
| 5 | Filtro por Período | 7/30/90 dias ou all-time | ✅ |
| 6 | Exportação PDF | Relatórios de produtividade | ✅ |

### 5.5 Metas e Objetivos
**Hook:** `src/hooks/useOperatorGoals.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Criar Metas SMART | Objetivos mensuráveis | ✅ |
| 2 | Editar/Excluir Metas | CRUD completo | ✅ |
| 3 | Progresso Visual | Indicadores de progresso | ✅ |
| 4 | Histórico de Metas | Agrupado por período com charts comparativos | ✅ |
| 5 | Alertas de Meta | Notificação quando abaixo do target (GoalAlertsWidget) | ✅ |

### 5.6 Rankings e Evolução
**Hooks:** `useOperatorRankings.ts`, `useOperatorEvolution.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Ranking Geral | Top performers | ✅ |
| 2 | Ranking por Técnica | Especialistas | ✅ |
| 3 | Evolução Temporal | Gráfico de progresso | ✅ |
| 4 | Cálculo de Rankings | Edge function calculate-rankings | ✅ |

---

## 6. MÓDULO GESTÃO DE MÁQUINAS

### 6.1 Lista de Máquinas (`/machines`)
**Página:** `src/pages/MachinesPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | CRUD Completo | Criar/Ler/Editar/Excluir | ✅ |
| 2 | Especificações Técnicas | Dados do equipamento (código, nome) | ✅ |
| 3 | Status Operacional | Ativo/Inativo | ✅ |
| 4 | Técnicas Suportadas | Tipos de gravação por máquina | ✅ |
| 5 | Histórico de Manutenção | Registros de manutenção | ✅ |
| 6 | Utilização % | Porcentagem de uso | ✅ |

### 6.2 Monitoramento

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Status em Tempo Real | Atualização via WebSocket | ✅ |
| 2 | Alertas de Manutenção | Notificação preventiva | ✅ |
| 3 | Métricas de Uso | Horas de operação | ✅ |
| 4 | Eficiência | Performance vs capacidade | ✅ |

---

## 7. MÓDULO OEE

### 7.1 Dashboard OEE (`/oee`)
**Página:** `src/pages/OEEDashboard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Gauge OEE Global | Indicador principal (OEEGaugeCard) | ✅ |
| 2 | Disponibilidade | Availability metric | ✅ |
| 3 | Performance | Performance metric | ✅ |
| 4 | Qualidade | Quality metric | ✅ |
| 5 | Decomposição de Perdas | Breakdown por fator (OEELossesChart) | ✅ |
| 6 | Histórico 14 dias | Trend chart com benchmark World-Class (OEETrendChart) | ✅ |
| 7 | Tabela por Máquina | Comparativo com sort/filter (OEEMachineTable) | ✅ |
| 8 | Comparativo por Técnica | Análise por tipo gravação (OEETechniqueComparison) | ✅ |
| 9 | Drill-down | Análise detalhada por máquina | ✅ |

### 7.2 Cálculos OEE
**Hook:** `src/hooks/useOEE.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Cálculo Automático | Fórmula OEE padrão (A × P × Q) | ✅ |
| 2 | Filtros Temporais | Por período | ✅ |
| 3 | Por Máquina | OEE individual | ✅ |
| 4 | Metas OEE | Target vs Real | ✅ |

---

## 8. MÓDULO ABC COSTING

### 8.1 Dashboard ABC (`/abc`)
**Página:** `src/pages/ABCCostingDashboard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Atividades | Cadastro de atividades (ABCActivityRatesCard) | ✅ |
| 2 | Cost Pools | Pools de custo (ABCCostPoolsCard) | ✅ |
| 3 | Cost Drivers | Direcionadores de custo | ✅ |
| 4 | Alocação | Distribuição de custos | ✅ |
| 5 | Custo por Job | Custeio detalhado (ABCJobCostsTable) | ✅ |
| 6 | Rentabilidade | Análise de margem | ✅ |
| 7 | Gráfico por Técnica | Breakdown visual (ABCTechniqueChart, ABCCostBreakdownChart) | ✅ |

### 8.2 Cálculos ABC
**Hooks:** `useABCData.ts`, `useABCMutations.ts`, `useABCCalculations.ts`, `useABCCosts.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Rateio Automático | Cálculo de alocação | ✅ |
| 2 | Histórico de Custos | Evolução temporal | ✅ |
| 3 | Comparativo | Custo real vs orçado | ✅ |
| 4 | Exportação | Relatórios de custo | ✅ |

---

## 9. MÓDULO TPM

### 9.1 Dashboard TPM (`/tpm`)
**Página:** `src/pages/TPMDashboard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Agenda de Manutenção | Calendário preventiva (TPMCalendar) | ✅ |
| 2 | Lista de Agendamentos | TPMScheduleList com status | ✅ |
| 3 | Criação de Agendamento | CreateScheduleModal | ✅ |
| 4 | Checklists | Roteiros de inspeção com items críticos e medições | ✅ |
| 5 | Registro de Paradas | Log de downtime com fotos | ✅ |
| 6 | MTBF | Tempo médio entre falhas (MTBFMTTRWidget) | ✅ |
| 7 | MTTR | Tempo médio de reparo | ✅ |
| 8 | Alertas Preventivos | Painel de alertas (TPMAlertsPanel) | ✅ |
| 9 | Histórico | Registros de manutenção | ✅ |
| 10 | Notificações TPM | Sistema configurável (TPMNotificationSettings) | ✅ |
| 11 | Tipos de Manutenção | Preventiva, corretiva, autônoma | ✅ |

### 9.2 Métricas de Confiabilidade
**Hook:** `src/hooks/useMTBFMTTR.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Cálculo MTBF | Mean Time Between Failures | ✅ |
| 2 | Cálculo MTTR | Mean Time To Repair | ✅ |
| 3 | Tendências | Evolução dos indicadores | ✅ |
| 4 | Health Metrics | Métricas por máquina (machine_health_metrics) | ✅ |

---

## 10. MÓDULO SPC

### 10.1 Dashboard SPC (`/spc`)
**Página:** `src/pages/SPCDashboard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Gráficos de Controle | Charts X-bar estatísticos | ✅ |
| 2 | Limites de Controle | UCL/LCL automáticos | ✅ |
| 3 | Detecção de Anomalias | Pontos fora de controle | ✅ |
| 4 | Capability Analysis | Cp/Cpk índices | ✅ |
| 5 | Histogramas | Distribuição de dados | ✅ |
| 6 | Pareto | Análise de causas | ✅ |

---

## 11. MÓDULO BI / ANALYTICS

### 11.1 Business Intelligence (`/bi`)
**Página:** `src/pages/BIDashboard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Dashboards Customizáveis | Visões personalizadas | ✅ |
| 2 | Drill-down | Navegação hierárquica | ✅ |
| 3 | Filtros Globais | Aplicar a todos widgets | ✅ |
| 4 | Exportação | PDF/Excel/CSV | ✅ |
| 5 | Agendamento | Relatórios programados | ✅ |
| 6 | Compartilhamento | Enviar por email | ✅ |

### 11.2 Alertas e Monitoramento (`/alerts`)
**Página:** `src/pages/AlertsDashboard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Central de Alertas | Todos os alertas do sistema | ✅ |
| 2 | Regras de Alerta | Configurar triggers | ✅ |
| 3 | Histórico | Log de alertas | ✅ |
| 4 | Escalação | Níveis de urgência | ✅ |
| 5 | Visível a Todos | Acessível por qualquer role | ✅ |

### 11.3 Code Quality (`/code-quality`)
**Página:** `src/pages/CodeQualityDashboard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Métricas de Código | Análise de qualidade (useCodeQualityMetrics) | ✅ |

---

## 12. MÓDULO ASSISTENTE TÉCNICO IA

### 12.1 Assistente IA (`/assistant`)
**Página:** `src/pages/TechnicalAssistantPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Chat Conversacional | Interface de chat completa | ✅ |
| 2 | Contexto de Produção | Acesso a dados do sistema | ✅ |
| 3 | Sugestões Inteligentes | Recomendações baseadas em dados | ✅ |
| 4 | Troubleshooting | Diagnóstico de problemas | ✅ |
| 5 | Histórico de Conversas | Manter contexto (useTechnicalConversations) | ✅ |
| 6 | Multi-idioma | PT-BR, EN-US, ES-ES | ✅ |
| 7 | Edge Function | technical-assistant com IA | ✅ |

### 12.2 Assistente Flutuante
**Componente:** `src/components/ai/FloatingAIAssistant.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Acesso Rápido | Botão flutuante em todas as páginas | ✅ |
| 2 | Mini Chat | Interface compacta | ✅ |

---

## 13. MÓDULO BASE DE CONHECIMENTO

### 13.1 Base de Conhecimento (`/knowledge`)
**Página:** `src/pages/TechnicalKnowledgeBase.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Artigos Técnicos | Documentação de técnicas | ✅ |
| 2 | Busca Fulltext | Pesquisa em todo conteúdo | ✅ |
| 3 | Categorização | Por Técnica → Produto → Material | ✅ |
| 4 | Versionamento | Histórico de versões | ✅ |

### 13.2 Fichas Técnicas
**Hooks:** `src/hooks/useTechnicalSheets.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | CRUD Fichas | Criar/editar/excluir fichas técnicas | ✅ |
| 2 | Passos Detalhados | Procedimentos step-by-step | ✅ |
| 3 | Materiais | Lista de materiais necessários | ✅ |
| 4 | Dicas/Avisos | Tips e warnings | ✅ |
| 5 | Máquina Recomendada | Estúdio sugerido | ✅ |
| 6 | Tempo Estimado | Duração prevista | ✅ |
| 7 | Viewer/Editor | TechnicalSheetViewer + TechnicalSheetEditor | ✅ |

---

## 14. MÓDULO NOTIFICAÇÕES

### 14.1 Central de Notificações (`/notifications`)
**Página:** `src/pages/NotificationsPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | In-App Notifications | Notificações no sistema (NotificationCenter) | ✅ |
| 2 | Realtime Updates | WebSocket (RealtimeNotificationsProvider) | ✅ |
| 3 | Marcar como Lida | Gerenciar leitura | ✅ |
| 4 | Marcar Todas Lidas | Ação em lote | ✅ |
| 5 | Badge de Contagem | Indicador de não lidas | ✅ |
| 6 | Toast com Undo | Desfazer ações (ToastWithUndo) | ✅ |

### 14.2 Preferências de Notificação
**Hook:** `src/hooks/useNotificationPreferences.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Canais Habilitados | Email/Push/SMS/WhatsApp | ✅ |
| 2 | Categorias | Filtrar por tipo | ✅ |
| 3 | Do Not Disturb | Modo silencioso com horários | ✅ |
| 4 | Digest Diário | Resumo consolidado (DailySummaryCard) | ✅ |
| 5 | Sons | Notificação sonora (useNotificationSounds) | ✅ |

### 14.3 Push Notifications
**Hooks:** `usePushNotifications.ts`, `usePushSubscription.ts`, `useWebPushNotifications.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Permissão Push | Solicitar autorização (PushNotificationPrompt) | ✅ |
| 2 | Token Management | Gerenciar tokens | ✅ |
| 3 | Envio Push | Edge function send-push-notification | ✅ |
| 4 | Configurações | PushNotificationSettings + PushNotificationManager | ✅ |

### 14.4 Notificações Especializadas

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Eficiência | useEfficiencyNotifications + Provider | ✅ |
| 2 | ML Predictions | useMLPredictionNotifications | ✅ |
| 3 | Metas | useGoalAlerts + GoalAlertsWidget | ✅ |
| 4 | TPM | useTPMNotifications | ✅ |
| 5 | Resumo Diário | useDailySummaryNotifications | ✅ |
| 6 | Integrador | NotificationIntegrator | ✅ |

---

## 15. MÓDULO AUTENTICAÇÃO E SEGURANÇA

### 15.1 Login/Signup (`/auth`)
**Página:** `src/pages/AuthPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Login Email/Senha | Autenticação básica Supabase Auth | ✅ |
| 2 | Signup | Cadastro de usuário | ✅ |
| 3 | Recuperar Senha | Reset password com email | ✅ |
| 4 | Validação de Formulário | Zod validation | ✅ |
| 5 | OAuth / Login Social | Google OAuth via @lovable.dev/cloud-auth-js | ✅ |
| 6 | Password Strength | Indicador de força (PasswordStrengthIndicator) | ✅ |
| 7 | Reset Password Page | `/reset-password` com formulário | ✅ |

### 15.2 Controle de Acesso (RBAC)
**Hook:** `src/hooks/useRBAC.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | 3 Roles | Coordenador (full), Operador (restrito), Gestão (view-only) | ✅ |
| 2 | Protected Routes | Rotas protegidas por role (ProtectedRoute) | ✅ |
| 3 | Permissões Granulares | useRolePermissions, PermissionManager, PermissionMatrix | ✅ |
| 4 | User Roles Table | Tabela separada com RLS | ✅ |
| 5 | has_role() Function | Security definer para evitar recursão RLS | ✅ |

### 15.3 Segurança Avançada (`/security`)
**Página:** `src/pages/SecurityDashboard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | 2FA / MFA | TOTP setup e challenge (MFAEnroll, MFASettings, TwoFactorSetup) | ✅ |
| 2 | Passkeys/WebAuthn | Login biométrico (PasskeyLoginButton, PasskeySettings, useWebAuthn) | ✅ |
| 3 | IP Allowlist | Lista de IPs permitidos (IPAllowlist) | ✅ |
| 4 | IPs Bloqueados | Painel de IPs bloqueados (BlockedIPsPanel) | ✅ |
| 5 | Geo Blocking | Bloqueio por país (GeoBlockingSettings, useGeoBlocking) | ✅ |
| 6 | Auditoria de Login | Log de tentativas (LoginAuditLog) | ✅ |
| 7 | Login Lockout | Bloqueio após falhas (check-login-lockout) | ✅ |
| 8 | Dispositivos Ativos | Painel de sessões (ActiveDevicesPanel, useUserDevices) | ✅ |
| 9 | Eventos de Segurança | Log detalhado (SecurityEventsLog, useSecurityEvents) | ✅ |
| 10 | Alertas de Segurança | SecurityAlertsPanel + security-alert edge function | ✅ |
| 11 | Rate Limiting | Controle de taxa (RateLimitSettings, useRateLimitLogs) | ✅ |
| 12 | Security Overview | Card resumo (SecurityOverviewCard) | ✅ |
| 13 | Session Manager | Gerenciamento de sessão (useSessionManager, useSessionTimeout) | ✅ |
| 14 | Reauth Context | Re-autenticação para ações sensíveis (ReauthContext) | ✅ |
| 15 | Validação de IP | Edge function validate-login-ip | ✅ |
| 16 | Alerta Novo Dispositivo | Edge function new-device-alert | ✅ |
| 17 | Cleanup Logs | Edge function cleanup-security-logs | ✅ |
| 18 | Password Reset com Aprovação | Fluxo com aprovação de gestor (PasswordResetRequests) | ✅ |

---

## 16. MÓDULO CONFIGURAÇÕES

### 16.1 Página de Configurações (`/settings`)
**Página:** `src/pages/SettingsPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Perfil do Usuário | Editar dados pessoais | ✅ |
| 2 | Alterar Senha | Trocar senha | ✅ |
| 3 | Tema | Light/Dark mode (ThemeToggle, AutoThemeToggle) | ✅ |
| 4 | Idioma | PT-BR/EN-US/ES-ES (LanguageSwitcher) | ✅ |
| 5 | Notificações | Configurar alertas | ✅ |
| 6 | User Management | Gerenciamento de usuários (UserManagement) | ✅ |

---

## 17. MÓDULO INTEGRAÇÕES

### 17.1 Bitrix24 (`/integrations/bitrix24`)
**Página:** `src/pages/Bitrix24ConfigPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Conexão API | Configurar webhook | ✅ |
| 2 | Mapeamento de Campos | Vincular campos (Bitrix24FieldMapping) | ✅ |
| 3 | Sincronização | Painel de sync (Bitrix24SyncPanel) | ✅ |
| 4 | Histórico de Sync | Log (Bitrix24SyncHistory) | ✅ |
| 5 | OAuth Tokens | Gestão de tokens | ✅ |
| 6 | Edge Function | bitrix24-sync | ✅ |

### 17.2 Integration Hub
**Componente:** `src/components/integrations/IntegrationHub.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Hub Central | Painel de todas integrações | ✅ |

### 17.3 ERP API
**Edge Function:** `supabase/functions/erp-api/index.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Endpoint REST | API para ERPs | ✅ |
| 2 | Autenticação API Key | Segurança | ✅ |
| 3 | Rate Limiting | Controle de uso | ✅ |

### 17.4 Webhooks
**Edge Function:** `supabase/functions/webhook-handler/index.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Handler | Recepção de webhooks | ✅ |
| 2 | Logs | Histórico de webhooks | ✅ |

---

## 18. MÓDULO OFFLINE / PWA

### 18.1 Progressive Web App
| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Instalável | Add to Home Screen (/install) | ✅ |
| 2 | Service Worker | Cache e offline (Workbox) | ✅ |
| 3 | Ícones PWA | 8 tamanhos (72-512px) | ✅ |
| 4 | Manifest | public/manifest.json | ✅ |
| 5 | Modo Standalone | App nativo | ✅ |
| 6 | Offline Page | public/offline.html | ✅ |

### 18.2 Suporte Offline
**Hooks:** `useOfflineSync.ts`, `useNetworkStatus.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Detecção Online/Offline | Navigator API + NetworkStatusProvider | ✅ |
| 2 | Cache de Dados | offlineStorage.ts (IndexedDB) | ✅ |
| 3 | Sync em Background | Quando reconectar (OfflineSyncContext) | ✅ |
| 4 | Queue de Operações | Fila offline | ✅ |
| 5 | Indicador Visual | OfflineBanner, OfflineStatusBanner, OfflineSyncIndicator | ✅ |
| 6 | CRUD Offline | Operações locais | ✅ |
| 7 | Merge de Dados | Resolver conflitos | ✅ |
| 8 | Pull to Refresh | Atualização mobile (PullToRefresh) | ✅ |

---

## 19. MÓDULO CRUD AVANÇADO

### 19.1 Busca Fulltext
**Hook:** `src/hooks/useFuseSearch.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Pesquisa Multi-campo | Busca em todos os campos | ✅ |
| 2 | Highlight | Marcar resultados | ✅ |
| 3 | Ranking de Relevância | Ordenar por score | ✅ |
| 4 | Global Search | Componente de busca global (GlobalSearch) | ✅ |

### 19.2 Filtros Salvos
**Hook:** `src/hooks/useSavedFilters.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Salvar Filtro | Persistir configuração | ✅ |
| 2 | Carregar Filtro | Aplicar filtro salvo | ✅ |
| 3 | Compartilhar Filtro | Entre usuários | ✅ |
| 4 | Filtros Padrão | Defaults do sistema | ✅ |

### 19.3 Import/Export
**Hooks:** `useDataImport.ts`, `useDataExport.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Import CSV | Importar dados | ✅ |
| 2 | Import Excel | Importar planilhas | ✅ |
| 3 | Export CSV | Exportar dados | ✅ |
| 4 | Export Excel | Edge function excel-export | ✅ |
| 5 | Export PDF | pdfExport.ts + pdf-generator | ✅ |

### 19.4 Bulk Actions
**Hook:** `src/hooks/useBulkActions.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Seleção Múltipla | Checkbox em lista | ✅ |
| 2 | Ação em Lote | Aplicar a selecionados | ✅ |
| 3 | Excluir em Lote | Delete múltiplo | ✅ |
| 4 | Atualizar em Lote | Update múltiplo | ✅ |
| 5 | Progresso | Indicador de execução | ✅ |

### 19.5 Versionamento
**Hook:** `src/hooks/useVersionHistory.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Histórico de Versões | Log de alterações | ✅ |
| 2 | Comparar Versões | Diff visual | ✅ |
| 3 | Restaurar Versão | Rollback | ✅ |
| 4 | Auditoria | Quem/quando alterou | ✅ |

### 19.6 Duplicação
**Hook:** `src/hooks/useRecordDuplication.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Duplicar Registro | Clone completo | ✅ |
| 2 | Duplicar com Edição | Ajustar dados | ✅ |
| 3 | Duplicação em Lote | Múltiplos registros | ✅ |

### 19.7 Infinite Scroll
**Hook:** `src/hooks/useInfiniteScroll.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Carregamento Progressivo | Intersection Observer | ✅ |
| 2 | Loading States | Indicadores visuais | ✅ |
| 3 | Reset | Voltar ao início | ✅ |

---

## 20. MÓDULO RELATÓRIOS

### 20.1 Geração de Relatórios

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Relatório de Produção | Jobs por período | ✅ |
| 2 | Relatório de Operadores | Performance individual | ✅ |
| 3 | Relatório de Máquinas | Utilização | ✅ |
| 4 | Relatório OEE | Indicadores | ✅ |
| 5 | Relatório de Custos | ABC Costing | ✅ |
| 6 | Relatório de Produtividade | productivityReport.ts | ✅ |

### 20.2 Exportação Excel
**Edge Function:** `supabase/functions/excel-export/index.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Múltiplas Abas | Dados organizados | ✅ |
| 2 | Formatação | Estilos e cores | ✅ |
| 3 | Fórmulas | Cálculos automáticos | ✅ |

### 20.3 Envio de Relatórios
**Edge Function:** `supabase/functions/send-email-report/index.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Email Programado | Agendamento automático | ✅ |
| 2 | Múltiplos Destinatários | Lista de emails | ✅ |
| 3 | Anexos | PDF/Excel | ✅ |

---

## 21. MÓDULO RASTREABILIDADE

### 21.1 QR Scanner (`/scanner`)
**Página:** `src/pages/QRScannerPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Escanear QR Code | Câmera do dispositivo (html5-qrcode) | ✅ |
| 2 | Identificar Job | Buscar por código | ✅ |
| 3 | Registrar Evento | Início/fim de produção | ✅ |
| 4 | Histórico de Scans | Log de leituras (ScanHistory) | ✅ |
| 5 | Estatísticas | ScanStatsChart | ✅ |
| 6 | Geração QR | qrcode.react (JobQRCode) | ✅ |

### 21.2 Rastreabilidade de Lotes (`/traceability`)
**Página:** `src/pages/TraceabilityPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Lotes de Produção | CRUD completo (production_lots) | ✅ |
| 2 | Componentes do Lote | Materiais e fornecedores (lot_components) | ✅ |
| 3 | Movimentações | Entrada/saída/transferência (lot_movements) | ✅ |
| 4 | Inspeções de Qualidade | Registro e resultado (lot_quality_inspections) | ✅ |
| 5 | Genealogia | Árvore de componentes (LotGenealogyView) | ✅ |
| 6 | Detalhes do Lote | Modal completo (LotDetailsModal) | ✅ |

---

## 22. MÓDULO GAMIFICAÇÃO

### 22.1 Sistema de Gamificação (`/gamification`)
**Página:** `src/pages/GamificationPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Pontuação por Ação | XP por jobs concluídos | ✅ |
| 2 | Níveis | Progressão do operador | ✅ |
| 3 | Conquistas | Badges desbloqueáveis (operator_achievements) | ✅ |
| 4 | Leaderboard | Ranking de pontos (operator_rankings) | ✅ |
| 5 | Recompensas | Sistema de premiação | ✅ |
| 6 | Configurações | gamification_settings | ✅ |
| 7 | Celebrações | Animações de conquista (CelebrationMoment, CelebrationProvider) | ✅ |

---

## 23. MÓDULO ML / PREDIÇÕES

### 23.1 Dashboard de Predições (`/ml-predictions`)
**Página:** `src/pages/MLPredictionsDashboard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Previsão de Falhas | Manutenção preditiva (MLPredictionCard) | ✅ |
| 2 | Distribuição de Risco | Chart de risco (MLRiskDistributionChart) | ✅ |
| 3 | Otimização de Recursos | Alocação inteligente | ✅ |
| 4 | Anomaly Detection | Detectar outliers | ✅ |
| 5 | Configurações | MLNotificationSettings | ✅ |

### 23.2 Predições ML
**Hook:** `src/hooks/useMLPredictions.ts`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Modelo de Falhas | Probabilidade de quebra (machine_predictions) | ✅ |
| 2 | Recomendações | Ações sugeridas | ✅ |
| 3 | Score de Confiança | Nível de certeza | ✅ |
| 4 | Histórico | Predições anteriores | ✅ |
| 5 | Edge Function | ml-predictions | ✅ |

---

## 24. MÓDULO ENERGIA

### 24.1 Dashboard de Energia (`/energy`)
**Página:** `src/pages/EnergyDashboard.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Consumo por Máquina | Métricas kWh (energy_consumption) | ✅ |
| 2 | Metas de Energia | Targets de consumo (energy_targets) | ✅ |
| 3 | Alertas de Energia | Notificações de consumo (energy_alerts) | ✅ |
| 4 | Demanda de Pico | Peak demand kW | ✅ |
| 5 | Custo Energético | Cálculo de custos | ✅ |
| 6 | Fator de Potência | Power factor tracking | ✅ |

---

## 25. MÓDULO DOCUMENTOS

### 25.1 Documentos e Instruções (`/documents`)
**Página:** `src/pages/DocumentsPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Upload de PDFs | Supabase Storage (DocumentUploadModal) | ✅ |
| 2 | Visualizador | DocumentViewer | ✅ |
| 3 | Lista de Documentos | DocumentsList com busca/filtros | ✅ |
| 4 | Versionamento | document_versions com histórico | ✅ |
| 5 | Aprovação | Workflow de aprovação | ✅ |
| 6 | Categorias | technical_documents organizados | ✅ |

---

## 26. MÓDULO PASSAGEM DE TURNO

### 26.1 Shift Handover (`/shift-handover`)
**Página:** `src/pages/ShiftHandoverPage.tsx`

| # | Funcionalidade | Descrição | Status |
|---|----------------|-----------|--------|
| 1 | Criar Handover | Registrar passagem (CreateHandoverModal) | ✅ |
| 2 | Detalhes | HandoverDetailsModal | ✅ |
| 3 | Ocorrências | OccurrencesPanel | ✅ |
| 4 | Tarefas Pendentes | PendingTasksPanel | ✅ |
| 5 | Templates Checklist | ChecklistTemplatesManager | ✅ |

---

## 27. INFRAESTRUTURA TÉCNICA

### 27.1 Edge Functions (18 funções)

| # | Function | Descrição | Status |
|---|----------|-----------|--------|
| 1 | health-check | Verificação de saúde | ✅ |
| 2 | backup-scheduler | Agendamento de backups | ✅ |
| 3 | bitrix24-sync | Sincronização Bitrix24 | ✅ |
| 4 | calculate-rankings | Cálculo de rankings | ✅ |
| 5 | create-operator | Criação de operador | ✅ |
| 6 | update-operator | Atualização de operador | ✅ |
| 7 | cron-cleanup | Limpeza agendada | ✅ |
| 8 | daily-maintenance-summary | Resumo de manutenção | ✅ |
| 9 | erp-api | Integração ERP | ✅ |
| 10 | excel-export | Exportação Excel | ✅ |
| 11 | image-optimizer | Otimização de imagens | ✅ |
| 12 | metrics-collector | Coleta de métricas | ✅ |
| 13 | ml-predictions | Predições ML | ✅ |
| 14 | pdf-generator | Geração de PDFs | ✅ |
| 15 | send-email-report | Envio de relatórios | ✅ |
| 16 | send-push-notification | Push notifications | ✅ |
| 17 | technical-assistant | Assistente técnico IA | ✅ |
| 18 | validate-login-ip | Validação de IP | ✅ |
| 19 | approve-password-reset | Aprovação reset senha | ✅ |
| 20 | check-login-lockout | Verificação lockout | ✅ |
| 21 | cleanup-security-logs | Limpeza logs segurança | ✅ |
| 22 | new-device-alert | Alerta novo dispositivo | ✅ |
| 23 | rate-limit-check | Verificação rate limit | ✅ |
| 24 | security-alert | Alerta de segurança | ✅ |
| 25 | webhook-handler | Recepção de webhooks | ✅ |

### 27.2 Páginas (36 rotas)

| # | Rota | Página | Roles |
|---|------|--------|-------|
| 1 | `/` | Index (Dashboard) | coordinator, manager |
| 2 | `/auth` | AuthPage | público |
| 3 | `/reset-password` | ResetPasswordPage | público |
| 4 | `/calendar/daily` | DailyCalendar | coordinator, manager |
| 5 | `/calendar/weekly` | WeeklyCalendar | coordinator, manager |
| 6 | `/pending` | PendingQueue | coordinator |
| 7 | `/alerts` | AlertsDashboard | todos autenticados |
| 8 | `/kanban` | KanbanBoard | coordinator, manager |
| 9 | `/kpis` | KPIDashboard | coordinator, manager |
| 10 | `/operator` | OperatorView | todos autenticados |
| 11 | `/efficiency` | EfficiencyDashboard | coordinator, manager |
| 12 | `/assistant` | TechnicalAssistantPage | todos autenticados |
| 13 | `/scanner` | QRScannerPage | todos autenticados |
| 14 | `/integrations/bitrix24` | Bitrix24ConfigPage | coordinator |
| 15 | `/knowledge` | TechnicalKnowledgeBase | todos autenticados |
| 16 | `/new-job` | NewJobPage | coordinator, manager |
| 17 | `/machines` | MachinesPage | coordinator, manager |
| 18 | `/operators` | OperatorsPage | coordinator, manager |
| 19 | `/operators/productivity` | OperatorProductivityPage | coordinator, manager |
| 20 | `/oee` | OEEDashboard | coordinator, manager |
| 21 | `/abc` | ABCCostingDashboard | coordinator, manager |
| 22 | `/tpm` | TPMDashboard | coordinator, manager |
| 23 | `/ml-predictions` | MLPredictionsDashboard | coordinator, manager |
| 24 | `/bi` | BIDashboard | manager, coordinator |
| 25 | `/code-quality` | CodeQualityDashboard | coordinator, manager |
| 26 | `/notifications` | NotificationsPage | todos autenticados |
| 27 | `/shift-handover` | ShiftHandoverPage | todos autenticados |
| 28 | `/traceability` | TraceabilityPage | coordinator, manager |
| 29 | `/spc` | SPCDashboard | coordinator, manager |
| 30 | `/executive` | ExecutiveDashboard | manager, coordinator |
| 31 | `/energy` | EnergyDashboard | coordinator, manager |
| 32 | `/gamification` | GamificationPage | todos autenticados |
| 33 | `/documents` | DocumentsPage | todos autenticados |
| 34 | `/settings` | SettingsPage | coordinator, manager |
| 35 | `/security` | SecurityDashboard | coordinator, manager |
| 36 | `/install` | InstallAppPage | público |
| 37 | `/kiosk` | KioskPage | todos autenticados |
| 38 | `/design-system` | DesignSystemPage | público |

### 27.3 Hooks Customizados (90+)

**Dados:**
useJobs, usePaginatedJobs, useOperators, useDocuments, useTraceability, useSchedulingData, useSchedulingConflicts

**Funcionalidades:**
useTPM, useTPMData, useTPMMutations, useTPMStats, useTPMNotifications, useSPC, useOEE, useEnergy, useGamification, useMLPredictions, useABCCosts, useABCData, useABCMutations, useABCCalculations, useMTBFMTTR, useShiftHandover

**Operadores:**
useOperatorDashboardData, useOperatorProductivity, useOperatorEvolution, useOperatorPresence, useOperatorMachines, useOperatorGoals, useOperatorAudit, useOperatorRankings

**UI/UX:**
useDebounce, useFuseSearch, useDeviceDetection, use-device, use-focus-trap, use-haptic-feedback, use-pull-to-refresh, use-scroll-direction, use-swipe-gesture, useAutoTheme, useThemeSound, useDashboardLayout, useQuickFavorites, useRoutePrefetch

**Notificações:**
useNotifications, useNotificationSounds, useNotificationPreferences, usePushNotifications, usePushSubscription, useWebPushNotifications, useEfficiencyNotifications, useMLPredictionNotifications, useDailySummaryNotifications, useGoalAlerts, useRealtimeResetRequests

**Segurança:**
useRBAC, useRolePermissions, useMFA, useWebAuthn, useSessionManager, useSessionTimeout, useGeoBlocking, useSecurityEvents, useRateLimitLogs, useUserDevices

**Otimização:**
useSmartSequencing, useSmartSequencingWithActions, useLoadBalancing, useLoadBalancingWithActions, useBottleneckPrediction, useAutoBufferPromotion, useStuckJobsDetection

**CRUD Avançado:**
useBulkActions, useDataImport, useDataExport, useSavedFilters, useInfiniteScroll, useVersionHistory, useRecordDuplication

**Infraestrutura:**
useOfflineSync, useNetworkStatus, useRealtimeConnection, useBitrix24Sync, useKanbanDragDrop, useAlertCount, useEfficiencyAlertHistory, useCodeQualityMetrics, useKPIs, useExecutiveDashboard, useTechnicalConversations, useTechnicalSheets, useOrphanedDataDetection

### 27.4 Providers e Contextos

| # | Provider/Context | Descrição |
|---|-----------------|-----------|
| 1 | AuthProvider | Autenticação e sessão |
| 2 | ReauthProvider | Re-autenticação sensível |
| 3 | OfflineSyncProvider | Sincronização offline |
| 4 | NetworkStatusProvider | Estado de conexão |
| 5 | EfficiencyNotificationProvider | Alertas de eficiência |
| 6 | RealtimeNotificationsProvider | Notificações realtime |
| 7 | ProductDesignProvider | Design system (onboarding, shortcuts, command palette) |
| 8 | CelebrationProvider | Animações de celebração |
| 9 | FeedbackProvider | Feedback ao usuário |
| 10 | SessionManager | Gerenciamento de sessão |

### 27.5 Componentes de UX

| # | Componente | Descrição |
|---|-----------|-----------|
| 1 | OnboardingTour | Tour guiado para novos usuários |
| 2 | KeyboardShortcuts | Atalhos de teclado |
| 3 | CommandPaletteAdvanced | Paleta de comandos ⌘K |
| 4 | GlobalSearch | Busca global |
| 5 | Breadcrumbs | Navegação breadcrumb |
| 6 | PageTransition | Transições animadas (framer-motion) |
| 7 | KioskMode | Modo quiosque fullscreen |
| 8 | MobileNavigation | Navegação mobile bottom bar |
| 9 | MobileHeader | Header mobile |
| 10 | MobileQuickActions | Ações rápidas mobile |
| 11 | SwipeActions | Ações por swipe |
| 12 | SkipLinks | Acessibilidade - skip navigation |
| 13 | ErrorBoundary | Tratamento de erros |
| 14 | Loading/Skeletons | Page skeletons, shimmer, content transition |

### 27.6 Internacionalização (i18n)

| # | Idioma | Arquivo |
|---|--------|---------|
| 1 | Português (BR) | src/i18n/locales/pt-BR.json |
| 2 | English (US) | src/i18n/locales/en-US.json |
| 3 | Español (ES) | src/i18n/locales/es-ES.json |

---

## 28. STACK TECNOLÓGICO

### Frontend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React | ^18.3.1 | Framework UI |
| TypeScript | ^5.8.3 | Tipagem estática |
| Vite | ^5.4.19 | Build tool |
| Tailwind CSS | ^3.4.17 | Estilização |
| shadcn/ui + Radix UI | - | Componentes |
| TanStack React Query | ^5.83.0 | Server state |
| React Router DOM | ^6.30.1 | Roteamento |
| React Hook Form + Zod | - | Formulários |
| Framer Motion | ^12.23.26 | Animações |
| Recharts | ^2.15.4 | Gráficos |
| @dnd-kit | ^6.3.1 | Drag & Drop |
| i18next | ^25.7.3 | i18n |
| vite-plugin-pwa | ^1.2.0 | PWA |
| @tanstack/react-virtual | ^3.13.13 | Virtualização |
| @sentry/react | ^8.55.0 | Monitoramento |
| Fuse.js | - | Busca fuzzy |
| jsPDF | ^3.0.4 | PDF |
| html5-qrcode / qrcode.react | - | QR Code |
| date-fns | ^3.6.0 | Datas |

### Backend (Lovable Cloud)
| Tecnologia | Uso |
|-----------|-----|
| PostgreSQL | Banco de dados |
| Supabase Auth | Autenticação |
| Supabase Storage | Arquivos |
| Supabase Realtime | WebSocket |
| Edge Functions (Deno) | Serverless |
| RLS Policies | Segurança de dados |

### DevOps
| Tecnologia | Uso |
|-----------|-----|
| GitHub Actions | CI/CD |
| Docker | Containerização |
| Kubernetes | Orquestração |
| Nginx | Reverse proxy |
| Husky + lint-staged | Git hooks |
| Vitest | Testes |
| ESLint + Prettier | Code quality |
| Dependabot | Dependências |

---

## 📊 RESUMO QUANTITATIVO

| Métrica | Quantidade |
|---------|-----------|
| **Módulos** | 28 |
| **Páginas/Rotas** | 38 |
| **Edge Functions** | 25 |
| **Hooks Customizados** | 90+ |
| **Componentes** | 150+ |
| **Tabelas no Banco** | 40+ |
| **Funcionalidades Totais** | 400+ |
| **Idiomas** | 3 (PT-BR, EN-US, ES-ES) |
| **Técnicas de Gravação** | 16 |
| **Máquinas Suportadas** | 52 |
| **Cobertura do Escopo** | **100%** ✅ |

---

*Documento gerado em 15/03/2026 — Sistema Fast Grava ES v1.0.0*
