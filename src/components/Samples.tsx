'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import { supabase } from '@/integrations/supabase/client'

type Category = 'design' | 'platform' | 'launch'

type Sample = {
  id: string
  name: string
  tag: string | null
  url: string
  category: Category
  image_url: string | null
}

const FALLBACK: Sample[] = [
  { id: 'f1', name: 'Vinatea Evolve', tag: 'Wellness studio', url: 'https://vinatea-evolve.lovable.app', category: 'design', image_url: null },
  { id: 'f2', name: 'Café Baratto VLC', tag: 'Local café, Valencia', url: 'https://cafe-baratto-vlc.lovable.app', category: 'design', image_url: null },
  { id: 'f3', name: 'PolyLinq', tag: 'Language exchange platform', url: 'https://poly-linq.com/', category: 'platform', image_url: null },
  { id: 'f4', name: 'Spark Agile', tag: 'AI agile coaching', url: 'https://spark-agile.com/', category: 'launch', image_url: null },
]

const FILTERS: { id: 'all' | Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'design', label: 'Design' },
  { id: 'platform', label: 'Platform' },
  { id: 'launch', label: 'Launch' },
]

export function Samples() {
  const { t } = useLanguage()
  const [items, setItems] = useState<Sample[]>([])
  const [loaded, setLoaded] = useState(false)
  const [filter, setFilter] = useState<'all' | Category>('all')

  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data } = await supabase
        .from('studio_samples')
        .select('id,name,tag,url,category,image_url')
        .eq('published', true)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false })
      if (!alive) return
      setItems((data as Sample[] | null)?.length ? (data as Sample[]) : FALLBACK)
      setLoaded(true)
    })()
    return () => { alive = false }
  }, [])

  const filtered = useMemo(
    () => filter === 'all' ? items : items.filter(s => s.category === filter),
    [items, filter]
  )

  return (
    <section className="relative py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.01 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-px bg-accent" />
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">
              {t('samples.label')}
            </span>
            <div className="w-12 h-px bg-accent" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.01 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-6"
          >
            {t('samples.title')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.01 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {t('samples.description')}
          </motion.p>
        </div>

        {/* Filter tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-2xl bg-muted/40 border border-border gap-1">
            {FILTERS.map(f => {
              const active = filter === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active ? 'bg-accent text-accent-foreground shadow-[0_0_24px_-6px_hsl(var(--accent))]' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {loaded && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No entries yet in this category.</p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((s, i) => {
            const screenshot = s.image_url || `https://image.thum.io/get/width/800/crop/600/noanimate/${s.url}`
            return (
              <motion.a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="group glass-card rounded-3xl overflow-hidden card-glow hover:scale-[1.02] transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted/30 border-b border-border/40 relative">
                  <img
                    src={screenshot}
                    alt={`${s.name} website preview`}
                    loading="lazy"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-background/80 backdrop-blur text-accent border border-accent/30">
                    {s.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                      {s.name}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0 mt-1" />
                  </div>
                  {s.tag && <p className="text-sm text-muted-foreground mb-3">{s.tag}</p>}
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                    {t('samples.view')}
                  </span>
                </div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
