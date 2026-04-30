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
import { Search, X, Trash2, Mail, User as UserIcon, Calendar, Filter, MessageSquare, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDistanceToNow } from 'date-fns'

interface Note {
  id: string
  body: string
  author_id: string
  created_at: string
}

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
  const [notes, setNotes] = useState<Note[]>([])
  const [noteDraft, setNoteDraft] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
    fetchAll()

    const channel = supabase
      .channel('requests-inbox')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => fetchAll())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchAll() {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { toast.error('Failed to load'); return }
    setRequests((data ?? []) as RequestRow[])
    setLoading(false)
  }

  async function loadNotes(requestId: string) {
    const { data } = await supabase
      .from('request_notes')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })
    setNotes((data ?? []) as Note[])
  }

  const open = openId ? requests.find(r => r.id === openId) ?? null : null

  useEffect(() => {
    if (openId) loadNotes(openId)
    else { setNotes([]); setNoteDraft('') }
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

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(r => r.id)))
  }
  function toggleOne(id: string) {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }

  async function bulkUpdateStatus(status: Status) {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    const { error } = await supabase.from('requests').update({ status }).in('id', ids)
    if (error) { toast.error('Update failed'); return }
    toast.success(`${ids.length} updated`)
    setSelectedIds(new Set())
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} request(s)? This cannot be undone.`)) return
    const ids = Array.from(selectedIds)
    const { error } = await supabase.from('requests').delete().in('id', ids)
    if (error) { toast.error('Delete failed'); return }
    toast.success(`${ids.length} deleted`)
    setSelectedIds(new Set())
  }

  async function updateField(id: string, patch: Partial<RequestRow>) {
    const { error } = await supabase.from('requests').update(patch).eq('id', id)
    if (error) toast.error('Update failed')
  }

  async function addNote() {
    if (!open || !userId || !noteDraft.trim()) return
    const { error } = await supabase.from('request_notes').insert({
      request_id: open.id,
      author_id: userId,
      body: noteDraft.trim(),
    })
    if (error) { toast.error('Failed to add note'); return }
    setNoteDraft('')
    loadNotes(open.id)
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                <SelectTrigger className="lg:w-[140px] bg-white/5 border-white/10 text-primary-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="lg:w-[140px] bg-white/5 border-white/10 text-primary-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priority</SelectItem>
                  {PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="lg:w-[140px] bg-white/5 border-white/10 text-primary-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="lg:w-[140px] bg-white/5 border-white/10 text-primary-foreground">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
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
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card rounded-2xl px-4 py-3 border border-accent/30 flex flex-wrap items-center gap-3"
            >
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
                <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())} className="border-white/10 bg-white/5 text-primary-foreground">
                  Clear
                </Button>
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
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-accent"
              />
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
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleOne(r.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 accent-accent"
                      />
                      <button onClick={() => setOpenId(r.id)} className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${STATUS_COLOR[r.status]}`}>
                            {STATUS_LABEL[r.status]}
                          </span>
                          <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${PRIORITY_COLOR[r.priority]}`}>
                            {r.priority}
                          </span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-white/10 text-primary-foreground/60">
                            {CATEGORY_LABEL[r.category]}
                          </span>
                          {score !== null && (
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-accent/30 bg-accent/10 text-accent">
                              RICE {score}
                            </span>
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
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpenId(null)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-primary border-l border-white/10 z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-primary/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-primary-foreground font-semibold truncate">Request Details</h2>
                <button onClick={() => setOpenId(null)} className="text-primary-foreground/60 hover:text-primary-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-primary-foreground mb-2">{open.title}</h3>
                  <div className="flex flex-wrap gap-2 text-xs text-primary-foreground/60">
                    <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" />{open.submitter_name}</span>
                    <a href={`mailto:${open.submitter_email}`} className="flex items-center gap-1 hover:text-accent">
                      <Mail className="w-3 h-3" />{open.submitter_email}
                    </a>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(open.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* Status / priority / category controls */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-primary-foreground/50 uppercase tracking-wider">Status</label>
                    <Select value={open.status} onValueChange={(v: Status) => updateField(open.id, { status: v })}>
                      <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-primary-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-primary-foreground/50 uppercase tracking-wider">Priority</label>
                    <Select value={open.priority} onValueChange={(v: Priority) => updateField(open.id, { priority: v })}>
                      <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-primary-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-primary-foreground/50 uppercase tracking-wider">Category</label>
                    <Select value={open.category} onValueChange={(v: Category) => updateField(open.id, { category: v })}>
                      <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-primary-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-primary-foreground/50 uppercase tracking-wider">Description</label>
                  <p className="mt-2 text-primary-foreground/80 text-sm whitespace-pre-wrap leading-relaxed bg-white/5 border border-white/10 rounded-xl p-4">
                    {open.description}
                  </p>
                </div>

                {/* Scoring */}
                <div className="border border-accent/20 bg-accent/[0.03] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-primary-foreground font-semibold text-sm">Idea Evaluation</h4>
                    {(() => {
                      const s = ricePriority(open.impact_score, open.effort_score, open.value_score)
                      return s !== null && (
                        <span className="text-xs px-2 py-1 rounded-md border border-accent/30 bg-accent/10 text-accent">
                          Score: {s}
                        </span>
                      )
                    })()}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(['impact_score','value_score','effort_score'] as const).map(field => (
                      <div key={field}>
                        <label className="text-xs text-primary-foreground/50 capitalize">
                          {field.replace('_score','')}
                        </label>
                        <Select
                          value={open[field]?.toString() ?? ''}
                          onValueChange={(v) => updateField(open.id, { [field]: parseInt(v) } as any)}
                        >
                          <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-primary-foreground">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                              <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-primary-foreground/40 mt-3">
                    Score = (Impact + Value) / Effort &times; 10. Higher = build sooner.
                  </p>
                </div>

                {/* Internal notes */}
                <div>
                  <h4 className="text-primary-foreground font-semibold text-sm mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Internal Notes
                  </h4>
                  <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
                    {notes.length === 0 ? (
                      <p className="text-primary-foreground/40 text-xs">No notes yet.</p>
                    ) : notes.map(n => (
                      <div key={n.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                        <p className="text-primary-foreground/80 text-sm whitespace-pre-wrap">{n.body}</p>
                        <p className="text-primary-foreground/40 text-[10px] mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Add an internal note..."
                      rows={2}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-primary-foreground text-sm placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent resize-none"
                    />
                    <Button
                      onClick={addNote}
                      disabled={!noteDraft.trim()}
                      className="btn-electric self-end"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
