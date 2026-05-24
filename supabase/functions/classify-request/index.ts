import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CATEGORIES = ['feature', 'bug', 'idea', 'support'] as const
const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { request_id } = await req.json()
    if (!request_id) {
      return new Response(JSON.stringify({ error: 'request_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: r, error: fetchErr } = await supabase
      .from('requests')
      .select('id, title, description')
      .eq('id', request_id)
      .maybeSingle()
    if (fetchErr || !r) {
      return new Response(JSON.stringify({ error: 'Request not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You classify customer requests for a web/MVP design studio. Return ONLY JSON: {"category":"feature|bug|idea|support","priority":"low|medium|high|urgent"}. Category guide: feature=new build or website project, bug=something broken, idea=exploratory concept, support=existing client help. Priority guide: urgent=production down or paying client blocked, high=hot lead or revenue opportunity, medium=normal inquiry, low=vague or low-intent.`,
          },
          {
            role: 'user',
            content: `Title: ${r.title}\n\nMessage: ${r.description}`,
          },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'classify',
            description: 'Classify the request',
            parameters: {
              type: 'object',
              properties: {
                category: { type: 'string', enum: CATEGORIES as unknown as string[] },
                priority: { type: 'string', enum: PRIORITIES as unknown as string[] },
              },
              required: ['category', 'priority'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'classify' } },
      }),
    })

    if (aiRes.status === 429 || aiRes.status === 402) {
      return new Response(JSON.stringify({ error: 'AI rate/credit limit' }), {
        status: aiRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!aiRes.ok) {
      const txt = await aiRes.text()
      console.error('AI error:', txt)
      return new Response(JSON.stringify({ error: 'AI failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const aiJson = await aiRes.json()
    const args = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments
    if (!args) {
      return new Response(JSON.stringify({ error: 'No classification' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const parsed = JSON.parse(args)
    const category = CATEGORIES.includes(parsed.category) ? parsed.category : 'support'
    const priority = PRIORITIES.includes(parsed.priority) ? parsed.priority : 'medium'

    const { error: updErr } = await supabase
      .from('requests')
      .update({ category, priority })
      .eq('id', request_id)
    if (updErr) {
      return new Response(JSON.stringify({ error: 'Update failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true, category, priority }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
