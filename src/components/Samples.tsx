'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'

const samples = [
  {
    name: 'Vinatea Evolve',
    tag: 'Wellness studio',
    url: 'https://vinatea-evolve.lovable.app',
  },
  {
    name: 'Café Baratto VLC',
    tag: 'Local café, Valencia',
    url: 'https://cafe-baratto-vlc.lovable.app',
  },
  {
    name: 'PolyLinq',
    tag: 'Language exchange platform',
    url: 'https://poly-linq.com/',
  },
  {
    name: 'Spark Agile',
    tag: 'AI agile coaching',
    url: 'https://spark-agile.com/',
  },
]

export function Samples() {
  const { t } = useLanguage()

  return (
    <section className="relative py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {samples.map((s, i) => {
            const screenshot = `https://image.thum.io/get/width/800/crop/600/noanimate/${s.url}`
            return (
              <motion.a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group glass-card rounded-3xl overflow-hidden card-glow hover:scale-[1.02] transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted/30 border-b border-border/40">
                  <img
                    src={screenshot}
                    alt={`${s.name} website preview`}
                    loading="lazy"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                      {s.name}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0 mt-1" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{s.tag}</p>
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
