# 🧪 Guia de Testes

## Estrutura
```
src/
├── hooks/
│   ├── useJobs.ts
│   └── useJobs.test.ts
└── lib/
    ├── utils.ts
    └── utils.test.ts
```

## Comandos
```bash
npm test              # Todos os testes
npm test -- --coverage # Com cobertura
npm test -- --watch   # Watch mode
```

## Padrão de Testes

### Hooks
```typescript
import { renderHook, waitFor } from '@testing-library/react';

describe('useHook', () => {
  it('should...', async () => {
    const { result } = renderHook(() => useHook());
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

### Componentes
```typescript
import { render, screen } from '@testing-library/react';

it('should render', () => {
  render(<Component />);
  expect(screen.getByText('...')).toBeInTheDocument();
});
```

## Cobertura Mínima
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%
