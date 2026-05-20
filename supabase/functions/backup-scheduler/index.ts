import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const tables = ["jobs", "profiles", "machines", "quality_checks", "maintenance_logs"];
    const backupId = `backup-${Date.now()}`;
    const results: Record<string, number> = {};

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*");
      if (error) {
        console.error(`Error backing up ${table}:`, error);
        continue;
      }

      // Store backup in storage
      const backupData = JSON.stringify(data);
      const { error: uploadError } = await supabase.storage
        .from("backups")
        .upload(`${backupId}/${table}.json`, backupData, {
          contentType: "application/json",
        });

      if (!uploadError) {
        results[table] = data.length;
      }
    }

    // Log backup
    await supabase.from("backup_logs").insert({
      backup_id: backupId,
      tables_backed_up: results,
      created_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, backupId, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
