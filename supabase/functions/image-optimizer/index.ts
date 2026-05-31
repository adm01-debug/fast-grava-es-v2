import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ALLOWED_ORIGINS = [
  Deno.env.get('APP_URL') || 'https://fastgravacoes.com.br',
  'https://xxroejpvloldkmqdydar.lovableproject.com',
].filter(Boolean);

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-webhook-signature, x-forwarded-for, x-real-ip',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Vary': 'Origin',
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const quality = parseInt(formData.get("quality") as string) || 80;
    const maxWidth = parseInt(formData.get("maxWidth") as string) || 1920;

    if (!file) throw new Error("No file provided");

    // In a real implementation, use image processing library
    const arrayBuffer = await file.arrayBuffer();
    const optimizedImage = new Uint8Array(arrayBuffer);

    return new Response(optimizedImage, {
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="optimized-${file.name}"`,
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
