
CREATE TYPE public.studio_sample_category AS ENUM ('design','platform','launch');

CREATE TABLE public.studio_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tag text,
  url text NOT NULL,
  category public.studio_sample_category NOT NULL DEFAULT 'platform',
  image_url text,
  position integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.studio_samples TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_samples TO authenticated;
GRANT ALL ON public.studio_samples TO service_role;

ALTER TABLE public.studio_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published samples"
  ON public.studio_samples FOR SELECT
  USING (published = true OR is_staff(auth.uid()));

CREATE POLICY "Staff can insert samples"
  ON public.studio_samples FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'owner') OR has_role(auth.uid(),'admin'));

CREATE POLICY "Staff can update samples"
  ON public.studio_samples FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'owner') OR has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'owner') OR has_role(auth.uid(),'admin'));

CREATE POLICY "Staff can delete samples"
  ON public.studio_samples FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'owner') OR has_role(auth.uid(),'admin'));

CREATE TRIGGER touch_studio_samples_updated_at
  BEFORE UPDATE ON public.studio_samples
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
