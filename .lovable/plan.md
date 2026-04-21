
## Análise de Gaps — Fast Gravações vs. MES Enterprise World-Class

Comparativo do **Fast Gravações** atual contra benchmarks de MES/MOM de classe mundial (Siemens Opcenter, SAP DMC, Rockwell FactoryTalk, Tulip, Plex, Dassault Apriso, Aveva MES) e padrões ISA-95 / ISO 22400.

---

### ✅ Pontos Fortes Já Maduros
Scheduling/Kanban com máquina de estados · Buffer auto-promotion · OEE/SPC/ABC · TPM · Energia · Gamificação · Bitrix24 OAuth bidirecional · Offline-first IndexedDB · i18n (pt/en/es) · RBAC + RLS · 1386 testes · Dark theme · PWA · Etiquetas térmicas · Realtime · Lovable AI

---

### 🔴 GAPS CRÍTICOS (P0 — bloqueiam classificação "world-class")

#### 1. Conformidade & Rastreabilidade Regulatória
- **Assinatura eletrônica** (21 CFR Part 11 / ANVISA) com hash + timestamp + reason
- **Audit trail imutável** (append-only, hash chain) para qualquer mudança em jobs/recipes/qualidade
- **Genealogia completa** (forward + backward traceability): lote de matéria-prima → produto final → cliente
- **Versionamento de receitas** (recipe management ISA-88) com aprovação workflow
- **e-DHR** (electronic Device History Record) gerado automaticamente por OS

#### 2. Qualidade Industrial Avançada
- **CAPA** (Corrective and Preventive Actions) — fluxo de não-conformidade com root cause (5-Why, Ishikawa)
- **NCR / Disposição** (use-as-is, rework, scrap, return-to-vendor) com aprovação multinível
- **MSA** (Measurement System Analysis) — Gage R&R, linearidade, estabilidade
- **CpK / PpK histórico** + capability dashboards por característica
- **First Article Inspection (FAI)** — AS9102 / PPAP automático
- **Inspeção por amostragem** (AQL — ANSI/ASQ Z1.4) com plano dinâmico
- **Hold/Release management** — quarentena de lotes com workflow de liberação

#### 3. Manutenção Industrial (CMMS completo)
- **MTBF / MTTR / MTTF** dashboards por máquina e componente
- **Ordem de Serviço de Manutenção** (corretiva, preventiva, preditiva) com workflow
- **Manutenção preditiva por vibração/temperatura** (modelos ML)
- **Spare parts inventory** com ponto de pedido automático
- **PM Calendar** com técnicos atribuídos e checklist digital
- **LOTO** (Lockout/Tagout) digital com permit-to-work

#### 4. Inventário & Materiais (ISA-95 Level 3)
- **Material Master** completo (BOM multinível, substituições, alternates)
- **WIP tracking** em tempo real por estação/job
- **Inventário com lote/serial** + FIFO/FEFO automático
- **Picking lists** geradas pelo MRP-light
- **Stock takes** cíclicos com PDA/scanner
- **Reservation engine** — alocação de material a jobs

#### 5. Planejamento Avançado (APS)
- **Finite Capacity Scheduling** (otimização CP-SAT / OR-Tools) — atualmente é heurístico
- **What-if simulation** — testar cenários sem afetar produção real
- **Constraint-based planning** (gargalos TOC, máquinas críticas, operadores qualificados)
- **Multi-site scheduling** (caso expanda para outras unidades)
- **Forward/backward scheduling** baseado em data de entrega
- **Sequenciamento por changeover** (matriz de setup time entre técnicas/cores)
