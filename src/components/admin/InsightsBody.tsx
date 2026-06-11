'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Plus, Save, Trash2, Eye, EyeOff } from 'lucide-react'

type Post = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body_md: string
  cover_url: string | null
  status: 'draft' | 'published'
  published_at: string | null
  tags: string[]
}

const empty: Post = {
  id: '', slug: '', title: '', excerpt: '', body_md: '', cover_url: '',
  status: 'draft', published_at: null, tags: [],
}

export function InsightsBody() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selected, setSelected] = useState<Post | null>(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    const { data } = await (supabase as any).from('posts').select('*').order('created_at', { ascending: false })
    setPosts((data as Post[]) ?? [])
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!selected) return
    setBusy(true)
    const payload: any = { ...selected }
    delete payload.id
    if (payload.status === 'published' && !payload.published_at) payload.published_at = new Date().toISOString()
    const q = selected.id
      ? (supabase as any).from('posts').update(payload).eq('id', selected.id)
      : (supabase as any).from('posts').insert(payload).select().single()
    const { data, error } = await q
    setBusy(false)
    if (error) { toast.error(error.message); return }
    toast.success('Saved')
    if (data && !selected.id) setSelected(data as Post)
    load()
  }

  const remove = async () => {
    if (!selected?.id || !confirm('Delete this post?')) return
    const { error } = await (supabase as any).from('posts').delete().eq('id', selected.id)
    if (error) { toast.error(error.message); return }
    setSelected(null); load()
  }

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-6">
      <aside className="glass-card rounded-2xl p-4 max-h-[70vh] overflow-y-auto bg-white/5 border border-white/10">
        <button
          onClick={() => setSelected({ ...empty })}
          className="w-full mb-4 btn-electric rounded-xl py-2 text-sm font-semibold inline-flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> New post
        </button>
        <div className="space-y-1">
          {posts.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selected?.id === p.id ? 'bg-accent/20 text-primary-foreground' : 'text-primary-foreground/70 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {p.status === 'published' ? <Eye className="w-3 h-3 text-accent" /> : <EyeOff className="w-3 h-3 opacity-40" />}
                <span className="truncate">{p.title || 'Untitled'}</span>
              </div>
            </button>
          ))}
          {!posts.length && <p className="text-xs text-primary-foreground/40 px-3 py-4">No posts yet.</p>}
        </div>
      </aside>

      {!selected ? (
        <div className="glass-card rounded-2xl p-12 bg-white/5 border border-white/10 text-center text-primary-foreground/60">
          Select a post or create a new one.
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-6 bg-white/5 border border-white/10 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-primary-foreground/60">Title</span>
              <input value={selected.title} onChange={e => setSelected({ ...selected, title: e.target.value })}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-primary-foreground" />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-primary-foreground/60">Slug</span>
              <input value={selected.slug} onChange={e => setSelected({ ...selected, slug: e.target.value })}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-primary-foreground font-mono text-sm" />
            </label>
          </div>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-primary-foreground/60">Excerpt</span>
            <textarea value={selected.excerpt ?? ''} onChange={e => setSelected({ ...selected, excerpt: e.target.value })}
              rows={2} className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-primary-foreground" />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-primary-foreground/60">Cover URL</span>
            <input value={selected.cover_url ?? ''} onChange={e => setSelected({ ...selected, cover_url: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-primary-foreground text-sm" />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-primary-foreground/60">Body (Markdown)</span>
            <textarea value={selected.body_md} onChange={e => setSelected({ ...selected, body_md: e.target.value })}
              rows={18} className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-primary-foreground font-mono text-sm" />
          </label>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <select value={selected.status} onChange={e => setSelected({ ...selected, status: e.target.value as any })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-primary-foreground text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <button onClick={save} disabled={busy} className="btn-electric rounded-xl px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50">
              <Save className="w-4 h-4" /> Save
            </button>
            {selected.id && (
              <button onClick={remove} className="rounded-xl px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 border border-destructive/40 text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
            {selected.slug && selected.status === 'published' && (
              <a href={`/insights/${selected.slug}`} target="_blank" rel="noopener noreferrer"
                className="text-sm text-primary-foreground/60 hover:text-accent ml-auto">View</a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
