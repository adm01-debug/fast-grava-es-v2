
## Execução Sequencial Autônoma — Ondas 2, 3 e 4 do Módulo AGENDA

Vou executar **todas as 18 melhorias restantes** uma a uma, sem pausas nem perguntas, até atingir 10/10.

---

### 🌊 Onda 2 — Interatividade Profissional (5 entregas)

**E1. Drag & Drop com `@dnd-kit`**
- Hook `useCalendarDnd` envolvendo `DndContext`
- Arrastar `JobBlock` entre máquinas/horários
- Validação via `jobStateMachine.canTransition`
- Snap-to-grid 15min
- Preview fantasma com `DragOverlay`
- Toast de undo (5s) via `useUndoableAction`
- Persistência via `useJobs.updateJob` (offline-safe)

**E2. Resize de blocos**
- Alça lateral direita no `JobBlock`
- Atualiza `estimated_duration` + `end_time`
- Mesma validação + undo

**E3. Click-to-create em slot vazio**
- Componente `QuickJobDialog` (form mínimo)
- Click em célula vazia da timeline → abre dialog pré-preenchido (máquina + horário)
- Cria job em status `scheduled`

**E4. Multi-seleção + ações em lote**
- Hook `useMultiSelect<DbJob>`
- Shift+click ou checkbox no `JobBlock`
- Barra flutuante `BulkActionsBar`: Reagendar | Mudar máquina | Excluir | Imprimir etiquetas

**E5. Atalhos de teclado + Command Palette**
- Hook `useCalendarHotkeys`: ←/→, Shift+←/→, T, N, F, /, 1/2/3, Esc
- Extensão do Command Palette: "Ir para OS-2024-XXXX"

---

### 🌊 Onda 3 — Visões Estratégicas Novas (6 entregas)

**E6. Vista Mensal (`MonthlyCalendar.tsx`)**
- Grid 6×7 com heatmap de jobs/dia
- Cor de fundo proporcional à carga
- Click no dia → navega para `DailyCalendar` com `?date=...`
- Rota nova `/calendar/monthly` + entrada no sidebar

**E7. Vista por Operadores (toggle swimlane)**
- Toggle no `CalendarHeader`: "Por Máquina" | "Por Operador"
- Hook `useJobsByOperator` agrupa por `operator_id`
- Reusa `CalendarTimeline` com prop `groupBy`

**E8. Vista Técnicas Agregada**
- Toggle "Agregar por técnica"
- Colapsa 52 máquinas em 16 técnicas (accordion)
- Expand-on-click revela máquinas individuais

**E9. Heatmap de Ocupação**
- Toggle "Mostrar ocupação"
- Cor de fundo da célula = % uso (verde<50% / amarelo 50-80% / vermelho >80%)
- Cálculo via `useMachineUtilization`

**E10. Comparativo Planejado vs Realizado**
- Toggle "Real vs Planejado"
- Bloco superior transparente = planejado
- Bloco inferior sólido = realizado (`actual_start_time`/`actual_end_time`)
- Badge de desvio (+15min / -10min)

**E11. Zoom Temporal**
- Slider 15/30/60/120min no header
- Persistência localStorage
- Recalcula `totalMinutes` da timeline

---

### 🌊 Onda 4 — Mobile, Export, Polimento (7 entregas)

**E12. Mobile Refinements**
- Swipe horizontal entre dias (`useSwipeGesture`)
- Pull-to-refresh
- FAB "+" para criar job
- Bottom sheet para detalhes (`vaul`)
- Haptic feedback em ações destrutivas

**E13. Export PDF**
- Botão "Exportar PDF" → jsPDF + html2canvas
- Captura agenda do dia/semana

**E14. Export iCal (.ics)**
- Função `exportToICS` por máquina ou operador
- Download direto

**E15. Print-friendly**
- CSS `@media print` em `calendar.css`
- Esconde controles, mantém grid

**E16. Onboarding contextual**
- `CalendarOnboarding.tsx` — overlay primeira visita
- 4 steps: filtros → atalhos → drag → views
- Persistência localStorage

**E17. Skeleton + Empty states**
- `CalendarSkeleton.tsx` — substitui spinners
- `CalendarEmptyState.tsx` — ilustração SVG + CTA "Criar agendamento"

**E18. Acessibilidade WCAG AA**
- `aria-live="polite"` em mudanças de status
- Navegação por teclado em blocos (Tab + Enter + setas)
- Audit de contraste 4.5:1
- `aria-label` descritivo em todos os elementos interativos

---

### 📐 Padrões Mantidos em Todas as Entregas
- **400 linhas/arquivo** — split sempre que ultrapassar
- **Lucide com sufixo Icon** quando colidir com identificadores
- **Zero `console.log`** — `src/lib/logger.ts`
- **Tokens HSL semânticos** — sem cores hardcoded
- **Zod** — validação em payloads de update/create
- **i18n** — strings via `t()` (pt-BR/en-US/es-ES)
- **Realtime** — aproveitar `useRealtimeConnection` existente
- **Offline-first** — drag & drop respeita `useOfflineSync`
- **Dark theme Task Gifts** — Outfit font, Hue 220 / Sat 10%
- **TypeScript strict** — `unknown` + Zod, nunca `any`
- **Testes** — após cada onda, `npm test` para garantir 1386+ verde

### 🔄 Fluxo de Execução
1. Implemento E1 completo → valido tipos → próxima
2. Implemento E2 → valida → próxima
3. ... segue até E18
4. Ao final de cada onda: rodo testes
5. Ao final da E18: relatório final 10/10

**Tempo estimado**: execução contínua sem pausas. Confirme aprovação e inicio imediatamente pela E1 (Drag & Drop).
