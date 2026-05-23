
-- 1. Fix search_path on internal functions
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;

-- 2. Revoke EXECUTE on internal functions from anon/authenticated (not meant for API)
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.assign_permanent_admin() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_request_rate_limit() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_contact_rate_limit() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, PUBLIC;

-- 3. Tighten requests INSERT policy: submitter_user_id must match auth.uid() or be null (for anon)
DROP POLICY IF EXISTS "Anyone can submit a request" ON public.requests;
CREATE POLICY "Anyone can submit a request"
ON public.requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  submitter_user_id IS NULL
  OR submitter_user_id = auth.uid()
);

-- 4. Lock down Realtime: only staff can subscribe to postgres_changes for these tables
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff only realtime access" ON realtime.messages;
CREATE POLICY "Staff only realtime access"
ON realtime.messages
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));
