# ADR-001: Supabase como Backend

## Status
Aceito

## Contexto
O sistema precisa de autenticação, banco de dados, storage e edge functions com mínimo de DevOps.

## Decisão
Usar Supabase (via Lovable Cloud) como backend completo: Auth, PostgreSQL, Storage, Edge Functions e Realtime.

## Consequências
- ✅ Zero infra para gerenciar
- ✅ RLS nativo no PostgreSQL
- ✅ Realtime out-of-the-box
- ✅ Edge Functions em Deno (TypeScript)
- ⚠️ Vendor lock-in moderado (mitigado por ser PostgreSQL padrão)
- ⚠️ Limites de 500 conexões no pooler
