
## Roadmap Executivo — Fast Gravações rumo a 10/10 World-Class MES

Execução autônoma e sequencial de **16 entregas** organizadas em 5 ondas, fechando os gaps P0/P1/P2 identificados. Cada entrega é atômica, testável e respeita os padrões: 400 linhas/arquivo, TypeScript strict, Zod, RLS, i18n, logger, dark theme Task Gifts, sufixo `Icon` no Lucide.

---

### 🌊 ONDA 1 — Compliance & Rastreabilidade Regulatória (P0 #1)

**E1. Audit Trail Imutável (hash chain)**
- Migration: tabela `audit_log` (append-only, trigger BEFORE UPDATE/DELETE bloqueia)
- Colunas: `id`, `entity_type`, `entity_id`, `action`, `actor_id`, `old_data`, `new_data`, `hash`, `previous_hash`, `created_at`
- Função `compute_audit_hash()` em PL/pgSQL (sha256 do payload + previous_hash)
- Trigger genérico `audit_trigger()` aplicado em `jobs`, `production_lots`, `lot_components`, `lot_quality_inspections`
- Hook `useAuditTrail(entityType, entityId)` + componente `AuditTrailDrawer.tsx`
- Página `/audit` com filtros (entidade, usuário, período) + verificação de integridade da chain

**E2. Assinatura Eletrônica (21 CFR Part 11)**
- Migration: tabela `electronic_signatures` (`record_id`, `record_type`, `signer_id`, `meaning`, `reason`, `signed_hash`, `signed_at`)
- Componente `ESignatureDialog.tsx` (re-autenticação por senha + motivo + significado)
- Edge function `verify-signature` para validação server-side
- Hook `useElectronicSignature` + integração em pontos críticos (liberação de lote, mudança de receita, aprovação de NCR)

**E3. Genealogia Completa (Forward + Backward)**
- Aproveita tabelas `production_lots` e `lot_components` existentes
- Edge function `lot-genealogy` (busca recursiva CTE)
- Componente `GenealogyTree.tsx` (visualização em árvore com d3-hierarchy ou react-flow)
- Página `/traceability/genealogy/:lotId` com toggle Forward/Backward + export PDF
- Recall simulator: "se este lote tem problema, quais clientes são afetados?"

**E4. Recipe Management ISA-88**
- Migrations: `recipes`, `recipe_versions`, `recipe_steps`, `recipe_approvals`
- Workflow: draft → review → approved → active (uma versão ativa por receita)
- Página `/engineering/recipes` com diff visual entre versões
- Assinatura eletrônica obrigatória na aprovação (integra E2)

---

### 🌊 ONDA 2 — Qualidade Industrial Avançada (P0 #2)

**E5. CAPA + NCR (Não-Conformidade)**
- Migrations: `non_conformities`, `capa_actions`, `ncr_dispositions`
- Workflow NCR: identificação → contenção → análise (5-Why/Ishikawa) → disposição (use-as-is/rework/scrap/RTV) → aprovação multinível
- CAPA: ação corretiva + ação preventiva + verificação de eficácia
- Componentes: `NCRForm.tsx`, `FiveWhyAnalysis.tsx`, `IshikawaDiagram.tsx`, `CAPADashboard.tsx`
- Página `/quality/capa` + integração com `production_lots` (Hold automático)

**E6. Hold/Release Management**
- Coluna `quality_status` em `production_lots` (released | hold | quarantine | rejected)
- Componente `LotHoldRelease.tsx` com workflow + assinatura eletrônica
- Bloqueio automático de movimentação se status ≠ released
- Dashboard de lotes em quarentena

**E7. AQL Sampling + CpK/PpK Histórico**
- Tabela `quality_inspection_plans` com plano dinâmico (tightened/normal/reduced)
- Lookup tables ANSI/ASQ Z1.4 hardcoded em `src/lib/aqlTables.ts`
- Hook `useCapabilityIndices` calcula CpK/PpK por característica e período
- Página `/quality/capability` com gráficos histórico (Recharts)

---

### 🌊 ONDA 3 — Materiais & Inventário (P0 #4)

**E8. Material Master + BOM Multinível**
- Migrations: `materials`, `material_categories`, `bill_of_materials`, `bom_items`
- BOM com substituições (`alternates` jsonb) e where-used queries
- Página `/materials` (CRUD) + `/materials/bom/:productId` (árvore expansível)
- Import CSV de materiais

**E9. Inventário Lote/Serial + FIFO/FEFO**
- Migrations: `inventory_locations`, `inventory_balances`, `inventory_transactions`
- Cada saldo vinculado a `production_lots` (rastreabilidade total)
- Algoritmo FIFO/FEFO automático no consumo (function `consume_material(material_id, qty)`)
- Página `/inventory` com filtros por localização, lote, expiry

**E10. Picking Lists + Reservation Engine**
- Migration: `material_reservations` (hard/soft, vinculado a `jobs`)
- Edge function `generate-picking-list` (consolida materiais por job + sugere lotes via FEFO)
- Componente `PickingList.tsx` para impressão térmica
- Liberação automática de reserva ao concluir job

---

### 🌊 ONDA 4 — Manutenção Industrial (P0 #3) + APS Avançado (P0 #5)

**E11. CMMS Completo (MTBF/MTTR + Work Orders)**
- Migrations: `maintenance_work_orders`, `maintenance_failures`, `spare_parts`, `spare_parts_usage`
- Tipos: corretiva, preventiva, preditiva
- Cálculo MTBF/MTTR por máquina via view materializada
- Página `/maintenance/work-orders` (Kanban) + `/maintenance/dashboards` (MTBF/MTTR)
- Spare parts com ROP/EOQ + alerta de reposição

**E12. LOTO Digital (Permit-to-Work)**
- Migration: `loto_permits`
- Workflow: solicitação → aprovação → execução → liberação
- Assinatura eletrônica obrigatória (integra E2)
- Bloqueio da máquina no scheduling enquanto LOTO ativo

**E13. APS com Setup Matrix + What-If**
- Migration: `setup_time_matrix` (technique_from × technique_to → setup_minutes; cor × cor)
- Algoritmo de sequenciamento minimiza setups (greedy + 2-opt local search)
- Componente `WhatIfSimulator.tsx` — clona scheduling em sandbox, mostra impacto (delivery dates, OEE projetado)
- Botão "Aplicar cenário" persiste mudanças com audit trail

---

### 🌊 ONDA 5 — Custos, Engenharia, Skills, Portais (P1)

**E14. Job Costing Real-Time + Margem por OS**
- Migrations: `cost_centers`, `labor_rates`, `overhead_rates`, `job_cost_snapshots`
- Cálculo automático: material (do BOM) + MOD (do timesheet) + MOH (rate × tempo) + energia (do módulo existente)
- Componente `JobCostingDashboard.tsx` com waterfall chart (orçado → real → variance)
- Margem por OS calculada com receita do Bitrix24

**E15. Skills Matrix + Qualificação para Operação**
- Migrations: `skills`, `operator_skills`, `skill_requirements` (por máquina/técnica)
- Bloqueio no scheduling: operador não-qualificado não recebe job
- Página `/people/skills-matrix` (heatmap operadores × skills)
- Workflow de certificação com validade

**E16. Portal do Cliente (aprovação digital + status OS)**
- Edge function `customer-portal-auth` (magic link via Resend, sem senha)
- Página pública `/portal/orders/:token` com status real-time, aprovação de provas, chat
- Integração com Bitrix24 (status sync bidirecional já existe)
- Notificações automáticas a cada mudança de status

---

### 📐 Padrões em TODAS as Entregas
- Migrations sempre via `supabase migrations` com RLS desde o início
- Audit trigger (E1) aplicado a TODAS as novas tabelas críticas
- Tipos TypeScript via auto-gen (`src/integrations/supabase/types.ts`)
- Zod schemas em `src/lib/schemas/` para todo payload
- Hooks centralizados em `src/hooks/` reusam React Query + realtime
- Componentes em `src/components/<modulo>/` respeitando 400 linhas
- i18n: chaves em `src/i18n/locales/{pt,en,es}.json`
- Logger `src/lib/logger.ts`, zero `console.log`
- Dark theme: tokens HSL semânticos do `index.css`
- Testes: ampliar suite (1386+) com cases por entrega

### 🔄 Fluxo de Execução
1. Cada entrega: migration (se aplicável) → tipos → hooks → componentes → página → rota → sidebar → i18n
2. Após cada entrega: `tsc --noEmit` para validar tipos
3. Após cada onda: rodar testes + checklist visual
4. Ao final da E16: relatório de score atualizado (alvo: 8.5+/10)

### 📊 Score Esperado Pós-Execução

| Dimensão | Antes | Depois |
|---|---|---|
| Rastreabilidade/Compliance | 3.0 | **9.5** |
| Qualidade (SPC/CAPA/AQL) | 6.5 | **9.0** |
| Materiais/Inventário | 2.0 | **8.5** |
| Manutenção (CMMS) | 5.0 | **8.5** |
| APS (Planejamento) | 5.0 | **8.5** |
| Custos/Finanças | 4.0 | **8.0** |
| People/Skills | 6.0 | **8.5** |
| **MÉDIA GERAL** | **5.1** | **8.7** |

Restante para 10/10 (PLM full, Mobile nativo, BI self-service, ESG, SSO SAML, Computer Vision) fica como Onda 6 opcional pós-validação destas 16 entregas.

**Aprove para iniciar imediatamente pela E1 (Audit Trail Imutável) e seguir sequencialmente até E16 sem pausas.**
