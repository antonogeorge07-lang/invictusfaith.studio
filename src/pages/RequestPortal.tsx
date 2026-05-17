'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { Send, Loader2, FileText, MessageSquare } from 'lucide-react'
import { Seo } from '@/components/Seo'

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL
const SUPABASE_KEY = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY

interface PortalRequest {
  id: string; title: string; description: string; status: string; category: string; priority: string
  submitter_name: string; submitter_email: string; created_at: string; public_token: string
}
interface PortalMessage { id: string; author_type: 'staff'|'customer'|'system'; body: string; created_at: string }
interface PortalQuote {
  id: string; title: string; total_cents: number; currency: string; notes: string | null
  status: string; sent_at: string | null; responded_at: string | null
  accept_token: string; decline_token: string
}

const STATUS_LABEL: Record<string, string> = {
  new: 'New', reviewing: 'Reviewing', approved: 'Approved',
  in_progress: 'In Progress', completed: 'Completed', rejected: 'Closed',
}

export default function RequestPortal() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<{ request: PortalRequest; messages: PortalMessage[]; quotes: PortalQuote[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  async function load() {
    if (!token) return
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/request-portal?token=${token}`, {
        headers: { apikey: SUPABASE_KEY },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Could not load request')
      }
      setData(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  async function postMessage() {
    if (!draft.trim() || !token) return
    setSending(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/request-portal?token=${token}`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: draft.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to send')
      }
      setDraft('')
      toast.success('Message sent')
      load()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-6">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center border border-white/10">
          <h1 className="text-2xl font-bold text-primary-foreground mb-3">Request not found</h1>
          <p className="text-primary-foreground/60">{error ?? 'This link may have expired or is invalid.'}</p>
        </div>
      </div>
    )
  }

  const { request, messages, quotes } = data

  return (
    <div className="min-h-screen bg-primary py-12 px-6" translate="no">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">Your request</p>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground leading-tight mb-3">{request.title}</h1>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-md border border-accent/30 bg-accent/10 text-accent uppercase">
              {STATUS_LABEL[request.status] ?? request.status}
            </span>
            <span className="px-2 py-1 rounded-md border border-white/10 text-primary-foreground/60 uppercase">
              {request.priority}
            </span>
          </div>
          <p className="text-primary-foreground/40 text-xs mt-3">
            Submitted {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })} by {request.submitter_name}
          </p>
        </motion.header>

        <section className="glass-card rounded-2xl p-6 border border-white/10">
          <h2 className="text-primary-foreground font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Original request
          </h2>
          <p className="text-primary-foreground/80 text-sm whitespace-pre-wrap leading-relaxed">{request.description}</p>
        </section>

        {quotes.length > 0 && (
          <section className="glass-card rounded-2xl p-6 border border-white/10">
            <h2 className="text-primary-foreground font-semibold text-sm uppercase tracking-wider mb-4">Quotes</h2>
            <div className="space-y-3">
              {quotes.map(q => (
                <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-primary-foreground font-medium">{q.title}</p>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${
                      q.status === 'accepted' ? 'border-accent/30 bg-accent/10 text-accent'
                      : q.status === 'declined' ? 'border-red-500/30 bg-red-500/10 text-red-400'
                      : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                    }`}>{q.status}</span>
                  </div>
                  <p className="text-2xl text-accent font-bold">
                    {new Intl.NumberFormat('en-EU', { style: 'currency', currency: q.currency, maximumFractionDigits: 0 }).format(q.total_cents / 100)}
                  </p>
                  {q.notes && <p className="text-primary-foreground/70 text-sm mt-2 whitespace-pre-wrap">{q.notes}</p>}
                  {q.status === 'sent' && (
                    <div className="flex gap-2 mt-4">
                      <a href={`${SUPABASE_URL}/functions/v1/quote-respond?action=accept&token=${q.accept_token}`}
                        className="btn-electric px-5 py-2 rounded-xl font-bold text-sm">Accept</a>
                      <a href={`${SUPABASE_URL}/functions/v1/quote-respond?action=decline&token=${q.decline_token}`}
                        className="px-5 py-2 rounded-xl font-medium text-sm border border-white/20 text-primary-foreground hover:bg-white/5">Decline</a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="glass-card rounded-2xl p-6 border border-white/10">
          <h2 className="text-primary-foreground font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Conversation
          </h2>
          <div className="space-y-3 mb-4 max-h-[60vh] overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-primary-foreground/40 text-sm text-center py-6">No messages yet.</p>
            ) : messages.map(m => (
              <div key={m.id} className={`rounded-xl p-3 border ${
                m.author_type === 'staff' ? 'bg-white/5 border-white/10 mr-8'
                : m.author_type === 'customer' ? 'bg-accent/10 border-accent/30 ml-8'
                : 'bg-white/[0.02] border-white/5 text-center'
              }`}>
                <p className={`text-[10px] uppercase tracking-wider mb-1 ${
                  m.author_type === 'staff' ? 'text-blue-400'
                  : m.author_type === 'customer' ? 'text-accent'
                  : 'text-primary-foreground/40'
                }`}>
                  {m.author_type === 'staff' ? 'Invictus Faith Studio' : m.author_type === 'customer' ? 'You' : 'System'}
                  {' · '}{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                </p>
                <p className="text-primary-foreground/90 text-sm whitespace-pre-wrap">{m.body}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4">
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3}
              placeholder="Write a reply..." maxLength={4000}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent resize-none" />
            <div className="flex justify-end mt-2">
              <button onClick={postMessage} disabled={!draft.trim() || sending}
                className="btn-electric px-5 py-2 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </div>
          </div>
        </section>

        <p className="text-center text-primary-foreground/30 text-xs uppercase tracking-wider">
          Invictus Faith Studio
        </p>
      </div>
    </div>
  )
}
