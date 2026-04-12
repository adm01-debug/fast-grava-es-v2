# ADR-002: TypeScript Strict Mode

## Status
Aceito (implementado em 2026-04-12)

## Contexto
O projeto iniciou com `strict: false` para velocidade de prototipagem. Acumulou ~36 usages de `any`.

## Decisão
Habilitar `strict: true` no `tsconfig.app.json` e eliminar `any` injustificados.

## Consequências
- ✅ Null safety garante que erros de `undefined` sejam detectados em tempo de compilação
- ✅ Refatoração segura — o compilador detecta efeitos colaterais
- ✅ Documentação implícita via tipos
- ⚠️ Dynamic Supabase queries ainda requerem `as any` (aceitável — wrapper genérico)
