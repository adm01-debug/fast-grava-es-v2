import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";

// NOTE — esta função NÃO gera PDFs binários hoje: ela monta um relatório em
// texto plano. Para não induzir clientes ao erro (Content-Type application/pdf
// com bytes de texto), respondemos honestamente como `text/plain`. A geração
// de PDF real deve ser implementada com `pdf-lib` ou similar; até lá o texto
// pode ser convertido para PDF do lado do cliente via jspdf, se necessário.

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  try {
    // Auth check — endpoint retorna dados de produção (jobs/máquinas), não pode
    // ser público. Basta um JWT válido; a autorização fina fica no consumidor.
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { type, data, options } = await req.json();

    let textContent: Uint8Array;

    switch (type) {
      case "job-report":
        textContent = await generateJobReport(data, options);
        break;
      case "quality-report":
        textContent = await generateQualityReport(data, options);
        break;
      case "maintenance-report":
        textContent = await generateMaintenanceReport(data, options);
        break;
      default:
        throw new Error(`Unknown report type: ${type}`);
    }

    return new Response(textContent.buffer as ArrayBuffer, {
      headers: {
        ...getCorsHeaders(req),
        // Honesto: o corpo é texto UTF-8, não um PDF binário.
        "Content-Type": "text/plain; charset=utf-8",
        "X-Report-Format": "text",
        "Content-Disposition": `attachment; filename="${type}-${Date.now()}.txt"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

async function generateJobReport(data: any, options: any): Promise<Uint8Array> {
  // PDF generation logic here
  const content = `Job Report\n\nGenerated: ${new Date().toISOString()}\n\nData: ${JSON.stringify(data, null, 2)}`;
  return new TextEncoder().encode(content);
}

async function generateQualityReport(data: any, options: any): Promise<Uint8Array> {
  const content = `Quality Report\n\nGenerated: ${new Date().toISOString()}\n\nData: ${JSON.stringify(data, null, 2)}`;
  return new TextEncoder().encode(content);
}

async function generateMaintenanceReport(data: any, options: any): Promise<Uint8Array> {
  const { execution, machine, schedule, technical_sheet, supplies, alerts } = data;
  
  let content = `ORDEM DE SERVIÇO TÉCNICA - TPM\n`;
  content += `====================================\n\n`;
  content += `ID Execução: ${execution?.id || 'N/A'}\n`;
  content += `Data: ${new Date(execution?.completed_at || execution?.started_at).toLocaleString('pt-BR')}\n`;
  content += `Operador: ${execution?.performed_by_name || 'N/A'}\n\n`;
  
  content += `DADOS DA MÁQUINA E SERVIÇO\n`;
  content += `--------------------------\n`;
  content += `Máquina: ${machine?.name} (${machine?.code})\n`;
  content += `Técnica: ${technical_sheet?.techniques?.name || 'N/A'}\n`;
  content += `Produto: ${technical_sheet?.product_categories?.name || 'N/A'}\n\n`;

  content += `PARÂMETROS DE REGULAGEM APLICADOS\n`;
  content += `---------------------------------\n`;
  const params = execution?.adjustment_parameters || {};
  content += `Passadas de Rodo: ${params.squeegee_passes || 'N/A'}\n`;
  content += `Pressão: ${params.pressure || 'N/A'}\n`;
  content += `Velocidade: ${params.speed || 'N/A'}\n`;
  content += `Temperatura: ${params.temperature || 'N/A'}\n\n`;

  if (technical_sheet?.setup_instructions) {
    content += `GUIA DE SETUP E PREPARAÇÃO\n`;
    content += `--------------------------\n`;
    content += `${technical_sheet.setup_instructions}\n\n`;
  }

  if (supplies && supplies.length > 0) {
    content += `INSUMOS E CONSUMÍVEIS UTILIZADOS\n`;
    content += `--------------------------------\n`;
    supplies.forEach((s: any) => {
      content += `- ${s.name}: ${s.quantity}${s.alternative_used ? ' (Alternativo)' : ''}\n`;
    });
    content += `\n`;
  }

  if (execution?.quality_checklist_results && execution.quality_checklist_results.length > 0) {
    content += `CHECKLIST DE QUALIDADE\n`;
    content += `----------------------\n`;
    execution.quality_checklist_results.forEach((q: any) => {
      const sheet = technical_sheet?.quality_checklist?.find((i: any) => i.id === q.id);
      content += `[${q.approved ? 'OK' : 'X'}] ${sheet?.description || q.id}${q.justification ? ` - Justificativa: ${q.justification}` : ''}\n`;
    });
    content += `\n`;
  }

  if (alerts && alerts.length > 0) {
    content += `ALERTAS E CENÁRIOS DE FALHA (RISCO DE PERDA)\n`;
    content += `-------------------------------------------\n`;
    alerts.forEach((a: any) => {
      content += `! ${a.severity === 'critical' ? '[RISCO CRÍTICO] ' : '[AVISO] '}${a.description} (Valor: ${a.actual_value} / Esperado: ${a.expected_range})\n`;
      if (a.evidence_urls && a.evidence_urls.length > 0) {
        content += `  Evidências: ${a.evidence_urls.length} fotos anexadas.\n`;
        a.evidence_urls.forEach((url: string, idx: number) => {
           content += `  - Link Evidência ${idx + 1}: ${url}\n`;
        });
      }
    });
    content += `\n`;
  }

  content += `OBSERVAÇÕES GERAIS\n`;
  content += `------------------\n`;
  content += `${execution?.notes || 'Nenhuma observação.'}\n\n`;
  
  content += `------------------------------------\n`;
  content += `Assinatura: ${execution?.signature_url || '____________________'}\n`;

  return new TextEncoder().encode(content);
}
