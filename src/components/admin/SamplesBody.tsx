'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Plus, Trash2, ExternalLink, Eye, EyeOff, Save, X } from 'lucide-react'
import { toast } from 'sonner'

type Category = 'design' | 'platform' | 'launch'

type Sample = {
  id: string
  name: string
  tag: string | null
  url: string
  category: Category
  image_url: string | null
  position: number
  published: boolean
  created_at: string
}

const CATEGORIES: Category[] = ['design', 'platform', 'launch']

export function SamplesBody() {
  const [items, setItems] = useState<Sample[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    url: '',
    tag: '',
    category: 'platform' as Category,
    image_url: '',
  })

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('studio_samples')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) toast.error(error.message)
    setItems((data as Sample[] | null) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const reset = () => {
    setForm({ name: '', url: '', tag: '', category: 'platform', image_url: '' })
    setShowForm(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.url.trim()) {
      toast.error('Name and URL are required')
      return
    }
    try {
      new URL(form.url)
    } catch {
      toast.error('Please enter a valid URL (including https://)')
      return
    }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('studio_samples').insert({
      name: form.name.trim(),
      url: form.url.trim(),
      tag: form.tag.trim() || null,
      category: form.category,
      image_url: form.image_url.trim() || null,
      created_by: user?.id ?? null,
    })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Added to Studio showcase')
    reset()
    load()
  }

  const togglePublish = async (s: Sample) => {
    const { error } = await supabase
      .from('studio_samples')
      .update({ published: !s.published })
      .eq('id', s.id)
    if (error) { toast.error(error.message); return }
    setItems(prev => prev.map(i => i.id === s.id ? { ...i, published: !i.published } : i))
  }

  const remove = async (s: Sample) => {
    if (!confirm(`Delete "${s.name}"?`)) return
    const { error } = await supabase.from('studio_samples').delete().eq('id', s.id)
    if (error) { toast.error(error.message); return }
    setItems(prev => prev.filter(i => i.id !== s.id))
    toast.success('Removed')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-primary-foreground">Studio Showcase</h2>
          <p className="text-sm text-primary-foreground/60">Manage the sample projects shown on the /studio page.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-[0_0_24px_-6px_hsl(var(--accent))]"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={submit}
          className="glass-card rounded-2xl p-6 border border-emerald-400/40 space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Name *">
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="PolyLinq"
                maxLength={120}
                className="input"
              />
            </Field>
            <Field label="URL *">
              <input
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://example.com"
                maxLength={500}
                className="input"
              />
            </Field>
            <Field label="Tag / Subtitle">
              <input
                value={form.tag}
                onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                placeholder="Language exchange platform"
                maxLength={140}
                className="input"
              />
            </Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                className="input"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c} className="bg-primary">{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Custom image URL (optional)" full>
              <input
                value={form.image_url}
                onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                placeholder="Leave blank to auto-generate a screenshot"
                maxLength={500}
                className="input"
              />
            </Field>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-primary-foreground/70 hover:text-primary-foreground text-sm">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground font-semibold text-sm disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-primary-foreground/60 text-sm">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-primary-foreground/60 text-sm">No samples yet. Click <span className="text-accent font-medium">Add New</span> to add one.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {items.map(s => (
              <li key={s.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                  <img
                    src={s.image_url || `https://image.thum.io/get/width/200/crop/150/noanimate/${s.url}`}
                    alt=""
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-primary-foreground truncate">{s.name}</span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">{s.category}</span>
                    {!s.published && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-primary-foreground/50 border border-white/10">hidden</span>
                    )}
                  </div>
                  {s.tag && <p className="text-xs text-primary-foreground/50 truncate">{s.tag}</p>}
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline inline-flex items-center gap-1 mt-0.5">
                    {s.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => togglePublish(s)}
                    title={s.published ? 'Hide' : 'Show'}
                    className="p-2 rounded-lg text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/5">
                    {s.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => remove(s)} title="Delete"
                    className="p-2 rounded-lg text-primary-foreground/60 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.75rem;
          background: hsl(var(--primary-foreground) / 0.05);
          border: 1px solid hsl(var(--primary-foreground) / 0.1);
          color: hsl(var(--primary-foreground));
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: hsl(var(--accent)); }
        .input::placeholder { color: hsl(var(--primary-foreground) / 0.35); }
      `}</style>
    </div>
  )
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? 'md:col-span-2' : ''}`}>
      <span className="block text-xs font-medium text-primary-foreground/60 mb-1.5 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  )
}
