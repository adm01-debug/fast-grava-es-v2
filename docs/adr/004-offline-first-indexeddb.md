# ADR-004: Offline-First com IndexedDB

## Status
Aceito

## Contexto
Operadores trabalham em ambiente industrial com conectividade instável. Precisam registrar produção sem depender de internet.

## Decisão
- IndexedDB (`fastgravacoes_offline`) para cache local de jobs, máquinas, técnicas
- Ações pendentes em localStorage (`fastgravacoes_pending_actions`)
- Sync periódica com backoff exponencial
- Service Worker (Workbox) para cache de assets

## Consequências
- ✅ Operadores nunca param por falta de internet
- ✅ Dados sincronizados automaticamente ao reconectar
- ⚠️ Conflitos de concorrência resolvidos por "last write wins"
- ⚠️ IndexedDB tem limite de ~50MB por origin
