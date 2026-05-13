import { Database } from "@/integrations/supabase/types";

export type Job = {
  id: string;
  order_number: string | null;
  product_name?: string | null;
  product?: string | null;
  status: string;
  quantity: number;
  produced_quantity: number | null;
  lost_pieces: number | null;
  delay_time?: string | null;
  responsible_name?: string | null;
  machine_id?: string | null;
  operator_id?: string | null;
  technique_id?: string | null;
  efficiency?: string | number | null;
  actual_end_time?: string | null;
  created_at?: string | null;
};
