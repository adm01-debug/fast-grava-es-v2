import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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
        ...corsHeaders,
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="optimized-${file.name}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
