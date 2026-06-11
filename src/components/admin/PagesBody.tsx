'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Plus, Save, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react'

type Page = {
  id: string
  slug: string
  title: string
  status: 'draft' | 'published'
  seo_title: string | null
  seo_description: string | null
}

type Block = {
  id: string
  page_id: string
  sort_order: number
  block_type: 'hero' | 'logo_bar' | 'feature_split' | 'testimonial' | 'stats_row' | 'cta' | 'markdown'
  props: any
}

const BLOCK_TYPES: Block['block_type'][] = ['hero','logo_bar','feature_split','testimonial','stats_row','cta','markdown']

const PROP_TEMPLATES: Record<Block['block_type'], any> = {
  hero: { eyebrow: 'For founders', title: 'Build the thing', highlight: 'that ships', subtitle: 'A short subtitle.', cta_label: 'Start', cta_href: '#contact' },
  logo_bar: { label: 'Trusted by teams shipping fast' },
  feature_split: { eyebrow: 'Feature', title: 'A bold headline', body: 'A short description.', image: '', reverse: false },
  testimonial: { quote: 'They shipped in two weeks.', author: 'Jane Doe', role: 'CEO, Acme' },
  stats_row: { stats: [{ value: '12+', label: 'MVPs shipped' }, { value: '98%', label: 'Lighthouse' }, { value: '14d', label: 'Avg launch' }, { value: '5', label: 'Continents' }] },
  cta: { title: 'Ready to start?', subtitle: 'Book a call today.', cta_label: 'Book a call', cta_href: '#contact' },
  markdown: { body: '## Heading\n\nSome **markdown** body.' },
}

export function PagesBody() {
  const [pages, setPages] = useState<Page[]>([])
  const [selected, setSelected] = useState<Page | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])

  const loadPages = async () => {
    const { data } = await (supabase as any).from('pages').select('*').order('created_at', { ascending: false })
    setPages((data as Page[]) ?? [])
  }
  const loadBlocks = async (pageId: string) => {
    const { data } = await (supabase as any).from('page_blocks').select('*').eq('page_id', pageId).order('sort_order')
    setBlocks((data as Block[]) ?? [])
  }
  useEffect(() => { loadPages() }, [])
  useEffect(() => { if (selected?.id) loadBlocks(selected.id); else setBlocks([]) }, [selected?.id])

  const savePage = async () => {
    if (!selected) return
    const payload: any = { ...selected }
    delete payload.id
    const q = selected.id
      ? (supabase as any).from('pages').update(payload).eq('id', selected.id)
      : (supabase as any).from('pages').insert(payload).select().single()
    const { data, error } = await q
    if (error) return toast.error(error.message)
    toast.success('Page saved')
    if (data && !selected.id) setSelected(data as Page)
    loadPages()
  }

  const deletePage = async () => {
    if (!selected?.id || !confirm('Delete this page and all its blocks?')) return
    const { error } = await (supabase as any).from('pages').delete().eq('id', selected.id)
    if (error) return toast.error(error.message)
    setSelected(null); loadPages()
  }

  const addBlock = async (type: Block['block_type']) => {
    if (!selected?.id) return
    const sort_order = (blocks[blocks.length - 1]?.sort_order ?? -1) + 1
    const { error } = await (supabase as any).from('page_blocks').insert({
      page_id: selected.id, sort_order, block_type: type, props: PROP_TEMPLATES[type],
    })
    if (error) return toast.error(error.message)
    loadBlocks(selected.id)
  }

  const updateBlock = async (b: Block, patch: Partial<Block>) => {
    const { error } = await (supabase as any).from('page_blocks').update(patch).eq('id', b.id)
    if (error) return toast.error(error.message)
    loadBlocks(b.page_id)
  }

  const deleteBlock = async (b: Block) => {
    if (!confirm('Delete this block?')) return
    const { error } = await (supabase as any).from('page_blocks').delete().eq('id', b.id)
    if (error) return toast.error(error.message)
    loadBlocks(b.page_id)
  }

  const move = async (b: Block, dir: -1 | 1) => {
    const idx = blocks.findIndex(x => x.id === b.id)
    const other = blocks[idx + dir]
    if (!other) return
    await (supabase as any).from('page_blocks').update({ sort_order: other.sort_order }).eq('id', b.id)
    await (supabase as any).from('page_blocks').update({ sort_order: b.sort_order }).eq('id', other.id)
    loadBlocks(b.page_id)
  }

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-6">
      <aside className="glass-card rounded-2xl p-4 max-h-[80vh] overflow-y-auto bg-white/5 border border-white/10">
        <button
          onClick={() => setSelected({ id: '', slug: '', title: 'New page', status: 'draft', seo_title: null, seo_description: null })}
          className="w-full mb-4 btn-electric rounded-xl py-2 text-sm font-semibold inline-flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> New page
        </button>
        <div className="space-y-1">
          {pages.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selected?.id === p.id ? 'bg-accent/20 text-primary-foreground' : 'text-primary-foreground/70 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {p.status === 'published' ? <Eye className="w-3 h-3 text-accent" /> : <EyeOff className="w-3 h-3 opacity-40" />}
                <span className="truncate">{p.title}</span>
              </div>
              <span className="text-[10px] text-primary-foreground/40 font-mono">/p/{p.slug}</span>
            </button>
          ))}
        </div>
      </aside>

      {!selected ? (
        <div className="glass-card rounded-2xl p-12 bg-white/5 border border-white/10 text-center text-primary-foreground/60">
          Select a page or create a new one.
        </div>
      ) : (
        <div className="space-y-6">
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
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-primary-foreground/60">SEO title</span>
                <input value={selected.seo_title ?? ''} onChange={e => setSelected({ ...selected, seo_title: e.target.value })}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-primary-foreground" />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-primary-foreground/60">SEO description</span>
                <input value={selected.seo_description ?? ''} onChange={e => setSelected({ ...selected, seo_description: e.target.value })}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-primary-foreground" />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select value={selected.status} onChange={e => setSelected({ ...selected, status: e.target.value as any })}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-primary-foreground text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <button onClick={savePage} className="btn-electric rounded-xl px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                <Save className="w-4 h-4" /> Save page
              </button>
              {selected.id && (
                <button onClick={deletePage} className="rounded-xl px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 border border-destructive/40 text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" /> Delete page
                </button>
              )}
              {selected.slug && selected.status === 'published' && (
                <a href={`/p/${selected.slug}`} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-primary-foreground/60 hover:text-accent ml-auto">View live</a>
              )}
            </div>
          </div>

          {selected.id && (
            <div className="glass-card rounded-2xl p-6 bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h3 className="text-lg font-bold text-primary-foreground">Blocks</h3>
                <div className="flex flex-wrap gap-2">
                  {BLOCK_TYPES.map(t => (
                    <button key={t} onClick={() => addBlock(t)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-accent/20 border border-white/10 text-primary-foreground/80 capitalize">
                      + {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {blocks.map((b, i) => (
                  <div key={b.id} className="border border-white/10 rounded-xl p-4 bg-black/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent capitalize font-semibold">{b.block_type.replace('_', ' ')}</span>
                        <span className="text-xs text-primary-foreground/40">#{i + 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => move(b, -1)} disabled={i === 0} className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30"><ChevronUp className="w-4 h-4 text-primary-foreground/60" /></button>
                        <button onClick={() => move(b, 1)} disabled={i === blocks.length - 1} className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30"><ChevronDown className="w-4 h-4 text-primary-foreground/60" /></button>
                        <button onClick={() => deleteBlock(b)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <textarea
                      defaultValue={JSON.stringify(b.props, null, 2)}
                      onBlur={(e) => {
                        try {
                          const props = JSON.parse(e.target.value)
                          updateBlock(b, { props })
                        } catch { toast.error('Invalid JSON') }
                      }}
                      rows={Math.min(14, e_lineCount(b.props))}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-primary-foreground font-mono text-xs"
                    />
                  </div>
                ))}
                {!blocks.length && <p className="text-sm text-primary-foreground/40 text-center py-8">No blocks yet. Add one above.</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function e_lineCount(obj: any) {
  return JSON.stringify(obj, null, 2).split('\n').length + 1
}
