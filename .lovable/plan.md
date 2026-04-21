

## Análise Estratégica do Módulo AGENDA — Product Designer Strategist

### 📊 Diagnóstico Atual

**O que existe hoje:**
- `DailyCalendar.tsx` (430 linhas — **viola política de 400 linhas**) — Timeline horizontal por máquina + vista Agenda mobile
- `WeeklyCalendar.tsx` (357 linhas) — Grade semanal (máquinas × 7 dias)
- `AgendaView.tsx` — Cards agrupados por turno (manhã/tarde/noite)
- `JobDetailsModal.tsx` — Único modal para detalhes

**Lacunas críticas identificadas:**
1. ❌ **Sem drag & drop** (mencionado em `docs/CALENDAR.md` mas não implementado)
2. ❌ **Sem detecção visual de conflitos** (sobreposições de horário invisíveis)
3. ❌ **Sem visão mensal** nem **timeline 24h contínua** (só 07-20h fixo)
4. ❌ **Sem heatmap de ocupação** por máquina/técnica
5. ❌ **Sem agendamento rápido** (clicar em slot vazio não cria job)
6. ❌ **Sem indicador de carga/utilização** por máquina visível na agenda
7. ❌ **Sem swimlane por operador**, só por máquina
8. ❌ **Sem multi-seleção** + ações em lote diretamente na agenda
9. ❌ **Sem zoom temporal** (15min / 30min / 1h / 2h)
10. ❌ **Filtros pobres**: só "técnica" — falta status, operador, cliente, prioridade, atraso
11. ❌ **Sem busca/jump-to-job** dentro da agenda
12. ❌ **Sem export** (PDF/iCal/print) da agenda
13. ❌ **Sem pré-visualização de impacto** ao reagendar (ripple delay)
14. ❌ **Sem alertas inline**: setup time, troca de cor, deadline próximo
15. ❌ **Sem agrupamento inteligente** por técnica (52 máquinas viram parede)
16. ❌ **Sem comparativo planejado vs realizado** sobreposto
17. ❌ **Mobile**: só lista — falta swipe entre dias, gestos, FAB de criação
18. ❌ **Sem keyboard shortcuts** (←/→ dia, T hoje, N novo, F filtro, /)
19. ❌ **Sem persistência** de filtros/zoom/visão preferida (localStorage)
20. ❌ **Sem indicação de "agora"** na vista semanal (só na diária)

---

### 🎯 Plano de Melhorias — 4 Ondas Sequenciais

Cada onda é **autônoma, testável, entregável** e adere a `useSchedulingData`, máquina de estados, política 400 linhas, dark theme Task Gifts e `Icon` suffix.

---

#### **🌊 Onda 1 — Fundação UX & Inteligência de Dados** *(maior ROI, base das outras)*

1. **Refatorar `DailyCalendar.tsx`** em subcomponentes (<400 linhas):
   - `CalendarHeader.tsx` (nav + filtros)
   - `CalendarTimeline.tsx` (grid horária)
   - `CalendarMachineRow.tsx` (linha por máquina)
   - `JobBlock.tsx` (bloco visual + tooltip)
   - `CalendarLegend.tsx`

2. **Filtros avançados unificados** (`CalendarFilters.tsx` reutilizável Diária/Semanal):
   - Multi-select: técnica, máquina, operador, status, prioridade, cliente
   - Toggles: "Só com atrasos", "Só em produção", "Só meus turnos"
   - Persistência em localStorage por usuário
   - Chips removíveis + botão "Limpar"

3. **Detecção de conflitos visual**:
   - Hook `useScheduleConflicts(jobs)` — detecta sobreposições mesma máquina
   - Borda vermelha pulsante + ícone `AlertTriangle` no bloco
   - Badge contador no header: "⚠ 3 conflitos"

4. **Linha "AGORA" também na semanal** + auto-scroll inicial para hora atual.

5. **Mini-mapa de densidade** (sparkline acima do timeline mostrando carga por hora).

---

#### **🌊 Onda 2 — Interatividade Profissional**

6. **Drag & Drop** com `@dnd-kit` (já familiar ao Kanban):
   - Arrastar bloco entre máquinas/horários
   - Validação via `jobStateMachine` antes de soltar
   - Snap-to-grid (15/30/60min)
   - Preview fantasma + "ripple" mostrando jobs deslocados
   - Undo via toast (5s) — `useUndoableAction`

7. **Resize de blocos** (alça lateral) → ajusta `estimated_duration` + `end_time`.

8. **Click-to-create**: clicar em slot vazio abre `QuickJobDialog` pré-preenchido com máquina+horário.

9. **Multi-seleção + ações em lote**:
   - Shift+click ou checkbox toggle
   - Barra flutuante: "3 selecionados — [Reagendar][Mudar máquina][Excluir][Imprimir etiquetas]"

10. **Keyboard shortcuts** (`useHotkeys`):
    - `←/→` navegar dia, `Shift+←/→` semana, `T` hoje, `N` novo, `F` filtros, `/` busca, `1/2/3` timeline/agenda/mês, `Esc` deselecionar.

11. **Command palette extension** — `Cmd+K` → "Ir para job OS-2024-1234".

---

#### **🌊 Onda 3 — Visões Estratégicas Novas**

12. **Vista Mensal** (`MonthlyCalendar.tsx`) — heatmap de jobs/dia, click → vai para diária.

13. **Vista Operadores** (toggle swimlane) — agrupa por operador em vez de máquina (útil para gestores de turno).

14. **Vista Técnicas Agregada** — colapsa 52 máquinas em 16 técnicas, expand-on-click (resolve poluição visual).

15. **Heatmap de Ocupação** sobreposto (toggle): cor de fundo da célula = % ocupação (verde→amarelo→vermelho).

16. **Comparativo Planejado vs Realizado**:
    - Bloco superior = planejado (transparente)
    - Bloco inferior = realizado (sólido, baseado em `actual_start_time/actual_end_time`)
    - Indicador de desvio (+15min / -10min)

17. **Zoom temporal**: slider 15min/30min/1h/2h — afeta densidade do grid.

---

#### **🌊 Onda 4 — Mobile, Export, Polimento**

18. **Mobile-first refinements**:
    - Swipe horizontal entre dias (`useSwipeGesture` já existe)
    - Pull-to-refresh (`use-pull-to-refresh` já existe)
    - FAB "+" para criar job rápido
    - Bottom sheet para detalhes (em vez de modal)
    - Haptic feedback nas ações (`use-haptic-feedback` já existe)

19. **Export & Compartilhamento**:
    - PDF do dia/semana (jsPDF + html2canvas)
    - Export iCal (.ics) por máquina ou operador
    - Print-friendly CSS `@media print`
    - Compartilhar link de agenda filtrada

20. **Onboarding contextual** (primeira visita) — overlay com dicas sobre filtros/atalhos/drag.

21. **Skeleton loaders elegantes** substituindo spinners genéricos.

22. **Empty states com CTA** (ilustração + "Criar primeiro agendamento").

23. **Acessibilidade WCAG AA**:
    - `aria-live` em mudanças de status
    - Navegação completa por teclado nos blocos
    - Contraste 4.5:1 verificado em todos os status colors
    - Screen reader labels descritivos

---

### 📐 Detalhes Técnicos

- **Sem novas dependências críticas** — `@dnd-kit` já está no projeto (Kanban), `framer-motion` idem.
- **Reuso máximo**: `useSchedulingData`, `jobStateMachine`, `JobDetailsModal`, hooks mobile existentes.
- **Performance**: virtualização (`@tanstack/react-virtual`) na vista semanal quando >30 máquinas.
- **Realtime**: aproveitar `useRealtimeConnection` para atualizar blocos sem refresh.
- **Offline-first**: drag & drop respeita fila do `useOfflineSync`.
- **i18n**: todas as strings via `t()` (pt-BR, en-US, es-ES).
- **Logger**: `src/lib/logger.ts`, zero `console.log`.
- **Validação**: Zod nos payloads de reagendamento.
- **Testes**: ampliar suite atual (1386 testes) com casos de conflito, drag, filtros.

---

### 🚀 Recomendação de Execução

Dado seu perfil (autônomo, sequencial, perfeccionista), sugiro executar **Onda 1 primeiro** (fundação) — entrega valor imediato (filtros + conflitos + refactor crítico de 430 linhas) e desbloqueia as próximas. Após sua aprovação, sigo para Onda 2, 3 e 4 sem interrupções.

**Confirma iniciar pela Onda 1?** Posso começar agora mesmo com refactor + filtros + detecção de conflitos + linha "AGORA" semanal + mini-mapa de densidade — tudo em uma única execução contínua.

