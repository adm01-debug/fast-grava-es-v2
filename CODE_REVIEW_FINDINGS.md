# Code Review — fast-grava-es-v2

Data: 2026-05-28
Branch: `fix/code-review-cline-2026-05-28`
Coordenação: Cline (DeepSeek v4-pro) + Claude Code via AI-Bridge MCP.

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

A pasta `src/lib/sanitize.ts` já implementa `escapeHtml`, `stripTags`, `sanitizeText`, `sanitizeUrl` e `sanitizeControlChars` corretamente (validação por prefixo de protocolo, sem `new URL()` — não há risco de exceção).

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

- `.gitignore`: adicionadas entradas para `audit.json` e `lint.txt` (artefatos das análises rodadas durante o review, não devem ser versionados).
- Documentação dos achados acima (este arquivo).

## Verificações executadas

```powershell
npm install
npm audit --json    > audit.json   # 3 vulnerabilidades (1 alta + 2 moderadas)
npm run lint        > lint.txt     # 0 erros
npx tsc --noEmit                   # 0 erros
```

## Observações

- O repo já adota boas práticas de segurança em código (sanitização, env vars, queries tipadas no Supabase). Os pontos de exposição restantes são em dependências de terceiros.
- 14 PRs estavam abertos no momento do review (11 Dependabot, PR #18 draft do Claude, PR #22 do Claude para logger). Nenhum foi tocado nesta tarefa — limpeza de PRs será feita em tarefa separada.
