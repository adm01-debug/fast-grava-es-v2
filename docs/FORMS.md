# Formulários

## Biblioteca
- react-hook-form
- zod para validação

## Exemplo
```tsx
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const form = useForm({ resolver: zodResolver(schema) });
```
