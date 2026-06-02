'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/i18n/LanguageContext'

export function Vision() {
  const { t } = useLanguage()

  return (
    <section className="relative py-24 md:py-32 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
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
          className="text-lg text-muted-foreground leading-relaxed max-w-3xl"
        >
          {t('vision.description')}
        </motion.p>
      </div>
    </section>
  )
}
