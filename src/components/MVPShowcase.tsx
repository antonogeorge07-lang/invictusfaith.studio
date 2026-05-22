'use client'

import { motion } from 'framer-motion'
import { Globe, Users, Brain, ShoppingBag, Network, Sparkles } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
}

export function MVPShowcase() {
  const { t } = useLanguage()

  const mvps = [
    {
      nameKey: 'mvp.polylinq.name',
      descKey: 'mvp.polylinq.desc',
      statusKey: 'mvp.polylinq.status',
      icon: Globe,
      url: 'https://poly-linq.com/',
    },
    {
      nameKey: 'mvp.mentorverse.name',
      descKey: 'mvp.mentorverse.desc',
      statusKey: 'mvp.mentorverse.status',
      icon: Users,
      url: 'https://invictus-faith-studio.streamlit.app/',
    },
    {
      nameKey: 'mvp.saai.name',
      descKey: 'mvp.saai.desc',
      statusKey: 'mvp.saai.status',
      icon: Brain,
      url: 'https://spark-agile.com/',
    },
    {
      nameKey: 'mvp.faithcommerce.name',
      descKey: 'mvp.faithcommerce.desc',
      statusKey: 'mvp.faithcommerce.status',
      icon: ShoppingBag,
      url: '',
    },
    {
      nameKey: 'mvp.invictusnetwork.name',
      descKey: 'mvp.invictusnetwork.desc',
      statusKey: 'mvp.invictusnetwork.status',
      icon: Network,
      url: '',
    },
    {
      nameKey: 'mvp.more.name',
      descKey: 'mvp.more.desc',
      statusKey: 'mvp.more.status',
      icon: Sparkles,
      url: '#contact',
    },
  ]

  return (
    <section className="relative py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.01 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-px bg-accent" />
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">{t('mvp.label')}</span>
            <div className="w-12 h-px bg-accent" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.01 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-6"
          >
            {t('mvp.title')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.01 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {t('mvp.description')}
          </motion.p>
        </div>

        {/* MVP Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {mvps.map((mvp) => {
            const CardWrapper = mvp.url ? 'a' : 'div'
            const linkProps = mvp.url ? {
              href: mvp.url,
              target: mvp.url.startsWith('http') ? '_blank' : undefined,
              rel: mvp.url.startsWith('http') ? 'noopener noreferrer' : undefined,
            } : {}

            return (
              <motion.div
                key={mvp.nameKey}
                variants={itemVariants}
              >
                <CardWrapper
                  {...linkProps}
                  className="block group glass-card rounded-3xl p-8 transition-all duration-300 card-glow hover:scale-[1.02] cursor-pointer h-full"
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <mvp.icon className="w-7 h-7 text-accent" />
                    </div>
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider px-3 py-1 rounded-full bg-accent/10">
                      {t(mvp.statusKey)}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                    {t(mvp.nameKey)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(mvp.descKey)}
                  </p>
                </CardWrapper>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
