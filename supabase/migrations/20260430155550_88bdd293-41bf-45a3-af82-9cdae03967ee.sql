-- Helper: any staff role
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('owner','admin','designer')
  )
$$;

-- Enums
DO $$ BEGIN
  CREATE TYPE public.request_category AS ENUM ('feature','bug','idea','support');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.request_priority AS ENUM ('low','medium','high','urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.request_status AS ENUM ('new','reviewing','approved','in_progress','completed','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Requests table
CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category public.request_category NOT NULL DEFAULT 'support',
  priority public.request_priority NOT NULL DEFAULT 'medium',
  status public.request_status NOT NULL DEFAULT 'new',
  submitter_name text NOT NULL,
  submitter_email text NOT NULL,
  submitter_user_id uuid,
  impact_score smallint CHECK (impact_score BETWEEN 1 AND 10),
  effort_score smallint CHECK (effort_score BETWEEN 1 AND 10),
  value_score smallint CHECK (value_score BETWEEN 1 AND 10),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_priority ON public.requests(priority);
CREATE INDEX idx_requests_created_at ON public.requests(created_at DESC);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a request"
ON public.requests FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Staff can view requests"
ON public.requests FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update requests"
ON public.requests FOR UPDATE TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Owners and admins can delete requests"
ON public.requests FOR DELETE TO authenticated
USING (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_requests_updated_at
BEFORE UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Rate limit on public submissions (3/hour/email)
CREATE OR REPLACE FUNCTION public.check_request_rate_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count FROM public.requests
  WHERE submitter_email = NEW.submitter_email
    AND created_at > now() - INTERVAL '1 hour';
  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting again.';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_requests_rate_limit
BEFORE INSERT ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.check_request_rate_limit();

-- Internal notes
CREATE TABLE public.request_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_request_notes_request ON public.request_notes(request_id);
ALTER TABLE public.request_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view notes"
ON public.request_notes FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert their own notes"
ON public.request_notes FOR INSERT TO authenticated
WITH CHECK (public.is_staff(auth.uid()) AND author_id = auth.uid());

CREATE POLICY "Authors can update their notes"
ON public.request_notes FOR UPDATE TO authenticated
USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors or owners can delete notes"
ON public.request_notes FOR DELETE TO authenticated
USING (author_id = auth.uid() OR public.has_role(auth.uid(),'owner'));

-- Tags
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT '#00FFAB',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view tags" ON public.tags FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage tags" ON public.tags FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.request_tags (
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (request_id, tag_id)
);
ALTER TABLE public.request_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view request tags" ON public.request_tags FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage request tags" ON public.request_tags FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Auto-grant owner role to permanent admin email
CREATE OR REPLACE FUNCTION public.assign_permanent_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF LOWER(NEW.email) = 'antono.george07@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

-- Backfill owner role for existing permanent admin user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner'::public.app_role FROM auth.users
WHERE LOWER(email) = 'antono.george07@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;