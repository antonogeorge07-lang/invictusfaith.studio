'use client'

import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Seo } from '@/components/Seo'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { supabase } from '@/integrations/supabase/client'

type Page = { id: string; slug: string; title: string; seo_title: string | null; seo_description: string | null }
type Block = { id: string; block_type: any; props: any; sort_order: number }

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<Page | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      const { data: p } = await (supabase as any)
        .from('pages')
        .select('id,slug,title,seo_title,seo_description')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()
      if (p) {
        setPage(p as Page)
        const { data: bs } = await (supabase as any)
          .from('page_blocks')
          .select('id,block_type,props,sort_order')
          .eq('page_id', (p as any).id)
          .order('sort_order', { ascending: true })
        setBlocks((bs as Block[]) ?? [])
      }
      setLoaded(true)
    })()
  }, [slug])

  if (loaded && !page) return <Navigate to="/404" replace />
  if (!page) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title={page.seo_title ?? `${page.title} | Invictus Faith Studio`}
        description={page.seo_description ?? page.title}
        path={`/p/${page.slug}`}
      />
      <Navbar />
      <main>
        {blocks.map((b) => <BlockRenderer key={b.id} block={b} />)}
      </main>
    </div>
  )
}
