import { Database } from "@/integrations/supabase/types";

export type Job = Database['public']['Tables']['jobs']['Row'] & {
  product_name?: string;
  responsible_name?: string;
  delay_time?: string;
};
