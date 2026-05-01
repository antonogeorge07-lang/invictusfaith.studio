'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Loader2 } from 'lucide-react'

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL
const SUPABASE_KEY = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY

export default function Unsubscribe() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [state, setState] = useState<'loading' | 'valid' | 'already' | 'invalid' | 'done' | 'error'>('loading')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!token) { setState('invalid'); return }
    fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: SUPABASE_KEY },
    })
      .then(r => r.json())
      .then(d => {
        if (d.valid) setState('valid')
        else if (d.reason === 'already_unsubscribed') setState('already')
        else setState('invalid')
      })
      .catch(() => setState('error'))
  }, [token])

  async function confirm() {
    if (!token) return
    setBusy(true)
    const { data, error } = await supabase.functions.invoke('handle-email-unsubscribe', { body: { token } })
    setBusy(false)
    if (error || !data?.success) setState('error')
    else setState('done')
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-6" translate="no">
      <div className="glass-card rounded-3xl p-10 max-w-md w-full text-center border border-white/10">
        {state === 'loading' && <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto" />}
        {state === 'valid' && (
          <>
            <h1 className="text-2xl font-bold text-primary-foreground mb-3">Unsubscribe?</h1>
            <p className="text-primary-foreground/60 mb-6">Stop receiving emails from Invictus Faith Studio.</p>
            <button onClick={confirm} disabled={busy} className="btn-electric px-6 py-3 rounded-xl font-bold">
              {busy ? 'Working...' : 'Confirm unsubscribe'}
            </button>
          </>
        )}
        {state === 'done' && (
          <>
            <h1 className="text-2xl font-bold text-accent mb-3">Unsubscribed</h1>
            <p className="text-primary-foreground/60">You will no longer receive emails from us.</p>
          </>
        )}
        {state === 'already' && (
          <>
            <h1 className="text-2xl font-bold text-primary-foreground mb-3">Already unsubscribed</h1>
            <p className="text-primary-foreground/60">This email is already on the unsubscribe list.</p>
          </>
        )}
        {state === 'invalid' && (
          <>
            <h1 className="text-2xl font-bold text-primary-foreground mb-3">Invalid link</h1>
            <p className="text-primary-foreground/60">This unsubscribe link is invalid or has expired.</p>
          </>
        )}
        {state === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-primary-foreground mb-3">Something went wrong</h1>
            <p className="text-primary-foreground/60">Please try again later.</p>
          </>
        )}
      </div>
    </div>
  )
}
