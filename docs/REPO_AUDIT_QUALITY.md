# Auditoria do Repositório — Qualidade, Erros e Riscos Atuais

> **Nota**: este relatório **não altera** nenhum arquivo de código — apenas registra achados.

## 1) Erros de build (TypeScript)

Há múltiplos erros do tipo:

> `Module '"@testing-library/react"' has no exported member 'screen'.`

Arquivos afetados (amostra do log):
- `src/components/NavLink.test.tsx`
- `src/components/abc/ABCActivityRatesCard.test.tsx`
- `src/components/abc/__tests__/ABCActivityRatesCard.test.tsx`
- `src/components/assistant/__tests__/TechnicalAssistant.test.tsx`
- `src/components/auth/__tests__/ProtectedRoute.test.tsx`
- `src/components/jobs/__tests__/JobDetailsModal.test.tsx`
- `src/components/ui/__tests__/*` (muitos)

**Impacto**:
- impede o build/typecheck em CI.

## 2) Warnings no runtime (console)

### 2.1) Ref em Function Component
- Warning: `Function components cannot be given refs... Check the render method of JobDetailsModal.`
- Stack aponta para `JobQRCode` sendo renderizado dentro de `JobDetailsModal`.

### 2.2) Acessibilidade (DialogContent)
- Warning: `Missing Description or aria-describedby={undefined} for {DialogContent}.`
- Provável causa: `DialogDescription` não está sendo usado em alguns modais.

## 3) Duplicidades e ruído de testes/stories

Padrões encontrados na estrutura:
- Em `src/hooks/`, há diversos pares `*.test.ts` e `*.test.tsx` para o mesmo hook (ex.: `use-toast.test.ts` e `use-toast.test.tsx`).
- Em `src/components/ui/stories/`, há duplicidades por casing/nome (ex.: `Badge.stories.tsx` e `badge-lowercase.stories.tsx`, `Button.stories.tsx` e `button-lowercase.stories.tsx`).

**Impacto**:
- aumenta tempo de CI
- pode gerar conflitos/ambiguidade em Storybook

## 4) Observações de design system (somente achado)

Há uso de classes com cores diretas em alguns componentes (ex.: `bg-green-500/20`, `text-green-400` em `JobDetailsModal.tsx`).

**Impacto**:
- reduz consistência com tokens semânticos.

---

## Próximos passos (opcional, não executado)
Se você mandar “corrigir build”, eu consigo:
- padronizar imports de testes para uma única forma (ex.: remover `screen` do import ou padronizar versão/tipos)
- reduzir duplicidades de `*.test.ts` vs `*.test.tsx`
- corrigir warnings de `DialogDescription`

