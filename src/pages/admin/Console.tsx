'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { OverviewBody } from '@/components/admin/OverviewBody'
import { InboxBody } from '@/components/admin/InboxBody'
import { BoardBody } from '@/components/admin/BoardBody'
import { SamplesBody } from '@/components/admin/SamplesBody'
import { Seo } from '@/components/Seo'
import { LayoutDashboard, Inbox, Kanban, Sparkles } from 'lucide-react'

type Tab = 'overview' | 'inbox' | 'board' | 'samples'

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'board', label: 'Kanban', icon: Kanban },
  { id: 'samples', label: 'Showcase', icon: Sparkles },
]

export default function AdminConsole() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <AdminLayout title="Owner Console">
      <Seo title="Owner Console | Invictus Faith Studio" description="Unified admin console: overview, inbox, and kanban." path="/admin" noindex />

      {/* Tab bar */}
      <div className="mb-6 sticky top-[57px] z-10 -mx-6 lg:-mx-8 px-6 lg:px-8 pt-1 pb-3 bg-gradient-to-b from-primary via-primary/95 to-transparent backdrop-blur">
        <div className="inline-flex p-1 rounded-2xl bg-white/5 border gap-1 border-emerald-400">
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
                  active ? 'text-primary' : 'text-primary-foreground/60 hover:text-primary-foreground'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="admin-tab-pill"
                    className="absolute inset-0 bg-accent rounded-xl shadow-[0_0_24px_-4px_hsl(var(--accent))]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'overview' && <OverviewBody />}
          {tab === 'inbox' && <InboxBody />}
          {tab === 'board' && <BoardBody />}
        </motion.div>
      </AnimatePresence>
    </AdminLayout>
  )
}
