'use client'

import { motion } from 'framer-motion'
import { Linkedin } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import antonoPhoto from '@/assets/antono-george.png.asset.json'

const LINKEDIN_URL = 'https://www.linkedin.com/in/antono-george-pmp-open-to-work-eu-jobhunt/'

export function Vision() {
  const { t } = useLanguage()

  return (
    <section className="relative py-24 md:py-32 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Founder portrait */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.01 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 order-1 lg:order-1"
          >
            <div className="relative max-w-sm mx-auto lg:mx-0">
              <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl pulse-glow" aria-hidden />
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-primary/10 to-accent/10 shadow-2xl">
                <img
                  src={antonoPhoto.url}
                  alt={`${t('vision.founderName')}, ${t('vision.founderRole')}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>

          {/* Story */}
          <div className="lg:col-span-7 order-2 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.01 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-px bg-accent" />
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">
                {t('vision.label')}
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.01 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6"
            >
              {t('vision.headline')}{' '}
              <span className="text-accent">{t('vision.faith')}</span>{' '}
              {t('vision.headlineEnd')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.01 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed mb-8"
            >
              {t('vision.description')}
            </motion.p>

            {/* Founder card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.01 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-background/60 backdrop-blur-sm p-6 md:p-7"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-px bg-accent" />
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                  {t('vision.founderRole')}
                </span>
              </div>
              <div className="text-lg font-semibold text-foreground mb-2">
                {t('vision.founderName')}
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
                {t('vision.founderBio')}
              </p>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                <Linkedin className="w-4 h-4" aria-hidden />
                {t('vision.founderCta')}
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
