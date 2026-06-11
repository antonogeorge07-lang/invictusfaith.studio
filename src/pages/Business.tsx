'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Zap, Globe, Bot, TrendingUp, CheckCircle2, ExternalLink, Copy } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Navbar } from '@/components/Navbar'
import { LogoBar } from '@/components/LogoBar'
import { Seo } from '@/components/Seo'
import { supabase } from '@/integrations/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'

const intakeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  business: z.string().trim().min(1).max(150),
  message: z.string().trim().min(10).max(2000),
})

type PackKey = 'starter' | 'growth' | 'pro'

const PLAN_FEATURES: Record<PackKey, string[]> = {
  starter: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'],
  growth: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'],
  pro: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'],
}

export default function Business() {
  const { t } = useLanguage()
  const [selected, setSelected] = useState<PackKey | null>(null)
  const [form, setForm] = useState({ name: '', email: '', business: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ portalUrl: string; email: string } | null>(null)

  const PACKS: Record<PackKey, { title: string; price: string; cadence: string; tagline: string; features: string[]; cta: string; popular?: boolean }> = {
    starter: {
      title: t('biz.plan.starter.title'),
      price: '€89',
      cadence: t('biz.plan.cadence'),
      tagline: t('biz.plan.starter.tagline'),
      features: PLAN_FEATURES.starter.map((feature) => t(`biz.plan.starter.${feature}`)),
      cta: t('biz.plan.starter.cta'),
    },
    growth: {
      title: t('biz.plan.growth.title'),
      price: '€189',
      cadence: t('biz.plan.cadence'),
      tagline: t('biz.plan.growth.tagline'),
      features: PLAN_FEATURES.growth.map((feature) => t(`biz.plan.growth.${feature}`)),
      cta: t('biz.plan.growth.cta'),
      popular: true,
    },
    pro: {
      title: t('biz.plan.pro.title'),
      price: '€300',
      cadence: t('biz.plan.cadence'),
      tagline: t('biz.plan.pro.tagline'),
      features: PLAN_FEATURES.pro.map((feature) => t(`biz.plan.pro.${feature}`)),
      cta: t('biz.plan.pro.cta'),
    },
  }

  const openIntake = (pack: PackKey) => {
    setSelected(pack)
    setSuccess(null)
    setTimeout(() => document.querySelector('#intake')?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setSubmitting(true)
    try {
      const v = intakeSchema.parse(form)
      const pack = PACKS[selected]
      const title = t('biz.requestTitle', { pack: pack.title, business: v.business })
      const description = t('biz.requestBody', { business: v.business, pack: pack.title, price: pack.price, cadence: pack.cadence, message: v.message })

      const { data: inserted, error } = await supabase
        .from('requests')
        .insert({
          submitter_name: v.name,
          submitter_email: v.email,
          title,
          description,
          category: 'feature',
          priority: selected === 'pro' ? 'high' : selected === 'growth' ? 'medium' : 'low',
        })
        .select('id, public_token')
        .single()

      if (error) throw error
      if (!inserted) throw new Error('No record returned')

      supabase.functions.invoke('classify-request', { body: { request_id: inserted.id } })
        .catch((err) => console.error('Classify failed:', err))

      supabase.functions.invoke('send-contact-notification', {
        body: { name: v.name, email: v.email, message: `${title}\n\n${description}` },
      }).catch((err) => console.error('Staff notification failed:', err))

      const portalUrl = `${window.location.origin}/r/${inserted.public_token}`
      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'request-received',
          recipientEmail: v.email,
          idempotencyKey: `request-received-${inserted.id}`,
          templateData: { name: v.name, title, portalUrl },
        },
      }).catch((err) => console.error('Customer confirmation failed:', err))

      setSuccess({ portalUrl, email: v.email })
      setForm({ name: '', email: '', business: '', message: '' })
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        toast.error(t('biz.errCheck'), { description: t('biz.errValidationDesc') })
      } else if (err instanceof Error && err.message.includes('Rate limit')) {
        toast.error(t('biz.errRate'), { description: t('biz.errRateDesc') })
      } else {
        toast.error(t('biz.errGeneric'), { description: t('biz.errGenericDesc') })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const copyPortal = async () => {
    if (!success) return
    try { await navigator.clipboard.writeText(success.portalUrl); toast.success(t('biz.copied')) }
    catch { toast.error(t('biz.copyFailed')) }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins">
      <Seo
        title={t('biz.seoTitle')}
        description={t('biz.seoDescription')}
        path="/business"
      />
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-24">
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-border mb-8"
            >
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">{t('biz.badge')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6"
            >
              {t('biz.heroPre')} <span className="text-accent">{t('biz.heroAccent')}</span> {t('biz.heroPost')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 font-light"
            >
              {t('biz.heroSub')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => document.querySelector('#intake')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-electric px-8 py-4 rounded-2xl text-lg font-semibold inline-flex items-center gap-2"
              >
                {t('biz.ctaStart')} <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => openIntake('growth')}
                className="px-8 py-4 rounded-2xl text-lg font-semibold border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                {t('biz.ctaQuote')}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
            >
              {[
                { icon: Globe, label: t('biz.chip1') },
                { icon: TrendingUp, label: t('biz.chip2') },
                { icon: Bot, label: t('biz.chip3') },
                { icon: Zap, label: t('biz.chip4') },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Icon className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <LogoBar label="Trusted by founders and small businesses we have shipped for" />

      {/* PACKAGES */}
      <section id="packs" className="py-24 bg-background">

        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('biz.packsTitle')}</h2>
            <p className="text-muted-foreground text-lg">{t('biz.packsSub')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {(Object.keys(PACKS) as PackKey[]).map((key) => {
              const p = PACKS[key]
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5 }}
                  className={`relative rounded-3xl border p-8 flex flex-col ${
                    p.popular
                      ? 'border-accent bg-accent/[0.04] shadow-[0_0_60px_-20px_hsl(var(--accent)/0.5)]'
                      : 'border-border bg-card'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wide">
                      {t('biz.popular')}
                    </span>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{p.title}</h3>
                  <p className="text-muted-foreground mb-6">{p.tagline}</p>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-5xl font-extrabold text-foreground">{p.price}</span>
                    <span className="text-muted-foreground">{p.cadence}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-foreground/80">
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => openIntake(key)}
                    className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
                      p.popular
                        ? 'btn-electric'
                        : 'border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground'
                    }`}
                  >
                    {p.cta}
                  </button>
                </motion.div>
              )
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10">
            {t('biz.notSurePre')}{' '}
            <button onClick={() => openIntake('growth')} className="text-accent underline underline-offset-4 hover:opacity-80">
              {t('biz.notSureLink')}
            </button>{' '}
            {t('biz.notSurePost')}
          </p>
        </div>
      </section>

      {/* INTAKE */}
      <section id="intake" className="py-24 bg-primary">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
                {t('biz.intakeTitlePre')} <span className="text-accent">{t('biz.intakeTitleAccent')}</span> {t('biz.intakeTitlePost')}
              </h2>
              <p className="text-primary-foreground/80 text-lg font-light mb-8">
                {t('biz.intakeDesc')}
              </p>
              {selected && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-sm text-accent font-medium">
                  {t('biz.selected', { pack: PACKS[selected].title })}
                </div>
              )}
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-accent/30 rounded-2xl p-8 flex flex-col justify-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-primary-foreground mb-3">{t('biz.successTitle')}</h3>
                <p className="text-primary-foreground/70 leading-relaxed mb-6">
                  {t('biz.successBody', { email: success.email })}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={success.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-electric px-5 py-3 rounded-2xl font-semibold text-sm inline-flex items-center justify-center gap-2"
                  >
                    {t('biz.openPortal')} <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={copyPortal}
                    className="px-5 py-3 rounded-2xl font-semibold text-sm border border-white/15 text-primary-foreground hover:bg-white/5 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> {t('biz.copyLink')}
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                {!selected && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {(Object.keys(PACKS) as PackKey[]).map((k) => (
                      <button
                        type="button"
                        key={k}
                        onClick={() => setSelected(k)}
                        className="px-4 py-3 rounded-2xl border border-white/15 text-primary-foreground/80 hover:border-accent hover:text-accent text-sm font-medium transition-colors"
                      >
                        {PACKS[k].title}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('biz.fName')}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t('biz.fEmail')}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors"
                />
                <input
                  type="text"
                  value={form.business}
                  onChange={(e) => setForm({ ...form, business: e.target.value })}
                  placeholder={t('biz.fBiz')}
                  required
                  maxLength={150}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors"
                />
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t('biz.fMsg')}
                  rows={5}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting || !selected}
                  className="w-full py-4 btn-electric rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? t('biz.sending') : selected ? t('biz.submitWith', { pack: PACKS[selected].title }) : t('biz.submitPick')}
                </button>
                <p className="text-xs text-primary-foreground/40 text-center">
                  {t('biz.footnote')}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
