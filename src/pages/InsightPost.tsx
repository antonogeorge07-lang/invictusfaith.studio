'use client'

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Helmet } from 'react-helmet-async'
import { Navbar } from '@/components/Navbar'
import { Seo } from '@/components/Seo'
import { supabase } from '@/integrations/supabase/client'
import { ArrowLeft } from 'lucide-react'

type Post = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body_md: string
  cover_url: string | null
  published_at: string | null
  tags: string[]
}

export default function InsightPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      const { data } = await (supabase as any)
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()
      setPost(data as Post | null)
      setLoaded(true)
    })()
  }, [slug])

  if (loaded && !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Post not found.</p>
          <Link to="/insights" className="text-accent font-semibold">Back to Insights</Link>
        </div>
      </div>
    )
  }

  if (!post) return <div className="min-h-screen bg-background" />

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? '',
    image: post.cover_url ?? undefined,
    datePublished: post.published_at ?? undefined,
    author: { '@type': 'Organization', name: 'Invictus Faith Studio' },
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title={`${post.title} | Invictus Faith Studio`} description={post.excerpt ?? post.title} path={`/insights/${post.slug}`} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />
      <main className="pt-32 pb-24">
        <article className="container mx-auto px-6 max-w-3xl">
          <Link to="/insights" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-8">
            <ArrowLeft className="w-4 h-4" /> All insights
          </Link>
          {post.published_at && (
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              {new Date(post.published_at).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          <h1 className="font-bold leading-[1.1] tracking-tight mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            {post.title}
          </h1>
          {post.excerpt && <p className="text-xl text-muted-foreground mb-10">{post.excerpt}</p>}
          {post.cover_url && (
            <img src={post.cover_url} alt={post.title} className="w-full rounded-3xl mb-12 elevated-shadow" />
          )}
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-accent prose-strong:text-foreground prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body_md}</ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  )
}
