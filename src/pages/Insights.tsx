'use client'

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Seo } from '@/components/Seo'
import { supabase } from '@/integrations/supabase/client'
import { ArrowRight } from 'lucide-react'

type Post = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_url: string | null
  published_at: string | null
  tags: string[]
}

export default function Insights() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data } = await (supabase as any)
        .from('posts')
        .select('id,slug,title,excerpt,cover_url,published_at,tags')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
      setPosts((data as Post[]) ?? [])
      setLoaded(true)
    })()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="Insights | Invictus Faith Studio" description="Notes on building purpose-driven products, AI tooling, and shipping fast." path="/insights" />
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-accent">Insights</span>
            <h1 className="font-bold leading-[1.05] tracking-tight mt-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}>
              Notes from the studio
            </h1>
            <p className="text-lg text-muted-foreground mt-6">
              Field notes on shipping purpose-driven products, AI tooling, and lean MVPs.
            </p>
          </div>

          {loaded && posts.length === 0 && (
            <p className="text-muted-foreground py-16 text-center">No posts published yet. Check back soon.</p>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/insights/${p.slug}`}
                  className="group block glass-card rounded-3xl overflow-hidden card-glow transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[16/10] bg-secondary overflow-hidden">
                    {p.cover_url ? (
                      <img src={p.cover_url} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5" />
                    )}
                  </div>
                  <div className="p-6">
                    {p.published_at && (
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                        {new Date(p.published_at).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                    <h2 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">{p.title}</h2>
                    {p.excerpt && <p className="text-muted-foreground line-clamp-3 mb-4">{p.excerpt}</p>}
                    <span className="text-sm font-semibold text-accent inline-flex items-center gap-1">
                      Read <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
