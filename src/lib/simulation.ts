import { supabase } from "@/integrations/supabase/client";

export interface SimulationScenario {
  id: string;
  name: string;
  source: string;
  event: string;
  description: string;
  payload: any;
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

// Generates varied scenarios including fuzzing cases
export const generateScenarios = (): SimulationScenario[] => {
  const baseScenarios: SimulationScenario[] = [
    { 
      id: 'b24-valid', 
      name: 'Bitrix24: Payload Válido', 
      source: 'bitrix24', 
      event: 'ONCRMDEALADD', 
      description: 'Cenário padrão de sucesso',
      payload: { id: 12345, title: 'New Deal', status: 'NEW' },
      expectedStatus: 200 
    },
    { 
      id: 'stripe-valid', 
      name: 'Stripe: Pagamento Sucesso', 
      source: 'stripe', 
      event: 'checkout.session.completed', 
      description: 'Webhook de pagamento concluído',
      payload: { id: 'evt_123', data: { object: { customer: 'cus_999' } } },
      expectedStatus: 200 
    },
  ];

  const fuzzingScenarios: SimulationScenario[] = [
    { 
      id: 'fuzz-malformed-json', 
      name: 'Fuzz: JSON Malformado', 
      source: 'bitrix24', 
      event: 'TEST', 
      description: 'Envia string não-JSON',
      payload: "NOT_A_JSON_STRING", 
      expectedStatus: 400 
    },
    { 
      id: 'fuzz-missing-source', 
      name: 'Fuzz: Fonte Ausente', 
      source: '', 
      event: 'TEST', 
      description: 'Campo source obrigatório ausente',
      payload: { event: 'TEST', data: {} },
      expectedStatus: 400 
    },
    { 
      id: 'fuzz-invalid-uuid', 
      name: 'Fuzz: UUID Inválido', 
      source: 'bitrix24', 
      event: 'TEST', 
      description: 'Envia UUID malformatado em campo esperado',
      payload: { source: 'bitrix24', event: 'TEST', data: { job_id: 'invalid-uuid-format' } },
      expectedStatus: 400 
    },
    { 
      id: 'fuzz-massive-payload', 
      name: 'Stress: Payload Gigante', 
      source: 'bitrix24', 
      event: 'STRESS', 
      description: 'Testa limite de tamanho de payload',
      payload: { large_data: "x".repeat(10000) },
      expectedStatus: 200 
    }
  ];

  return [...baseScenarios, ...fuzzingScenarios];
};

export async function runMassiveSimulation(
  totalCount: number = 1000, 
  concurrency: number = 10,
  onProgress?: (current: number, results: SimulationResult[]) => void
): Promise<SimulationResult[]> {
  const scenarios = generateScenarios();
  const results: SimulationResult[] = [];
  const queue = Array.from({ length: totalCount }, (_, i) => i);
  
  const executeTask = async () => {
    while (queue.length > 0) {
      const index = queue.shift();
      if (index === undefined) break;

      const scenario = scenarios[index % scenarios.length];
      const start = performance.now();
      
      try {
        const { data, error } = await supabase.functions.invoke('webhook-handler', {
          body: scenario.payload,
          headers: {
            'x-webhook-signature': 'simulation-mock-sig-' + Math.random().toString(36),
            'X-Simulation-Mode': 'true'
          }
        });

        const latency = performance.now() - start;
        const status = (!error && (data?.processed || scenario.expectedStatus !== 200)) ? 'pass' : 'fail';
        
        const result: SimulationResult = {
          scenarioId: scenario.id,
          status,
          statusCode: error ? (error as any).status || 500 : 200,
          message: error?.message || 'Processed successfully',
          latency,
          timestamp: new Date().toISOString()
        };

        results.push(result);
        if (onProgress) onProgress(results.length, results);

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
      
      // Small throttle to avoid completely overwhelming the local dev environment
      if (index % 50 === 0) await new Promise(r => setTimeout(r, 20));
    }
  };

  const workers = Array.from({ length: concurrency }, () => executeTask());
  await Promise.all(workers);

  return results;
}
