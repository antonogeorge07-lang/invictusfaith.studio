'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/admin/AdminLayout'
import {
  STATUSES, PRIORITIES, CATEGORIES, STATUS_LABEL, STATUS_COLOR,
  PRIORITY_COLOR, CATEGORY_LABEL, ricePriority, type RequestRow, type Status, type Priority, type Category
} from '@/lib/requestHelpers'
import { notifyStatusChange, sendCustomerMessage, sendQuoteEmail, formatCurrency } from '@/lib/customerComms'
import { Search, X, Trash2, Mail, User as UserIcon, Calendar, Filter, MessageSquare, Send, FileText, Link as LinkIcon, Copy, BellOff, Bell } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDistanceToNow } from 'date-fns'
import { Seo } from '@/components/Seo'

interface Note { id: string; body: string; author_id: string; created_at: string }
interface Message { id: string; author_type: 'staff'|'customer'|'system'; body: string; created_at: string }
interface Quote {
  id: string; title: string; total_cents: number; currency: string; notes: string | null
  status: 'draft'|'sent'|'accepted'|'declined'|'expired'
  accept_token: string; decline_token: string
  sent_at: string | null; responded_at: string | null; created_at: string
}

type Tab = 'details' | 'messages' | 'quotes' | 'notes'

export default function AdminInbox() {
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'score'>('date')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [openId, setOpenId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('details')

  const [notes, setNotes] = useState<Note[]>([])
  const [noteDraft, setNoteDraft] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [msgDraft, setMsgDraft] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [quoteDraft, setQuoteDraft] = useState({ title: '', total: '', notes: '' })
  const [creatingQuote, setCreatingQuote] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
    fetchAll()

    const channel = supabase
      .channel('requests-inbox')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'request_messages' }, (payload) => {
        const reqId = (payload.new as any)?.request_id ?? (payload.old as any)?.request_id
        if (openId && reqId === openId) loadMessages(openId)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, (payload) => {
        const reqId = (payload.new as any)?.request_id ?? (payload.old as any)?.request_id
        if (openId && reqId === openId) loadQuotes(openId)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [openId])

  async function fetchAll() {
    const { data, error } = await supabase
      .from('requests').select('*').order('created_at', { ascending: false })
    if (error) { toast.error('Failed to load'); return }
    setRequests((data ?? []) as RequestRow[])
    setLoading(false)
  }

  async function loadNotes(rid: string) {
    const { data } = await supabase.from('request_notes').select('*').eq('request_id', rid).order('created_at', { ascending: true })
    setNotes((data ?? []) as Note[])
  }
  async function loadMessages(rid: string) {
    const { data } = await supabase.from('request_messages').select('*').eq('request_id', rid).order('created_at', { ascending: true })
    setMessages((data ?? []) as Message[])
  }
  async function loadQuotes(rid: string) {
    const { data } = await supabase.from('quotes').select('*').eq('request_id', rid).order('created_at', { ascending: false })
    setQuotes((data ?? []) as Quote[])
  }

  const open = openId ? requests.find(r => r.id === openId) ?? null : null

  useEffect(() => {
    if (openId) {
      loadNotes(openId); loadMessages(openId); loadQuotes(openId)
      setTab('details')
    } else {
      setNotes([]); setNoteDraft(''); setMessages([]); setMsgDraft(''); setQuotes([])
      setQuoteDraft({ title: '', total: '', notes: '' })
    }
  }, [openId])

  const filtered = useMemo(() => {
    let list = requests
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.submitter_name.toLowerCase().includes(q) ||
        r.submitter_email.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') list = list.filter(r => r.status === statusFilter)
    if (priorityFilter !== 'all') list = list.filter(r => r.priority === priorityFilter)
    if (categoryFilter !== 'all') list = list.filter(r => r.category === categoryFilter)

    if (sortBy === 'priority') {
      const order: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
      list = [...list].sort((a, b) => order[a.priority] - order[b.priority])
    } else if (sortBy === 'score') {
      list = [...list].sort((a, b) =>
        (ricePriority(b.impact_score, b.effort_score, b.value_score) ?? -1) -
        (ricePriority(a.impact_score, a.effort_score, a.value_score) ?? -1)
      )
    }
    return list
  }, [requests, search, statusFilter, priorityFilter, categoryFilter, sortBy])

  const allSelected = filtered.length > 0 && filtered.every(r => selectedIds.has(r.id))

  function toggleAll() { setSelectedIds(allSelected ? new Set() : new Set(filtered.map(r => r.id))) }
  function toggleOne(id: string) {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }

  async function bulkUpdateStatus(status: Status) {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    const targets = requests.filter(r => ids.includes(r.id) && r.status !== status)
    const { error } = await supabase.from('requests').update({ status }).in('id', ids)
    if (error) { toast.error('Update failed'); return }
    toast.success(`${ids.length} updated`)
    targets.forEach(r => notifyStatusChange(r, status))
    setSelectedIds(new Set())
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} request(s)?`)) return
    const { error } = await supabase.from('requests').delete().in('id', Array.from(selectedIds))
    if (error) { toast.error('Delete failed'); return }
    toast.success(`${selectedIds.size} deleted`)
    setSelectedIds(new Set())
  }

  async function updateField(id: string, patch: Partial<RequestRow>, opts?: { notifyStatus?: boolean }) {
    const before = requests.find(r => r.id === id)
    const { error } = await supabase.from('requests').update(patch).eq('id', id)
    if (error) { toast.error('Update failed'); return }
    if (opts?.notifyStatus && before && patch.status && patch.status !== before.status) {
      notifyStatusChange({ ...before, ...patch } as RequestRow, patch.status as string)
    }
  }

  async function addNote() {
    if (!open || !userId || !noteDraft.trim()) return
    const { error } = await supabase.from('request_notes').insert({ request_id: open.id, author_id: userId, body: noteDraft.trim() })
    if (error) { toast.error('Failed to add note'); return }
    setNoteDraft(''); loadNotes(open.id)
  }

  async function sendMessage() {
    if (!open || !userId || !msgDraft.trim()) return
    setSendingMsg(true)
    try {
      const { error } = await supabase.from('request_messages').insert({
        request_id: open.id, author_type: 'staff', author_id: userId, body: msgDraft.trim(),
      })
      if (error) throw error
      await sendCustomerMessage(open, msgDraft.trim())
      toast.success('Message sent')
      setMsgDraft(''); loadMessages(open.id)
    } catch (e: any) {
      toast.error('Failed to send message', { description: e?.message })
    } finally {
      setSendingMsg(false)
    }
  }

  async function createAndSendQuote() {
    if (!open || !userId) return
    const cents = Math.round(parseFloat(quoteDraft.total) * 100)
    if (!quoteDraft.title.trim() || !Number.isFinite(cents) || cents < 0) {
      toast.error('Quote needs a title and a valid amount'); return
    }
    setCreatingQuote(true)
    try {
      const { data, error } = await supabase.from('quotes').insert({
        request_id: open.id,
        title: quoteDraft.title.trim(),
        total_cents: cents,
        currency: 'EUR',
        notes: quoteDraft.notes.trim() || null,
        status: 'sent',
        sent_at: new Date().toISOString(),
        created_by: userId,
      }).select().single()
      if (error || !data) throw error ?? new Error('No quote returned')
      await sendQuoteEmail(data as Quote, open)
      toast.success('Quote sent')
      setQuoteDraft({ title: '', total: '', notes: '' })
      loadQuotes(open.id)
    } catch (e: any) {
      toast.error('Failed to send quote', { description: e?.message })
    } finally {
      setCreatingQuote(false)
    }
  }

  function copyPortalLink() {
    if (!open) return
    const link = `${window.location.origin}/r/${open.public_token}`
    navigator.clipboard.writeText(link)
    toast.success('Customer link copied')
  }

  return (
    <AdminLayout title="Inbox">
      <div className="space-y-4">
        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
              <Input
                placeholder="Search title, description, name, email..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-primary-foreground"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/40 hover:text-primary-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 lg:flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="lg:w-[140px] bg-white/5 border-white/10 text-primary-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="lg:w-[140px] bg-white/5 border-white/10 text-primary-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priority</SelectItem>
                  {PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="lg:w-[140px] bg-white/5 border-white/10 text-primary-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="lg:w-[140px] bg-white/5 border-white/10 text-primary-foreground"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest first</SelectItem>
                  <SelectItem value="priority">By priority</SelectItem>
                  <SelectItem value="score">By RICE score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Bulk action bar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass-card rounded-2xl px-4 py-3 border border-accent/30 flex flex-wrap items-center gap-3">
              <span className="text-primary-foreground text-sm">{selectedIds.size} selected</span>
              <div className="flex flex-wrap gap-2 ml-auto">
                <Select onValueChange={(v: Status) => bulkUpdateStatus(v)}>
                  <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-primary-foreground h-9">
                    <SelectValue placeholder="Set status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={bulkDelete} className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20">
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())} className="border-white/10 bg-white/5 text-primary-foreground">Clear</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {loading ? (
          <div className="text-primary-foreground/60 text-center py-12">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 border border-white/10 text-center">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-primary-foreground/30" />
            <p className="text-primary-foreground/60">No requests match your filters.</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
              <input type="checkbox" checked={allSelected} onChange={toggleAll}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-accent" />
              <span className="text-xs text-primary-foreground/50 uppercase tracking-wider">
                {filtered.length} request{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ul className="divide-y divide-white/5">
              {filtered.map(r => {
                const score = ricePriority(r.impact_score, r.effort_score, r.value_score)
                return (
                  <li key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <div className="px-4 py-3 flex items-start gap-3">
                      <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleOne(r.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 accent-accent" />
                      <button onClick={() => setOpenId(r.id)} className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${STATUS_COLOR[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                          <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${PRIORITY_COLOR[r.priority]}`}>{r.priority}</span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-white/10 text-primary-foreground/60">{CATEGORY_LABEL[r.category]}</span>
                          {score !== null && (
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-accent/30 bg-accent/10 text-accent">RICE {score}</span>
                          )}
                        </div>
                        <p className="text-primary-foreground font-medium text-sm truncate">{r.title}</p>
                        <p className="text-primary-foreground/50 text-xs truncate mt-0.5">
                          {r.submitter_name} &middot; {r.submitter_email} &middot; {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                        </p>
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpenId(null)} className="fixed inset-0 bg-black/60 z-40" />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-primary border-l border-white/10 z-50 overflow-y-auto">
              <div className="sticky top-0 bg-primary/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-primary-foreground font-semibold truncate">{open.title}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={copyPortalLink} title="Copy customer link"
                    className="text-primary-foreground/60 hover:text-accent flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-white/10">
                    <LinkIcon className="w-3 h-3" /> Customer link
                  </button>
                  <button onClick={() => setOpenId(null)} className="text-primary-foreground/60 hover:text-primary-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-6 pt-4 border-b border-white/10 flex gap-1">
                {([
                  { id: 'details', label: 'Details', icon: FileText },
                  { id: 'messages', label: `Messages${messages.length ? ` (${messages.length})` : ''}`, icon: MessageSquare },
                  { id: 'quotes', label: `Quotes${quotes.length ? ` (${quotes.length})` : ''}`, icon: FileText },
                  { id: 'notes', label: 'Internal Notes', icon: MessageSquare },
                ] as const).map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors ${
                      tab === t.id
                        ? 'bg-white/5 text-accent border-b-2 border-accent'
                        : 'text-primary-foreground/60 hover:text-primary-foreground'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-6">
                {tab === 'details' && (
                  <>
                    <div className="flex flex-wrap gap-3 text-xs text-primary-foreground/60">
                      <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" />{open.submitter_name}</span>
                      <a href={`mailto:${open.submitter_email}`} className="flex items-center gap-1 hover:text-accent">
                        <Mail className="w-3 h-3" />{open.submitter_email}
                      </a>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(open.created_at).toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-primary-foreground/50 uppercase tracking-wider">Status</label>
                        <Select value={open.status} onValueChange={(v: Status) => updateField(open.id, { status: v }, { notifyStatus: true })}>
                          <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-primary-foreground"><SelectValue /></SelectTrigger>
                          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-primary-foreground/50 uppercase tracking-wider">Priority</label>
                        <Select value={open.priority} onValueChange={(v: Priority) => updateField(open.id, { priority: v })}>
                          <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-primary-foreground"><SelectValue /></SelectTrigger>
                          <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-primary-foreground/50 uppercase tracking-wider">Category</label>
                        <Select value={open.category} onValueChange={(v: Category) => updateField(open.id, { category: v })}>
                          <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-primary-foreground"><SelectValue /></SelectTrigger>
                          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>

                    <button
                      onClick={() => updateField(open.id, { notify_on_status_change: !open.notify_on_status_change } as any)}
                      className="flex items-center gap-2 text-xs text-primary-foreground/70 hover:text-accent"
                    >
                      {open.notify_on_status_change ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                      {open.notify_on_status_change ? 'Customer is notified on status changes' : 'Status notifications off (silent moves)'}
                    </button>

                    <div>
                      <label className="text-xs text-primary-foreground/50 uppercase tracking-wider">Description</label>
                      <p className="mt-2 text-primary-foreground/80 text-sm whitespace-pre-wrap leading-relaxed bg-white/5 border border-white/10 rounded-xl p-4">
                        {open.description}
                      </p>
                    </div>

                    <div className="border border-accent/20 bg-accent/[0.03] rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-primary-foreground font-semibold text-sm">Idea Evaluation</h4>
                        {(() => {
                          const s = ricePriority(open.impact_score, open.effort_score, open.value_score)
                          return s !== null && (
                            <span className="text-xs px-2 py-1 rounded-md border border-accent/30 bg-accent/10 text-accent">Score: {s}</span>
                          )
                        })()}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {(['impact_score','value_score','effort_score'] as const).map(field => (
                          <div key={field}>
                            <label className="text-xs text-primary-foreground/50 capitalize">{field.replace('_score','')}</label>
                            <Select value={open[field]?.toString() ?? ''}
                              onValueChange={(v) => updateField(open.id, { [field]: parseInt(v) } as any)}>
                              <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-primary-foreground"><SelectValue placeholder="-" /></SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                                  <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-primary-foreground/40 mt-3">Score = (Impact + Value) / Effort &times; 10. Higher = build sooner.</p>
                    </div>
                  </>
                )}

                {tab === 'messages' && (
                  <div className="space-y-3">
                    <p className="text-xs text-primary-foreground/50">
                      Messages are emailed to the customer and visible on their request page.
                    </p>
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                      {messages.length === 0 ? (
                        <p className="text-primary-foreground/40 text-sm text-center py-6">No messages yet. Start the conversation below.</p>
                      ) : messages.map(m => (
                        <div key={m.id} className={`rounded-xl p-3 border ${
                          m.author_type === 'staff' ? 'bg-accent/10 border-accent/30 ml-8'
                          : m.author_type === 'customer' ? 'bg-white/5 border-white/10 mr-8'
                          : 'bg-white/[0.02] border-white/5 text-center'
                        }`}>
                          <p className={`text-[10px] uppercase tracking-wider mb-1 ${
                            m.author_type === 'staff' ? 'text-accent'
                            : m.author_type === 'customer' ? 'text-blue-400'
                            : 'text-primary-foreground/40'
                          }`}>
                            {m.author_type === 'staff' ? 'You' : m.author_type === 'customer' ? open.submitter_name : 'System'}
                            {' · '}{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                          </p>
                          <p className="text-primary-foreground/90 text-sm whitespace-pre-wrap">{m.body}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-white/10">
                      <textarea value={msgDraft} onChange={(e) => setMsgDraft(e.target.value)}
                        placeholder={`Write to ${open.submitter_name}...`} rows={3}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-primary-foreground text-sm placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent resize-none" />
                      <Button onClick={sendMessage} disabled={!msgDraft.trim() || sendingMsg} className="btn-electric self-end">
                        <Send className="w-4 h-4 mr-1" /> Send
                      </Button>
                    </div>
                  </div>
                )}

                {tab === 'quotes' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {quotes.length === 0 ? (
                        <p className="text-primary-foreground/40 text-sm text-center py-4">No quotes yet.</p>
                      ) : quotes.map(q => (
                        <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-primary-foreground font-medium text-sm">{q.title}</p>
                            <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${
                              q.status === 'accepted' ? 'border-accent/30 bg-accent/10 text-accent'
                              : q.status === 'declined' ? 'border-red-500/30 bg-red-500/10 text-red-400'
                              : q.status === 'sent' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                              : 'border-white/10 text-primary-foreground/60'
                            }`}>{q.status}</span>
                          </div>
                          <p className="text-accent font-bold">{formatCurrency(q.total_cents, q.currency)}</p>
                          {q.notes && <p className="text-primary-foreground/60 text-xs mt-1 whitespace-pre-wrap">{q.notes}</p>}
                          <p className="text-primary-foreground/40 text-[10px] mt-2">
                            Sent {q.sent_at ? formatDistanceToNow(new Date(q.sent_at), { addSuffix: true }) : '-'}
                            {q.responded_at && ` · responded ${formatDistanceToNow(new Date(q.responded_at), { addSuffix: true })}`}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border border-accent/20 bg-accent/[0.03] rounded-2xl p-4 space-y-3">
                      <h4 className="text-primary-foreground font-semibold text-sm">New quote</h4>
                      <Input placeholder="Quote title (e.g., AI tutor MVP build)"
                        value={quoteDraft.title}
                        onChange={(e) => setQuoteDraft({ ...quoteDraft, title: e.target.value })}
                        className="bg-white/5 border-white/10 text-primary-foreground" />
                      <div className="flex items-center gap-2">
                        <span className="text-primary-foreground/60 text-sm">EUR</span>
                        <Input type="number" min="0" step="1" placeholder="Total amount"
                          value={quoteDraft.total}
                          onChange={(e) => setQuoteDraft({ ...quoteDraft, total: e.target.value })}
                          className="bg-white/5 border-white/10 text-primary-foreground" />
                      </div>
                      <textarea placeholder="Notes (optional, shown to the customer)"
                        rows={3} value={quoteDraft.notes}
                        onChange={(e) => setQuoteDraft({ ...quoteDraft, notes: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-primary-foreground text-sm placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent resize-none" />
                      <Button onClick={createAndSendQuote} disabled={creatingQuote || !quoteDraft.title.trim() || !quoteDraft.total}
                        className="btn-electric w-full">
                        <Send className="w-4 h-4 mr-1" />
                        {creatingQuote ? 'Sending...' : 'Send quote to customer'}
                      </Button>
                    </div>
                  </div>
                )}

                {tab === 'notes' && (
                  <div className="space-y-3">
                    <p className="text-xs text-primary-foreground/50">Internal notes are only visible to staff. Not sent to the customer.</p>
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                      {notes.length === 0 ? (
                        <p className="text-primary-foreground/40 text-sm">No notes yet.</p>
                      ) : notes.map(n => (
                        <div key={n.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-primary-foreground/80 text-sm whitespace-pre-wrap">{n.body}</p>
                          <p className="text-primary-foreground/40 text-[10px] mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Add an internal note..." rows={2}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-primary-foreground text-sm placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent resize-none" />
                      <Button onClick={addNote} disabled={!noteDraft.trim()} className="btn-electric self-end">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
