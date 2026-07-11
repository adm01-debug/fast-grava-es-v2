import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// STUB — esta função foi identificada como não implementada durante auditoria
// (retornava os bytes originais sem otimizar). Enquanto uma implementação real
// não estiver disponível (ex.: via `imagescript` ou `sharp` server-side), a
// função responde 501 para que o cliente saiba que o serviço está indisponível
// em vez de assumir que a otimização ocorreu.

const ALLOWED_ORIGINS = [
  Deno.env.get('APP_URL') || 'https://fastgravacoes.com.br',
  'https://xxroejpvloldkmqdydar.lovableproject.com',
].filter(Boolean);

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  return new Response(
    JSON.stringify({
      error: "image-optimizer is not implemented",
      status: "not_implemented",
      hint: "Use client-side optimization (browser-image-compression) or wire up a real server-side image pipeline before calling this endpoint.",
    }),
    {
      status: 501,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    },
  );
});
