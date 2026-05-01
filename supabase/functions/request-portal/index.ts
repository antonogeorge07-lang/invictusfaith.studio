import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const SITE_URL = 'https://invictusfaith.studio'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) return json({ error: 'Invalid token' }, 400)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Look up the request by token
  const { data: request, error: reqErr } = await supabase
    .from('requests')
    .select('id, title, description, status, category, priority, submitter_name, submitter_email, created_at, updated_at, public_token')
    .eq('public_token', token)
    .maybeSingle()
  if (reqErr || !request) return json({ error: 'Request not found' }, 404)

  if (req.method === 'GET') {
    const [{ data: messages }, { data: quotes }] = await Promise.all([
      supabase.from('request_messages').select('id, author_type, body, created_at').eq('request_id', request.id).order('created_at', { ascending: true }),
      supabase.from('quotes').select('id, title, total_cents, currency, notes, status, sent_at, responded_at, created_at, accept_token, decline_token').eq('request_id', request.id).neq('status', 'draft').order('created_at', { ascending: false }),
    ])
    return json({ request, messages: messages ?? [], quotes: quotes ?? [] })
  }

  if (req.method === 'POST') {
    let body: any
    try { body = await req.json() } catch { return json({ error: 'Invalid JSON' }, 400) }
    const text = (body?.body ?? '').toString().trim()
    if (text.length < 1 || text.length > 4000) return json({ error: 'Message must be 1-4000 chars' }, 400)

    // basic per-token rate limit: 10 messages / 10 min
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('request_messages')
      .select('id', { count: 'exact', head: true })
      .eq('request_id', request.id)
      .eq('author_type', 'customer')
      .gte('created_at', since)
    if ((count ?? 0) >= 10) return json({ error: 'Too many messages, please wait a few minutes' }, 429)

    const { error: insErr } = await supabase.from('request_messages').insert({
      request_id: request.id, author_type: 'customer', body: text,
    })
    if (insErr) return json({ error: 'Failed to post message' }, 500)

    // Notify staff via email_send_log? Skip — staff sees realtime updates in the inbox.
    return json({ ok: true })
  }

  return json({ error: 'Method not allowed' }, 405)
})
