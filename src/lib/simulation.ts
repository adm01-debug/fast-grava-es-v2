import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type SimulationSource = 'bitrix24' | 'stripe' | 'system' | 'unknown' | 'iot' | 'energy';

export interface SimulationScenario {
  id: string;
  name: string;
  source: SimulationSource;
  event: string;
  description: string;
  payload?: Record<string, unknown> | string;
  expectedStatus: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface SimulationResult {
  scenarioId: string;
  status: 'pass' | 'fail';
  statusCode: number;
  message: string;
  latency: number;
  timestamp: string;
  errorContext?: any;
}

export const SCENARIOS: SimulationScenario[] = [
  { id: 'b24-deal-add', name: 'Bitrix24: Novo Negócio', source: 'bitrix24', event: 'ONCRMDEALADD', description: 'Simula a criação de um negócio no CRM', expectedStatus: 200, severity: 'medium' },
  { id: 'b24-deal-upd', name: 'Bitrix24: Atualização de Negócio', source: 'bitrix24', event: 'ONCRMDEALUPDATE', description: 'Simula a atualização de um negócio existente', expectedStatus: 200, severity: 'low' },
  { id: 'stripe-checkout', name: 'Stripe: Checkout Concluído', source: 'stripe', event: 'checkout.session.completed', description: 'Simula finalização de pagamento', expectedStatus: 200, severity: 'high' },
  { id: 'invalid-signature', name: 'Segurança: Assinatura Inválida', source: 'unknown', event: 'TEST', description: 'Testa rejeição de payload não assinado', expectedStatus: 400, severity: 'critical' },
  { id: 'missing-event', name: 'Validação: Evento Ausente', source: 'bitrix24', event: '', description: 'Testa rejeição de payload malformado', expectedStatus: 400, severity: 'medium' },
  { id: 'ml-predict-machine', name: 'ML: Predição de Máquina', source: 'system', event: 'ML_PREDICT', description: 'Simula predição de falha via IA', expectedStatus: 200, severity: 'high' },
  { id: 'ml-batch-analyze', name: 'ML: Análise em Lote', source: 'system', event: 'ML_BATCH_ANALYZE', description: 'Simula análise preditiva de toda frota', expectedStatus: 200, severity: 'medium' },
  { id: 'iot-telemetry-spike', name: 'IoT: Pico de Vibração', source: 'iot', event: 'TELEMETRY_SPIKE', description: 'Simula leitura anômala de sensor industrial', expectedStatus: 200, severity: 'critical' },
  { id: 'energy-surge', name: 'Energia: Consumo Anômalo', source: 'energy', event: 'SURGE_DETECTED', description: 'Simula detecção de pico de carga elétrica', expectedStatus: 200, severity: 'high' },
];

export const generateFuzzPayload = (basePayload: Record<string, any>): any => {
  const mutations = [
    (p: any) => { delete p.source; return p; },
    (p: any) => { p.source = 123; return p; },
    (p: any) => { p.event = null; return p; },
    (p: any) => { p.data = { invalid: "structure" }; return p; },
    (p: any) => { p.injection = "'; DROP TABLE machines; --"; return p; },
    (p: any) => { p.overflow = "X".repeat(50000); return p; }, // Increased stress
    (p: any) => { return "{ malformed_json: true "; },
    (p: any) => { p.nested_loop = { a: { b: { c: { d: { e: "deep" } } } } }; return p; },
  ];
  const mutation = mutations[Math.floor(Math.random() * mutations.length)];
  return mutation({ ...basePayload });
};

export const generateScenarios = (count: number = 10): SimulationScenario[] => {
  const baseScenarios = SCENARIOS;
  const scenarios: SimulationScenario[] = [];
  
  for (let i = 0; i < count; i++) {
    const base = baseScenarios[i % baseScenarios.length];
    const isFuzz = Math.random() > 0.3; // 70% chance of fuzzing for better coverage
    
    if (isFuzz) {
      const basePayload = { 
        source: base.source, 
        event: base.event, 
        data: { id: i, ts: new Date().toISOString() },
        meta: { iteration: i, correlation_id: crypto.randomUUID() }
      };
      scenarios.push({
        ...base,
        id: `fuzz-${i}-${Date.now()}`,
        name: `Stress Attack Vector ${i}`,
        description: 'Automated robust stress & security test vector',
        payload: generateFuzzPayload(basePayload),
        expectedStatus: 400
      });
    } else {
      scenarios.push({ ...base, id: `${base.id}-${i}-${Date.now()}` });
    }
  }
  
  return scenarios;
};

export async function runMassiveSimulation(
  totalCount: number = 1000, 
  concurrency: number = 15, // Increased concurrency
  onProgress?: (current: number, results: SimulationResult[]) => void
): Promise<SimulationResult[]> {
  const scenarios = generateScenarios(totalCount);
  const results: SimulationResult[] = [];
  const queue = [...scenarios];
  
  logger.info(`Starting massive simulation: ${totalCount} scenarios with concurrency ${concurrency}`);

  const executeTask = async () => {
    while (queue.length > 0) {
      const scenario = queue.shift();
      if (!scenario) break;

      const start = performance.now();
      
      try {
        const payload = scenario.payload || {
          source: scenario.source,
          event: scenario.event,
          data: { id: Math.floor(Math.random() * 1000000), test_mode: true, simulated_at: new Date().toISOString() }
        };

        const { data, error } = await supabase.functions.invoke('webhook-handler', {
          body: payload,
          headers: {
            'x-webhook-signature': 'sim-' + crypto.randomUUID(),
            'X-Simulation-Mode': 'true',
            'X-Simulation-Severity': scenario.severity || 'low'
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
          timestamp: new Date().toISOString(),
          errorContext: err
        });
        
        logger.error(`Simulation task failed for scenario ${scenario.id}`, err, 'SimulationEngine');
      }

      if (onProgress) onProgress(results.length, results);
      
      // Dynamic pacing to prevent local browser crash but maintain high RPS
      if (results.length % 50 === 0) {
        await new Promise(r => setTimeout(r, 2));
      }
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, totalCount) }, () => executeTask());
  await Promise.all(workers);

  const passCount = results.filter(r => r.status === 'pass').length;
  logger.info(`Simulation finished. Result: ${passCount}/${results.length} passed.`);

  return results;
}
