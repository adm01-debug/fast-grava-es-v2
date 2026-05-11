# 📋 Plano de Melhorias Completo — Fast-Grava-ES

> **Data da Análise:** 27/12/2024  
> **Escopo:** Análise exaustiva do repositório com foco em qualidade, performance, segurança e UX

---

## 📊 Resumo Executivo

| Categoria | Itens Críticos | Itens Importantes | Itens Desejáveis |
|-----------|---------------|-------------------|------------------|
| Build/TypeScript | 3 | 5 | 2 |
| Design System | 2 | 8 | 15 |
| Acessibilidade | 5 | 10 | 8 |
| Performance | 4 | 6 | 10 |
| Testes | 2 | 8 | 5 |
| Segurança | 3 | 4 | 2 |
| UX/UI | 5 | 12 | 20 |
| Manutenibilidade | 4 | 10 | 8 |
| **TOTAL** | **28** | **63** | **70** |

---

## 🔴 CRÍTICO — Correções Imediatas

### 1. Erros de Build TypeScript
**Prioridade:** P0 (Bloqueia CI/CD)  
**Esforço:** Médio (2-4h)

#### 1.1 Imports de `@testing-library/react`
```
Erro: Module '"@testing-library/react"' has no exported member 'screen'.
```

**Arquivos afetados (176+ arquivos):**
- `src/components/NavLink.test.tsx`
- `src/components/abc/ABCActivityRatesCard.test.tsx`
- `src/components/abc/__tests__/ABCActivityRatesCard.test.tsx`
- `src/components/assistant/__tests__/TechnicalAssistant.test.tsx`
- `src/components/auth/__tests__/ProtectedRoute.test.tsx`
- Todos os `*.test.tsx` em `src/components/ui/__tests__/`

**Solução:**
```typescript
// ❌ Atual (incorreto)
import { render, screen } from '@testing-library/react';

// ✅ Corrigido
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
```

**Implementação:**
- [ ] Atualizar todos os imports de `screen` para `@testing-library/dom`
- [ ] Verificar compatibilidade de versões no `package.json`
- [ ] Executar `npm run build` para validar correção

---

### 2. Warning de Ref em Function Component
**Prioridade:** P0 (Runtime Warning)  
**Esforço:** Baixo (30min)

```
Warning: Function components cannot be given refs. 
Check the render method of JobDetailsModal.
```

**Causa:** `JobQRCode` é renderizado dentro de `JobDetailsModal` sem `forwardRef`.

**Arquivo:** `src/components/qrcode/JobQRCode.tsx`

**Solução:**
```typescript
// ❌ Atual
export const JobQRCode = ({ jobId, ... }: JobQRCodeProps) => { ... }

// ✅ Corrigido
import { forwardRef } from 'react';

export const JobQRCode = forwardRef<HTMLDivElement, JobQRCodeProps>(
  ({ jobId, ... }, ref) => (
    <Card ref={ref} className="w-fit">
      ...
    </Card>
  )
);
JobQRCode.displayName = 'JobQRCode';
```

---

### 3. Warning de Acessibilidade — DialogDescription Ausente
**Prioridade:** P0 (A11y Critical)  
**Esforço:** Médio (1-2h)

```
Warning: Missing Description or aria-describedby={undefined} for {DialogContent}.
```

**Arquivos afetados:**
- `src/components/jobs/JobDetailsModal.tsx` ← **NÃO TEM DialogDescription**
- Diversos modais em `src/components/operators/`
- Modais em `src/components/shift/`

**Solução para `JobDetailsModal.tsx`:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Adicionar após DialogTitle:
<DialogDescription className="sr-only">
  Detalhes do trabalho {job.order_number}
</DialogDescription>
```

**Implementação:**
- [ ] Auditar TODOS os usos de `DialogContent` no projeto
- [ ] Adicionar `DialogDescription` (visível ou `sr-only`)
- [ ] Executar teste de acessibilidade com axe-core

---

## 🟠 IMPORTANTE — Design System e Tokens

### 4. Uso de Cores Hardcoded (66 arquivos)
**Prioridade:** P1  
**Esforço:** Alto (8-16h)

**Problema:** 1559 ocorrências de classes Tailwind com cores diretas violando o design system.

**Exemplos encontrados:**
```typescript
// ❌ Hardcoded (NÃO usar)
'bg-green-500/20 text-green-400 border-green-500/30'
'bg-orange-500/20 text-orange-400 border-orange-500/30'
'bg-cyan-500/20'
'text-blue-500'
'text-purple-500'
```

**Arquivos mais afetados:**
| Arquivo | Ocorrências |
|---------|------------|
| `src/components/jobs/JobDetailsModal.tsx` | 25+ |
| `src/components/reliability/MTBFMTTRWidget.tsx` | 15+ |
| `src/pages/OEEDashboard.tsx` | 20+ |
| `src/components/traceability/LotGenealogyView.tsx` | 12+ |
| `src/components/oee/*.tsx` | 30+ |

**Solução:**
1. Criar tokens semânticos no `index.css`:
```css
:root {
  /* Status Colors (além dos existentes) */
  --indicator-success: 160 84% 39%;
  --indicator-warning: 38 92% 50%;
  --indicator-danger: 0 72% 51%;
  --indicator-info: 206 100% 50%;
  --indicator-neutral: 220 14% 50%;
  
  /* Priority Colors */
  --priority-urgent: 0 72% 51%;
  --priority-high: 24 95% 53%;
  --priority-medium: 38 92% 50%;
  --priority-low: 160 84% 39%;
  
  /* Accent Variations */
  --accent-cyan: 192 91% 36%;
  --accent-purple: 262 83% 58%;
  --accent-orange: 24 95% 53%;
  --accent-pink: 330 81% 60%;
}
```

2. Atualizar `tailwind.config.ts` com os novos tokens

3. Refatorar componentes para usar tokens

**Implementação:**
- [ ] Fase 1: Definir tokens completos em `index.css`
- [ ] Fase 2: Registrar tokens em `tailwind.config.ts`
- [ ] Fase 3: Refatorar `JobDetailsModal.tsx`
- [ ] Fase 4: Refatorar demais componentes (por ordem de impacto)

---

### 5. Duplicidade de Arquivos de Teste
**Prioridade:** P1  
**Esforço:** Médio (2-4h)

**Problema:** Hooks com 2 arquivos de teste (`.test.ts` E `.test.tsx`)

**Arquivos duplicados identificados (70+ pares):**
```
src/hooks/use-toast.test.ts
src/hooks/use-toast.test.tsx

src/hooks/useABCCosts.test.ts
src/hooks/useABCCosts.test.tsx

src/hooks/useAlertCount.test.ts
src/hooks/useAlertCount.test.tsx

src/hooks/useAuditLog.test.ts
src/hooks/useAuditLog.test.tsx

... (todos os hooks em src/hooks/)
```

**Impacto:**
- Tempo de CI duplicado
- Possíveis conflitos de cobertura
- Manutenção dobrada

**Solução:**
- [ ] Manter APENAS arquivos `.test.tsx` (suportam ambos os cenários)
- [ ] Deletar todos os `.test.ts` duplicados
- [ ] Validar cobertura após remoção

---

### 6. Duplicidade de Stories no Storybook
**Prioridade:** P1  
**Esforço:** Baixo (1h)

**Problema:** Stories duplicadas por casing/convenção de nome

**Exemplos:**
```
src/components/ui/stories/Badge.stories.tsx
src/stories/ui/badge-lowercase.stories.tsx

src/components/ui/stories/Button.stories.tsx
src/stories/ui/button-lowercase.stories.tsx
```

**Solução:**
- [ ] Consolidar todas as stories em `src/components/ui/stories/`
- [ ] Deletar stories duplicadas em `src/stories/ui/`
- [ ] Padronizar nomenclatura: `ComponentName.stories.tsx`

---

## 🟡 MELHORIAS — UX e Performance

### 7. Melhorias de Componentes UI
**Prioridade:** P2  
**Esforço:** Variável

#### 7.1 Cards com Glassmorphism
**Arquivo:** `src/components/ui/card.tsx`

```typescript
// Adicionar variante glass
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        glass: "bg-card/80 backdrop-blur-md border-border/50",
        elevated: "shadow-lg hover:shadow-xl transition-shadow",
      }
    },
    defaultVariants: {
      variant: "default",
    }
  }
);
```

#### 7.2 Sidebar com Hover Effects
**Arquivo:** `src/components/layout/AppSidebar.tsx`

- [ ] Adicionar animações de hover
- [ ] Ícones com animação de scale
- [ ] Indicador visual de item ativo mais proeminente

#### 7.3 Tabelas com Zebra Striping
**Arquivo:** `src/components/ui/table.tsx`

```typescript
// TableRow atualizado
<TableRow className="even:bg-muted/50 hover:bg-muted/80 transition-colors">
```

#### 7.4 Botões com Feedback Visual
**Arquivo:** `src/components/ui/button.tsx`

- [ ] Adicionar `active:scale-[0.98]` para feedback tátil
- [ ] Melhorar estados de loading
- [ ] Adicionar variante `premium` com gradient

---

### 8. Melhorias de Acessibilidade Adicionais
**Prioridade:** P2  
**Esforço:** Médio

#### 8.1 Skip Links
```typescript
// Adicionar em MainLayout.tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
  Pular para conteúdo principal
</a>
```

#### 8.2 Focus Visible Consistente
```css
/* index.css */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

#### 8.3 ARIA Labels Ausentes
Auditar e corrigir:
- [ ] Ícones interativos sem `aria-label`
- [ ] Gráficos sem descrição alternativa
- [ ] Inputs sem labels associadas

---

### 9. Melhorias de Performance
**Prioridade:** P2  
**Esforço:** Alto

#### 9.1 Code Splitting por Rota
```typescript
// App.tsx - usar React.lazy()
const OEEDashboard = lazy(() => import('./pages/OEEDashboard'));
const TPMDashboard = lazy(() => import('./pages/TPMDashboard'));
```

#### 9.2 Virtualização de Listas Longas
Implementar `@tanstack/react-virtual` em:
- [ ] `src/components/jobs/` - lista de jobs
- [ ] `src/components/operators/` - lista de operadores
- [ ] `src/pages/TraceabilityPage.tsx` - tabela de lotes

#### 9.3 Memoização de Componentes Pesados
```typescript
// Exemplo
const MemoizedOEEChart = memo(OEEChart, (prev, next) => 
  prev.data === next.data && prev.period === next.period
);
```

#### 9.4 Debounce em Inputs de Busca
Garantir que todos os campos de busca usem `useDebounce`:
```typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);
```

---

### 10. Internacionalização (i18n)
**Prioridade:** P2  
**Esforço:** Alto

#### 10.1 Chaves Faltantes
Auditar todos os arquivos de tradução:
- `src/i18n/locales/pt-BR.json`
- `src/i18n/locales/en-US.json`
- `src/i18n/locales/es-ES.json`

#### 10.2 Textos Hardcoded
Buscar e substituir textos hardcoded por chaves i18n:
```typescript
// ❌ Hardcoded
<Button>Salvar</Button>

// ✅ i18n
<Button>{t('common.save')}</Button>
```

---

## 🔵 DESEJÁVEL — Melhorias Futuras

### 11. Documentação de Componentes
- [ ] JSDoc em todos os componentes exportados
- [ ] Exemplos de uso em cada story
- [ ] README.md por módulo

### 12. Cobertura de Testes
- [ ] Meta: >80% de cobertura
- [ ] Testes E2E para fluxos críticos
- [ ] Testes de snapshot para UI

### 13. Monitoramento e Observabilidade
- [ ] Integração completa com Sentry
- [ ] Custom metrics para Web Vitals
- [ ] Dashboards de performance

### 14. PWA Enhancements
- [ ] Background sync aprimorado
- [ ] Push notifications completas
- [ ] Offline-first para dados críticos

### 15. SEO e Meta Tags
- [ ] React Helmet em todas as páginas
- [ ] Open Graph tags
- [ ] Sitemap dinâmico

---

## 📅 Cronograma de Implementação

### Sprint 1 (Semana 1) — CRÍTICO
| ID | Tarefa | Esforço | Status |
|----|--------|---------|--------|
| 1.1 | Corrigir imports testing-library | 4h | ✅ DONE |
| 2 | Adicionar forwardRef ao JobQRCode | 30min | ✅ DONE |
| 3 | Adicionar DialogDescription nos modais | 2h | ✅ DONE |

### Sprint 2 (Semana 2) — Design System
| ID | Tarefa | Esforço | Status |
|----|--------|---------|--------|
| 4.1 | Definir tokens de cor em index.css | 2h | ✅ DONE |
| 4.2 | Registrar tokens em tailwind.config.ts | 1h | ✅ DONE |
| 4.3 | Refatorar JobDetailsModal.tsx | 2h | ✅ DONE |
| 4.4 | Refatorar MTBFMTTRWidget.tsx | 2h | ✅ DONE |
| 4.5 | Refatorar OEEDashboard.tsx | 3h | ✅ DONE |

### Sprint 3 (Semana 3) — Limpeza
| ID | Tarefa | Esforço | Status |
|----|--------|---------|--------|
| 5 | Remover testes .test.ts duplicados | 2h | ⬜ TODO |
| 6 | Consolidar stories duplicadas | 1h | ⬜ TODO |

### Sprint 4 (Semana 4) — UX
| ID | Tarefa | Esforço | Status |
|----|--------|---------|--------|
| 7.1 | Card glassmorphism variant | 1h | ⬜ TODO |
| 7.2 | Sidebar hover effects | 2h | ⬜ TODO |
| 7.3 | Table zebra striping | 30min | ⬜ TODO |
| 7.4 | Button feedback | 1h | ⬜ TODO |

### Sprint 5+ (Contínuo) — Performance & A11y
| ID | Tarefa | Esforço | Status |
|----|--------|---------|--------|
| 8.1 | Skip links | 30min | ✅ DONE |
| 8.2 | Focus visible | 30min | ✅ DONE |
| 9.1 | Code splitting | 4h | ✅ DONE |
| 9.2 | Virtualização | 8h | ⬜ TODO |

---

## 📝 Checklist Final de Qualidade

Antes de considerar completo:

### Build & CI
- [ ] `npm run build` sem erros
- [ ] `npm run lint` sem warnings
- [ ] `npm run test` todos passando
- [ ] CI/CD pipeline verde

### Design System
- [ ] Zero cores hardcoded (exceto design tokens)
- [ ] Dark mode funcional em todas as páginas
- [ ] Responsividade testada (mobile, tablet, desktop)

### Acessibilidade
- [ ] Score axe-core > 90
- [ ] Navegação por teclado funcional
- [ ] Screen reader tested

### Performance
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle size < 500KB (gzipped)

---

## 📎 Referências

- [REPO_AUDIT_QUALITY.md](./REPO_AUDIT_QUALITY.md) — Auditoria anterior
- [REPO_AUDIT_STRUCTURE.md](./REPO_AUDIT_STRUCTURE.md) — Inventário estrutural
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Arquitetura do sistema

---

> **Última atualização:** 27/12/2024  
> **Autor:** Lovable AI  
> **Versão:** 1.0.0
