# Validação

## Zod Schemas
```ts
const jobSchema = z.object({
  orderNumber: z.string().min(1),
  quantity: z.number().positive(),
  client: z.string(),
});
```

## Form Validation
```tsx
const form = useForm({
  resolver: zodResolver(jobSchema),
});
```
