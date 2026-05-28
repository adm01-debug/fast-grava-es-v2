# Code Review — fast-grava-es-v2

Data: 2026-05-28
Coordenação: Cline (DeepSeek v4-pro) + Claude Code via AI-Bridge MCP.

> **Nota:** este arquivo substitui a versão anterior commitada no PR #23, que continha achados de código que não puderam ser verificados (`sanitize.ts` não usa `new URL()`; `cryptoService.ts` não existe no repo). Os achados de `npm audit` abaixo foram confirmados.

## Resumo

| Categoria | Status |
|---|---|
| Secrets / API keys hardcoded | 0 achados ✅ |
| XSS (`dangerouslySetInnerHTML`, `eval`, `innerHTML`) | 0 achados ✅ |
| SQL injection (queries Supabase) | 0 achados ✅ |
| `.env` commitado com valores reais | 0 ✅ |
| Lint (`npm run lint`) | 0 erros ✅ |
| TypeScript (`npx tsc --noEmit`) | 0 erros ✅ |
| `npm audit` | 0 críticas, 1 alta, 2 moderadas |

A pasta `src/lib/sanitize.ts` já implementa `escapeHtml`, `stripTags`, `sanitizeText`, `sanitizeUrl` e `sanitizeControlChars` corretamente — `sanitizeUrl` valida por prefixo de protocolo (`http://`, `https://`, `mailto:`, `tel:`, `/`, `#`, `.`) e bloqueia `javascript:`/`data:`/`vbscript:`, sem usar `new URL()`. Não há risco de exceção.

## Achados pendentes (requerem decisão humana)

### [ALTO] `xlsx@0.18.5` — Prototype Pollution + ReDoS
- CVEs: GHSA-4r6h-8v6p-xvw6 (Prototype Pollution) e GHSA-5pgg-2g8v-p4x9 (ReDoS).
- Biblioteca abandonada; não há versão corrigida no NPM.
- **Recomendação:** migrar para [`exceljs`](https://www.npmjs.com/package/exceljs) ou [`xlsx-js-style`](https://www.npmjs.com/package/xlsx-js-style). Migração exige reescrever os pontos que importam `xlsx` (planilhas/exportação).

### [MÉDIO] `vite@6.x` — Path Traversal em `.map`
- CVE: GHSA-4w7w-66w2-5vf9.
- Correção disponível em `vite@8.0.14`.
- **Recomendação:** atualizar para `vite@7+` ou `vite@8` quando for possível assumir a major version (PR #9 do Dependabot já está aberto propondo `vite 5→8`).

## Cleanup aplicado neste PR

- Removidos `audit.json` e `lint.txt` (artefatos das análises rodadas durante o review, não devem ser versionados).
- `.gitignore`: adicionadas entradas para `audit.json` e `lint.txt`.
- `CODE_REVIEW_FINDINGS.md` reescrito sem os 2 achados de código não-verificados.

## Verificações executadas

```powershell
npm install
npm audit --json    > audit.json   # 3 vulnerabilidades (1 alta + 2 moderadas)
npm run lint        > lint.txt     # 0 erros
npx tsc --noEmit                   # 0 erros
```

## Observações

- O repo já adota boas práticas de segurança em código (sanitização, env vars, queries tipadas no Supabase). Os pontos de exposição restantes são em dependências de terceiros.
- Triagem de PRs em aberto (11 Dependabot, #18 e #22 do Claude) é tarefa separada.
