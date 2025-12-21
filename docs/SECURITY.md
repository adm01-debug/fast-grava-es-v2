# 🔒 Políticas de Segurança

## Autenticação
- Supabase Auth
- JWT tokens
- Refresh automático

## Autorização
- Row Level Security (RLS)
- Políticas por usuário
- RBAC (Role-Based Access Control)

## Boas Práticas
1. Nunca commitar secrets
2. Usar variáveis de ambiente
3. Validar inputs (Zod)
4. Sanitizar outputs
5. HTTPS obrigatório

## Proteções Implementadas
- XSS Prevention
- CSRF Tokens
- SQL Injection (RLS)
- Rate Limiting
- Input Validation

## Reportar Vulnerabilidades
Email: security@fastgrava.com

## Checklist
- [x] RLS em todas tabelas
- [x] Inputs validados (Zod)
- [x] Secrets em env vars
- [x] CORS configurado
- [ ] WAF configurado
