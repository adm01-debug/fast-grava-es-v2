# ADR-003: RBAC via user_roles + RLS

## Status
Aceito

## Contexto
O sistema tem 3 roles: coordinator, operator, manager. Precisamos restringir acesso a dados e funcionalidades.

## Decisão
- Roles em tabela separada `user_roles` (nunca no profiles)
- Função `has_role()` com `SECURITY DEFINER` para evitar recursão RLS
- RLS em 100% das tabelas com dados sensíveis
- Frontend usa `ProtectedRoute` para guard de rotas

## Consequências
- ✅ Impossível privilege escalation (role não está no JWT do cliente)
- ✅ has_role() é imune a recursão de políticas
- ✅ Mesmo que o frontend seja comprometido, o DB rejeita operações
- ⚠️ Cada nova tabela precisa de RLS policies (checklist no PR template)
