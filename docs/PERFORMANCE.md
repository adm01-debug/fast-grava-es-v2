# ⚡ Guia de Performance

## Otimizações

### Frontend
- Code splitting por rota
- Lazy loading componentes
- Virtualização de listas
- Debounce em buscas
- Memoização (useMemo/useCallback)

### Queries
- TanStack Query cache
- Stale time: 5min
- Prefetch de dados
- Optimistic updates

### Build
- Tree shaking
- Minificação
- Gzip/Brotli

## Métricas Alvo
| Métrica | Alvo |
|---------|------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| TTI | < 3s |

## Monitoramento
- Web Vitals
- Lighthouse CI
- Bundle analyzer
