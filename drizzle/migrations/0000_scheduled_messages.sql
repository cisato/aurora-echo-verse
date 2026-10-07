CREATE TABLE public.scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('reminder','followup')),
  send_at timestamptz NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','skipped','failed','cancelled')),
  attempts int NOT NULL DEFAULT 0,
  sent_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE, UPDATE ON public.scheduled_messages TO authenticated;
GRANT ALL ON public.scheduled_messages TO service_role;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own scheduled select" ON public.scheduled_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own scheduled update" ON public.scheduled_messages FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own scheduled delete" ON public.scheduled_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX scheduled_messages_due ON public.scheduled_messages (send_at) WHERE status = 'pending';