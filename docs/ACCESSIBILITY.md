# Acessibilidade - Fast Grava ES

## Padrões WCAG 2.1

### Nível A (Obrigatório)
- Alternativas textuais para imagens
- Legendas para vídeos
- Navegação por teclado
- Foco visível

### Nível AA (Recomendado)
- Contraste mínimo 4.5:1
- Redimensionamento de texto
- Múltiplas formas de navegação

## Componentes Acessíveis

### Uso de ARIA
```tsx
<button aria-label="Fechar modal" aria-expanded={isOpen}>
  <XIcon />
</button>
```

### Focus Management
```tsx
useFocusTrap(modalRef);
```

## Testes de Acessibilidade
- axe-core integrado nos testes
- Testes manuais com NVDA/VoiceOver
