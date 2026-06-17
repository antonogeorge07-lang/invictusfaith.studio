CREATE OR REPLACE FUNCTION public.create_request(
  _name text, _email text, _title text, _description text,
  _category text DEFAULT 'support', _priority text DEFAULT 'medium'
) RETURNS TABLE(id uuid, public_token text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid; new_token text;
BEGIN
  INSERT INTO public.requests (submitter_name, submitter_email, title, description, category, priority)
  VALUES (_name, _email, _title, _description, _category::request_category, _priority::request_priority)
  RETURNING requests.id, requests.public_token INTO new_id, new_token;
  RETURN QUERY SELECT new_id, new_token;
END $$;

GRANT EXECUTE ON FUNCTION public.create_request(text,text,text,text,text,text) TO anon, authenticated;