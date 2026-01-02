import { z } from 'zod';

export const gravacaoSchema = z.object({
  codigo: z.string().min(1),
  cliente_nome: z.string().min(1),
  produto: z.string().min(1),
  quantidade: z.coerce.number().int().positive(),
  tipo_gravacao: z.enum(['laser', 'serigrafia', 'sublimacao', 'bordado', 'uv']),
  cores: z.coerce.number().int().min(1).max(10).default(1),
  status: z.enum(['aguardando_arte', 'arte_aprovada', 'em_producao', 'finalizado', 'entregue']).default('aguardando_arte'),
  data_entrega: z.string().optional(),
  valor_unitario: z.coerce.number().positive().optional(),
  observacoes: z.string().optional(),
});

export const fastGravaImportTemplates = {
  gravacoes: [
    { key: 'codigo', label: 'Código', example: 'GRV-001' },
    { key: 'cliente_nome', label: 'Cliente', example: 'Cliente X' },
    { key: 'produto', label: 'Produto', example: 'Caneca' },
    { key: 'quantidade', label: 'Quantidade', example: '100' },
    { key: 'tipo_gravacao', label: 'Tipo', example: 'laser' },
  ],
};

export const fastGravaFilterConfigs = {
  gravacoes: [
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { value: 'aguardando_arte', label: 'Aguardando Arte' },
      { value: 'arte_aprovada', label: 'Arte Aprovada' },
      { value: 'em_producao', label: 'Em Produção' },
      { value: 'finalizado', label: 'Finalizado' },
      { value: 'entregue', label: 'Entregue' },
    ]},
    { key: 'tipo_gravacao', label: 'Tipo', type: 'select' as const, options: [
      { value: 'laser', label: 'Laser' },
      { value: 'serigrafia', label: 'Serigrafia' },
      { value: 'sublimacao', label: 'Sublimação' },
      { value: 'bordado', label: 'Bordado' },
      { value: 'uv', label: 'UV' },
    ]},
  ],
};
