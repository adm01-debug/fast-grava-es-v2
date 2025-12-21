# 🚀 Guia de Deploy

## Ambientes
- **Development** - Local
- **Staging** - Preview
- **Production** - Produção

## Deploy Local
```bash
npm install
cp .env.example .env
npm run dev
```

## Deploy Vercel
1. Conecte repositório
2. Configure variáveis
3. Deploy automático via push

### Variáveis Necessárias
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Deploy Supabase

### Migrations
```bash
supabase db push
supabase migration new nome
```

### Edge Functions
```bash
supabase functions deploy nome-funcao
```

## Checklist
- [ ] Testes passando
- [ ] Build sem erros
- [ ] Variáveis configuradas
- [ ] Migrations aplicadas
