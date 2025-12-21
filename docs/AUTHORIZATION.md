# Autorização - Fast Grava ES

## Roles
- admin: Acesso total
- supervisor: Gestão de operadores
- operator: Registro de produção
- viewer: Somente leitura

## Permissões
```ts
const permissions = {
  admin: ['*'],
  supervisor: ['read', 'write', 'manage_operators'],
  operator: ['read', 'write_production'],
  viewer: ['read']
};
```

## Uso
```tsx
<PermissionGate permission="manage_operators">
  <OperatorsPage />
</PermissionGate>
```
