-- Create a function to check rate limiting for contact submissions
CREATE OR REPLACE FUNCTION public.check_contact_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count submissions from this email in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.contact_submissions
  WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 hour';

  -- Allow max 3 submissions per email per hour
  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting again.';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to enforce rate limiting
CREATE TRIGGER contact_rate_limit_trigger
BEFORE INSERT ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION public.check_contact_rate_limit();