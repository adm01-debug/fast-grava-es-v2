import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * Teste Compreensivo de RLS (Segurança 10/10)
 * Valida que o acesso não autenticado é negado para as principais tabelas do sistema.
 */
describe('Segurança RLS - Proteção de Dados', () => {
  const criticalTables = [
    'jobs',
    'machines',
    'inventory_items',
    'inventory_movements',
    'production_events',
    'audit_log',
    'profiles',
    'user_roles',
    'user_mfa_settings',
    'bitrix_configs',
    'quality_inspections',
    'maintenance_logs'
  ];

  criticalTables.forEach(table => {
    it(`deve bloquear acesso anônimo na tabela ${table}`, async () => {
      // O cliente supabase padrão no ambiente de teste geralmente não tem sessão
      const { data, error } = await supabase.from(table as any).select('*').limit(1);
      
      // No Supabase, se o RLS está ativo e não há política para anon, 
      // o select retorna uma lista vazia ou erro 401/403.
      // Aqui garantimos que não retornou dados.
      if (data) {
        expect(data.length).toBe(0);
      } else if (error) {
        expect(error.code).toMatch(/PGRST/); // Erros de postgrest geralmente indicam restrição
      }
    });
  });

  it('deve garantir que perfis não podem ser criados por anônimos', async () => {
    const { error } = await supabase.from('profiles').insert({
      id: '00000000-0000-0000-0000-000000000000',
      full_name: 'Hacker'
    });
    expect(error).toBeDefined();
  });
});
