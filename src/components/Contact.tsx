'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/i18n/LanguageContext'
import { z } from 'zod'

// Input validation schema
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
  message: z.string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
})

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate input before submission
      const validatedData = contactSchema.parse(formData)

      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: validatedData.name,
          email: validatedData.email,
          message: validatedData.message,
        })

      if (error) throw error

      toast.success(t('contact.success'), { description: t('contact.successDesc') })
      setFormData({ name: '', email: '', message: '' })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0]
        toast.error(t('contact.validationError'), { description: firstError.message })
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

  return (
    <footer className="relative bg-primary pt-24 pb-12 overflow-hidden">
      {/* Decorative line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 mb-24">
          {/* Left Side: Tagline */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              {t('contact.title')}{' '}
              <span className="text-accent">{t('contact.titleAccent')}</span>
            </h2>
            <p className="text-primary-foreground/60 text-lg font-light">
              {t('contact.description')}
            </p>
          </motion.div>

          {/* Right Side: Form */}
          <motion.form 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
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
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t('contact.messagePlaceholder')}
              rows={4}
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
          </motion.form>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-bold text-primary-foreground tracking-tight">
              Faith Invictus Studio
            </span>
            <p className="text-xs text-primary-foreground/40 mt-1 uppercase tracking-[0.2em]">
              Faith. Invincible. Together.
            </p>
          </div>
          
          <div className="flex gap-8 text-sm text-primary-foreground/60">
            <a href="#hero" className="hover:text-accent transition-colors">{t('nav.home')}</a>
            <a href="#mvps" className="hover:text-accent transition-colors">{t('nav.mvps')}</a>
            <a href="#pillars" className="hover:text-accent transition-colors">{t('nav.pillars')}</a>
            <a href="#contact" className="hover:text-accent transition-colors">{t('nav.contact')}</a>
          </div>

          <p className="text-[10px] text-primary-foreground/30 uppercase font-mono">
            © 2026 Faith Invictus Studio. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
