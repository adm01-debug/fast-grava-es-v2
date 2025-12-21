import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, data, options } = await req.json();

    let pdfContent: Uint8Array;

    switch (type) {
      case "job-report":
        pdfContent = await generateJobReport(data, options);
        break;
      case "quality-report":
        pdfContent = await generateQualityReport(data, options);
        break;
      case "maintenance-report":
        pdfContent = await generateMaintenanceReport(data, options);
        break;
      default:
        throw new Error(`Unknown report type: ${type}`);
    }

    return new Response(pdfContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${type}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
  const content = `Maintenance Report\n\nGenerated: ${new Date().toISOString()}\n\nData: ${JSON.stringify(data, null, 2)}`;
  return new TextEncoder().encode(content);
}
