DROP TRIGGER IF EXISTS requests_status_change ON public.requests;
DROP FUNCTION IF EXISTS public.notify_request_status_change();