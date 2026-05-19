import { supabase } from "@/integrations/supabase/client";

export type SimulationSource = 'bitrix24' | 'stripe' | 'system' | 'unknown';

export interface SimulationScenario {
  id: string;
  name: string;
  source: SimulationSource;
  event: string;
  description: string;
  payload?: Record<string, unknown> | string;
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
  { id: 'fuzz-malformed-json', name: 'Fuzz: JSON Malformado', source: 'bitrix24', event: 'TEST', description: 'Envia string não-JSON', expectedStatus: 400, payload: "NOT_A_JSON_STRING" },
];

export const generateScenarios = (): SimulationScenario[] => SCENARIOS;

export async function runMassiveSimulation(
  totalCount: number = 100, 
  concurrency: number = 5,
  onProgress?: (current: number, results: SimulationResult[]) => void
): Promise<SimulationResult[]> {
  const scenarios = SCENARIOS;
  const results: SimulationResult[] = [];
  const queue = Array.from({ length: totalCount }, (_, i) => i);
  
  const executeTask = async () => {
    while (queue.length > 0) {
      const index = queue.shift();
      if (index === undefined) break;

      const scenario = scenarios[index % scenarios.length];
      const start = performance.now();
      
      try {
        const payload = scenario.payload || {
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
            'x-webhook-signature': 'simulation-mock-sig-' + Math.random().toString(36),
            'X-Simulation-Mode': 'true'
          }
        });

        const latency = performance.now() - start;
        // In contract testing, we consider it a 'pass' if it returns the expected status code
        const currentStatus = error ? (error as any).status || 500 : 200;
        const status = (currentStatus === scenario.expectedStatus) ? 'pass' : 'fail';
        
        results.push({
          scenarioId: scenario.id,
          status,
          statusCode: currentStatus,
          message: error?.message || (data?.processed ? 'Sucesso' : 'Resposta consistente'),
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

      if (onProgress) onProgress(results.length, results);
      
      // Small throttle
      if (index % 10 === 0) await new Promise(r => setTimeout(r, 50));
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, totalCount) }, () => executeTask());
  await Promise.all(workers);

  return results;
}
