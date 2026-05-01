import { createClient } from 'npm:@supabase/supabase-js@2'

const SITE_URL = 'https://invictusfaith.studio'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function htmlPage(title: string, body: string) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title><style>body{font-family:'Poppins',Inter,Arial,sans-serif;background:#0A0A0A;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px}.card{background:#111;border:1px solid #222;border-radius:24px;padding:48px;max-width:480px;text-align:center}.accent{color:#00FFAB}.btn{display:inline-block;margin-top:24px;background:#00FFAB;color:#0A0A0A;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700}h1{margin:0 0 16px;letter-spacing:-0.02em}p{color:rgba(255,255,255,0.7);line-height:1.6;margin:0}</style></head><body><div class="card">${body}</div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const url = new URL(req.url)
  const action = url.searchParams.get('action') as 'accept' | 'decline' | null
  const token = url.searchParams.get('token')

  if (!action || !['accept', 'decline'].includes(action) || !token) {
    return htmlPage('Invalid link', '<h1>Invalid link</h1><p>This quote link looks malformed.</p>')
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const tokenColumn = action === 'accept' ? 'accept_token' : 'decline_token'
  const { data: quote } = await supabase
    .from('quotes')
    .select('*, requests!inner(public_token, submitter_name, submitter_email, title)')
    .eq(tokenColumn, token)
    .maybeSingle()

  if (!quote) {
    return htmlPage('Not found', '<h1>Quote not found</h1><p>This link may have expired.</p>')
  }

  const portalUrl = `${SITE_URL}/r/${(quote as any).requests.public_token}`

  if (quote.status === 'accepted' || quote.status === 'declined') {
    return htmlPage(
      'Already responded',
      `<h1>Already <span class="accent">${quote.status}</span></h1><p>You already responded to this quote.</p><a class="btn" href="${portalUrl}">Open your request</a>`
    )
  }

  if (quote.status !== 'sent') {
    return htmlPage('Unavailable', '<h1>This quote is not available</h1><p>Please contact us if you have questions.</p>')
  }

  const newStatus = action === 'accept' ? 'accepted' : 'declined'
  const { error: upErr } = await supabase
    .from('quotes')
    .update({ status: newStatus, responded_at: new Date().toISOString() })
    .eq('id', quote.id)
  if (upErr) {
    return htmlPage('Error', '<h1>Something went wrong</h1><p>Please try the link again or contact us.</p>')
  }

  // System message in the thread
  await supabase.from('request_messages').insert({
    request_id: quote.request_id,
    author_type: 'system',
    body: `Customer ${newStatus} the quote "${quote.title}".`,
  })

  // Send confirmation email (fire-and-forget)
  try {
    await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'quote-response-confirmation',
        recipientEmail: (quote as any).requests.submitter_email,
        idempotencyKey: `quote-resp-${quote.id}-${newStatus}`,
        templateData: {
          name: (quote as any).requests.submitter_name,
          decision: newStatus,
          quoteTitle: quote.title,
          portalUrl,
        },
      },
    })
  } catch (e) {
    console.error('Confirmation email failed', e)
  }

  return htmlPage(
    `Quote ${newStatus}`,
    `<h1>Quote <span class="accent">${newStatus}</span></h1><p>${
      newStatus === 'accepted'
        ? 'Thanks! We will be in touch shortly with next steps.'
        : 'Thanks for letting us know. Reply on your request page if anything changes.'
    }</p><a class="btn" href="${portalUrl}">Open your request</a>`
  )
})
