-- Phase 2: customer comms, status emails, quotes, public portal

-- Add columns to requests
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS public_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS notify_on_status_change boolean NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS requests_public_token_idx ON public.requests(public_token);

-- request_messages: customer-facing thread
CREATE TABLE IF NOT EXISTS public.request_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  author_type text NOT NULL CHECK (author_type IN ('staff','customer','system')),
  author_id uuid,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS request_messages_request_id_idx ON public.request_messages(request_id, created_at);

ALTER TABLE public.request_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view messages"
  ON public.request_messages FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert messages"
  ON public.request_messages FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND author_type = 'staff' AND author_id = auth.uid());

CREATE POLICY "Staff can delete messages"
  ON public.request_messages FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

-- Quote status enum
DO $$ BEGIN
  CREATE TYPE public.quote_status AS ENUM ('draft','sent','accepted','declined','expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  title text NOT NULL,
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  notes text,
  status public.quote_status NOT NULL DEFAULT 'draft',
  accept_token uuid NOT NULL DEFAULT gen_random_uuid(),
  decline_token uuid NOT NULL DEFAULT gen_random_uuid(),
  sent_at timestamptz,
  responded_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quotes_request_id_idx ON public.quotes(request_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS quotes_accept_token_idx ON public.quotes(accept_token);
CREATE UNIQUE INDEX IF NOT EXISTS quotes_decline_token_idx ON public.quotes(decline_token);

CREATE TRIGGER quotes_touch BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view quotes"
  ON public.quotes FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert quotes"
  ON public.quotes FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update quotes"
  ON public.quotes FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete quotes"
  ON public.quotes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.request_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;

-- Status-change notification trigger -> enqueues an email job
CREATE OR REPLACE FUNCTION public.notify_request_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  payload jsonb;
  site_url text := 'https://invictusfaith.studio';
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND COALESCE(NEW.notify_on_status_change, true) THEN
    payload := jsonb_build_object(
      'template', 'request-status-update',
      'recipient_email', NEW.submitter_email,
      'idempotency_key', 'status-' || NEW.id || '-' || NEW.status,
      'template_data', jsonb_build_object(
        'name', NEW.submitter_name,
        'title', NEW.title,
        'status', NEW.status,
        'portalUrl', site_url || '/r/' || NEW.public_token
      )
    );
    PERFORM public.enqueue_email('status_change_dispatch', payload);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS requests_status_change ON public.requests;
CREATE TRIGGER requests_status_change
  AFTER UPDATE OF status ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_request_status_change();