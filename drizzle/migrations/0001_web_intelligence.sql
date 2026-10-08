CREATE TABLE public.tool_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  tool text NOT NULL,
  method text,
  domain text,
  http_status integer,
  success boolean NOT NULL,
  error_category text,
  duration_ms integer,
  retries integer NOT NULL DEFAULT 0,
  bytes integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tool_executions TO authenticated;
GRANT ALL ON public.tool_executions TO service_role;
ALTER TABLE public.tool_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tool executions" ON public.tool_executions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX tool_exec_user_time ON public.tool_executions (user_id, created_at DESC);

CREATE TABLE public.web_cache (
  url_hash text PRIMARY KEY,
  url text NOT NULL,
  content_type text,
  content text NOT NULL,
  retrieved_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
GRANT ALL ON public.web_cache TO service_role;
ALTER TABLE public.web_cache ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.web_monitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  json_path text,
  watch_text text,
  frequency text NOT NULL DEFAULT 'daily',
  local_time text,
  next_run_at timestamptz NOT NULL DEFAULT now(),
  last_hash text,
  last_value text,
  last_checked_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','stopped')),
  failure_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.web_monitors TO authenticated;
GRANT ALL ON public.web_monitors TO service_role;
ALTER TABLE public.web_monitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own monitors read" ON public.web_monitors FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own monitors update" ON public.web_monitors FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own monitors delete" ON public.web_monitors FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX web_monitors_due ON public.web_monitors (status, next_run_at);

CREATE TABLE public.monitor_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid NOT NULL REFERENCES public.web_monitors(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  value text,
  content_hash text,
  changed boolean NOT NULL DEFAULT false,
  http_status integer,
  error text,
  retrieved_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.monitor_snapshots TO authenticated;
GRANT ALL ON public.monitor_snapshots TO service_role;
ALTER TABLE public.monitor_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own snapshots" ON public.monitor_snapshots FOR SELECT TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS recurrence text;

CREATE OR REPLACE FUNCTION public.purge_web_intelligence()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.tool_executions WHERE created_at < now() - interval '30 days';
  DELETE FROM public.web_cache WHERE expires_at < now() - interval '7 days';
  DELETE FROM public.monitor_snapshots s WHERE s.id IN (
    SELECT id FROM (SELECT id, row_number() OVER (PARTITION BY monitor_id ORDER BY retrieved_at DESC) rn FROM public.monitor_snapshots) x WHERE rn > 20);
$$;
REVOKE EXECUTE ON FUNCTION public.purge_web_intelligence() FROM PUBLIC, anon, authenticated;