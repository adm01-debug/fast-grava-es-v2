import { supabase } from "@/integrations/supabase/client";

export interface SimulationScenario {
  id: string;
  name: string;
  source: string;
  event: string;
  description: string;
  expectedStatus: number;
}

export interface SimulationResult {
  scenarioId: string;
  status: 'pass' | 'fail';
  statusCode: number;
  message: string;
  latency: number;
  timestamp: string;
}

export const SCENARIOS: SimulationScenario[] = [
  { id: 'b24-deal-add', name: 'Bitrix24: Novo Negócio', source: 'bitrix24', event: 'ONCRMDEALADD', description: 'Simula a criação de um negócio no CRM', expectedStatus: 200 },
  { id: 'b24-deal-upd', name: 'Bitrix24: Atualização de Negócio', source: 'bitrix24', event: 'ONCRMDEALUPDATE', description: 'Simula a atualização de um negócio existente', expectedStatus: 200 },
  { id: 'stripe-checkout', name: 'Stripe: Checkout Concluído', source: 'stripe', event: 'checkout.session.completed', description: 'Simula finalização de pagamento', expectedStatus: 200 },
  { id: 'invalid-signature', name: 'Segurança: Assinatura Inválida', source: 'unknown', event: 'TEST', description: 'Testa rejeição de payload não assinado', expectedStatus: 400 },
  { id: 'missing-event', name: 'Validação: Evento Ausente', source: 'bitrix24', event: '', description: 'Testa rejeição de payload malformado', expectedStatus: 400 },
];

export async function runSimulation(count: number = 10, onProgress?: (current: number) => void): Promise<SimulationResult[]> {
  const results: SimulationResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    const start = performance.now();
    
    try {
      const payload = {
        source: scenario.source,
        event: scenario.event,
        data: {
          id: Math.floor(Math.random() * 100000),
          test_mode: true,
          timestamp: new Date().toISOString()
        }
      };

      const { data, error } = await supabase.functions.invoke('webhook-handler', {
        body: payload,
        headers: {
          'x-webhook-signature': 'simulation-token-mock'
        }
      });

      const latency = performance.now() - start;
      const status = (!error && data?.processed) ? 'pass' : 'fail';
      
      results.push({
        scenarioId: scenario.id,
        status,
        statusCode: error ? 500 : 200,
        message: error?.message || (data?.processed ? 'Sucesso' : 'Erro no processamento'),
        latency,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {
      results.push({
        scenarioId: scenario.id,
        status: 'fail',
        statusCode: 500,
        message: err.message,
        latency: performance.now() - start,
        timestamp: new Date().toISOString()
      });
    }

    if (onProgress) onProgress(i + 1);
    
    // Batch delay to avoid hitting rate limits too fast during simulation
    if (i % 10 === 0) await new Promise(r => setTimeout(r, 50));
  }

  return results;
}
