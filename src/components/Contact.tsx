'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/i18n/LanguageContext'
import { z } from 'zod'
import { CheckCircle2, Copy, ExternalLink } from 'lucide-react'

const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF'-]+$/, 'Name contains invalid characters'),
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  title: z.string().trim().min(3, 'Title is too short').max(150),
  message: z.string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
})

export function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', title: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ portalUrl: string; email: string } | null>(null)
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const v = contactSchema.parse(formData)

      const { data: inserted, error } = await supabase
        .rpc('create_request', {
          _name: v.name,
          _email: v.email,
          _title: v.title,
          _description: v.message,
          _category: 'support',
          _priority: 'medium',
        })
        .maybeSingle()

      if (error) throw error

      if (inserted) {
        // AI classification (fire-and-forget)
        supabase.functions.invoke('classify-request', {
          body: { request_id: inserted.id },
        }).catch((err) => console.error('Classify failed:', err))

        // Staff notification
        supabase.functions.invoke('send-contact-notification', {
          body: {
            name: v.name,
            email: v.email,
            message: `${v.title}\n\n${v.message}`,
          },
        }).catch((err) => console.error('Staff notification failed:', err))

        // Customer confirmation
        const portalUrl = `${window.location.origin}/r/${inserted.public_token}`
        supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'request-received',
            recipientEmail: v.email,
            idempotencyKey: `request-received-${inserted.id}`,
            templateData: { name: v.name, title: v.title, portalUrl },
          },
        }).catch((err) => console.error('Customer confirmation failed:', err))

        setSuccess({ portalUrl, email: v.email })
        setFormData({ name: '', email: '', title: '', message: '' })
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(t('contact.validationError'), { description: error.errors[0].message })
        return
      }
      const isRateLimit = error?.message?.includes('Rate limit exceeded')
      toast.error(
        isRateLimit ? t('contact.rateLimitError') : t('contact.error'),
        { description: isRateLimit ? t('contact.rateLimitDesc') : t('contact.errorDesc') }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const copyPortal = async () => {
    if (!success) return
    try {
      await navigator.clipboard.writeText(success.portalUrl)
      toast.success('Link copied')
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <footer className="relative bg-primary pt-24 pb-12 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.01 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              {t('contact.title')}{' '}
              <span className="text-accent">{t('contact.titleAccent')}</span>
            </h2>
            <p className="text-primary-foreground/60 text-lg font-light">
              {t('contact.description')}
            </p>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 border border-accent/30 rounded-2xl p-8 flex flex-col justify-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-primary-foreground mb-3">
                Request received
              </h3>
              <p className="text-primary-foreground/70 leading-relaxed mb-6">
                We sent a confirmation to <span className="text-accent">{success.email}</span> with your private portal link. Use it to reply, share files, and track progress. No login required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={success.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-electric px-5 py-3 rounded-2xl font-semibold text-sm inline-flex items-center justify-center gap-2"
                >
                  Open portal <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={copyPortal}
                  className="px-5 py-3 rounded-2xl font-semibold text-sm border border-white/15 text-primary-foreground hover:bg-white/5 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copy link
                </button>
                <button
                  onClick={() => setSuccess(null)}
                  className="px-5 py-3 rounded-2xl font-semibold text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  Send another
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.01 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('contact.name')}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('contact.email')}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors"
              />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="What do you need? (one line)"
                required
                maxLength={150}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors"
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t('contact.messagePlaceholder')}
                rows={5}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 btn-electric rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('contact.sending') : t('contact.send')}
              </button>
              <p className="text-xs text-primary-foreground/40 text-center">
                We reply within 24 hours. You will get a private portal link to track your request.
              </p>
            </motion.form>
          )}
        </div>

        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-bold text-primary-foreground tracking-tight">
              Invictus Faith Studio
            </span>
            <p className="text-xs text-primary-foreground/40 mt-1 uppercase tracking-[0.2em] text-emerald-400">
              Faith. Invincible. Together.
            </p>
          </div>

          <div className="flex gap-8 text-sm text-primary-foreground/60">
            <a href="#hero" className="hover:text-accent transition-colors">{t('nav.home')}</a>
            <a href="#mvps" className="hover:text-accent transition-colors">{t('nav.mvps')}</a>
            <a href="#pillars" className="hover:text-accent transition-colors">{t('nav.pillars')}</a>
            <a href="#contact" className="hover:text-accent transition-colors">{t('nav.contact')}</a>
          </div>

          <p className="text-[10px] text-primary-foreground/30 uppercase font-mono text-emerald-400">
            © 2026 Invictus Faith Studio. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
