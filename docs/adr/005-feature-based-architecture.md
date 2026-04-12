# ADR-005: Arquitetura Feature-Based

## Status
Aceito

## Contexto
O sistema cresceu para 400+ funcionalidades. Precisamos de organização previsível.

## Decisão
Estrutura de pastas por camada funcional:
```
src/
├── components/    # UI Components (por domínio: kanban/, operators/, maintenance/)
├── hooks/         # Custom hooks (por domínio: abc/, scheduling/)
├── services/      # Camada de serviço (auth, jobs, machines, energy)
├── schemas/       # Validação Zod (job, operator, machine, maintenance)
├── constants/     # Enums, thresholds, configurações
├── contexts/      # React contexts (Auth, Theme, Offline)
├── pages/         # Componentes de rota
└── lib/           # Utilitários genéricos (logger, errorHandling, pdf)
```

## Consequências
- ✅ Novo dev encontra código em < 30s
- ✅ Imports organizados por `@/` alias
- ⚠️ Componentes grandes (DesignSystemPage) precisam ser quebrados
