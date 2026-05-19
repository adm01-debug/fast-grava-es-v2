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
  { id: 'ml-predict-machine', name: 'ML: Predição de Máquina', source: 'system', event: 'ML_PREDICT', description: 'Simula predição de falha via IA', expectedStatus: 200 },
  { id: 'ml-batch-analyze', name: 'ML: Análise em Lote', source: 'system', event: 'ML_BATCH_ANALYZE', description: 'Simula análise preditiva de toda frota', expectedStatus: 200 },
];

export const generateFuzzPayload = (basePayload: Record<string, any>): any => {
  const mutations = [
    (p: any) => { delete p.source; return p; },
    (p: any) => { p.source = 123; return p; },
    (p: any) => { p.event = null; return p; },
    (p: any) => { p.data = { invalid: "structure" }; return p; },
    (p: any) => { p.injection = "'; DROP TABLE machines; --"; return p; },
    (p: any) => { p.overflow = "X".repeat(20000); return p; },
    (p: any) => { return "{ malformed_json: true "; },
  ];
  
  const mutation = mutations[Math.floor(Math.random() * mutations.length)];
  return mutation({ ...basePayload });
};
  
  const mutation = mutations[Math.floor(Math.random() * mutations.length)];
  return mutation({ ...basePayload });
};

export const generateScenarios = (count: number = 10): SimulationScenario[] => {
  const baseScenarios = SCENARIOS;
  const scenarios: SimulationScenario[] = [];
  
  for (let i = 0; i < count; i++) {
    const base = baseScenarios[i % baseScenarios.length];
    const isFuzz = Math.random() > 0.4; // 60% chance of fuzzing
    
    if (isFuzz) {
      const basePayload = { source: base.source, event: base.event, data: { id: i } };
      scenarios.push({
        ...base,
        id: `fuzz-${i}`,
        name: `Fuzzer Variation ${i}`,
        description: 'Automatic security and robustness stress test payload',
        payload: generateFuzzPayload(basePayload),
        expectedStatus: 400
      });
    } else {
      scenarios.push({ ...base, id: `${base.id}-${i}` });
    }
  }
  
  return scenarios;
};

export async function runMassiveSimulation(
  totalCount: number = 1000, 
  concurrency: number = 10,
  onProgress?: (current: number, results: SimulationResult[]) => void
): Promise<SimulationResult[]> {
  const scenarios = generateScenarios(totalCount);
  const results: SimulationResult[] = [];
  const queue = [...scenarios];
  
  const executeTask = async () => {
    while (queue.length > 0) {
      const scenario = queue.shift();
      if (!scenario) break;

      const start = performance.now();
      
      try {
        const payload = scenario.payload || {
          source: scenario.source,
          event: scenario.event,
          data: { id: Math.floor(Math.random() * 100000), test_mode: true }
        };

        const { data, error } = await supabase.functions.invoke('webhook-handler', {
          body: payload,
          headers: {
            'x-webhook-signature': 'mock-sig-' + Math.random().toString(36).slice(2),
            'X-Simulation-Mode': 'true'
          }
        });

        const latency = performance.now() - start;
        const currentStatus = error ? (error as any).status || 500 : 200;
        const isPass = currentStatus === scenario.expectedStatus;
        
        results.push({
          scenarioId: scenario.id,
          status: isPass ? 'pass' : 'fail',
          statusCode: currentStatus,
          message: error?.message || (data?.processed ? 'Processed' : 'Consistent'),
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
      if (results.length % 50 === 0) await new Promise(r => setTimeout(r, 5));
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, totalCount) }, () => executeTask());
  await Promise.all(workers);

  return results;
}
