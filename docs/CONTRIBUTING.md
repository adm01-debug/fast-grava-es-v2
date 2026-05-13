# 🤝 Guia de Contribuição

## Como Contribuir

1. Fork o repositório
2. Crie branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'feat: adiciona feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra Pull Request

## Conventional Commits
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

## Padrões de Código
- ESLint + Prettier
- TypeScript strict mode
- Testes com Vitest
- Mínimo 80% cobertura

## Estrutura de Branch
- `main` - Produção
- `develop` - Desenvolvimento
- `feature/*` - Features
- `fix/*` - Correções

## Code Review
- Mínimo 1 aprovação
- Checks passando
- Sem conflitos

## Fluxo de Hotfix
1. Criar branch `hotfix/*` a partir da `main`.
2. Implementar correção e testes.
3. Merge para `main` e `develop`.
4. Deletar branch.

## Incident Post-Mortem
Todo incidente em produção deve gerar um post-mortem documentando:
- O que aconteceu
- Impacto
- Causa raiz
- Ações para evitar recorrência

