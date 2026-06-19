import { describe, it, expect, vi } from 'vitest';
import { createRealtimeMock } from './realtimeMock';

describe('createRealtimeMock — contrato de tabelas não assinadas', () => {
  it('emitFor lança quando a tabela não tem handler registrado', () => {
    const rt = createRealtimeMock();

    // Registra handler apenas para "jobs"
    rt.supabase
      .channel()
      // @ts-expect-error tipo mínimo do mock
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {})
      .subscribe();

    expect(() => rt.emitFor('machines', { eventType: 'INSERT' })).toThrow(
      /No Realtime handler registered for table "machines"/,
    );
  });

  it('não dispara callbacks de outras tabelas ao emitir para tabela não assinada', () => {
    const rt = createRealtimeMock();
    const jobsCb = vi.fn();

    rt.supabase
      .channel()
      // @ts-expect-error tipo mínimo do mock
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, jobsCb)
      .subscribe();

    expect(() => rt.emitFor('techniques', { eventType: 'UPDATE' })).toThrow();
    expect(jobsCb).not.toHaveBeenCalled();
  });
});
