-- Distinct-count helpers for the metrics-collector edge function.
-- Computing these in SQL avoids the PostgREST row cap (default 1000), which
-- otherwise undercounts active operators on busy days and forces large
-- in-memory deduplication in the edge function.

-- Number of distinct machines currently running a job in production.
CREATE OR REPLACE FUNCTION public.count_running_machines()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT machine_id)
  FROM public.jobs
  WHERE status = 'production'
    AND machine_id IS NOT NULL;
$$;

-- Number of distinct operators who scanned a job since the given timestamp.
CREATE OR REPLACE FUNCTION public.count_active_operators_since(p_since timestamptz)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT operator_id)
  FROM public.qr_scan_history
  WHERE scanned_at >= p_since
    AND operator_id IS NOT NULL;
$$;

-- These are invoked by the metrics-collector function using the service role.
REVOKE ALL ON FUNCTION public.count_running_machines() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.count_active_operators_since(timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.count_running_machines() TO service_role;
GRANT EXECUTE ON FUNCTION public.count_active_operators_since(timestamptz) TO service_role;
