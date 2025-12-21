# Autenticação - Fast Grava ES

## Fluxo de Login
1. Usuário acessa /login
2. Insere credenciais
3. Sistema valida via Supabase Auth
4. Token JWT armazenado
5. Redirecionamento para dashboard

## Providers Suportados
- Email/Senha
- Google OAuth
- Microsoft OAuth

## Proteção de Rotas
```tsx
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

## Sessão e Refresh Token
- Token expira em 1 hora
- Refresh automático via Supabase
