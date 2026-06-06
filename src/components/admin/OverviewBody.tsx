'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/integrations/supabase/client'
import { STATUSES, PRIORITIES, STATUS_LABEL, STATUS_COLOR, PRIORITY_COLOR, type RequestRow } from '@/lib/requestHelpers'
import { Inbox, Clock, CheckCircle2, AlertCircle, TrendingUp, Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function OverviewBody() {
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })
      setRequests((data ?? []) as RequestRow[])
      setLoading(false)
    })()
  }, [])

  const total = requests.length
  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = requests.filter(r => r.status === s).length
    return acc
  }, {} as Record<string, number>)
  const byPriority = PRIORITIES.reduce((acc, p) => {
    acc[p] = requests.filter(r => r.priority === p).length
    return acc
  }, {} as Record<string, number>)
  const completionRate = total > 0 ? Math.round((byStatus.completed / total) * 100) : 0
  const open = total - byStatus.completed - byStatus.rejected
  const recent = requests.slice(0, 8)

  const stats = [
    { label: 'Total Requests', value: total, icon: Inbox, color: 'text-primary-foreground text-slate-700', glow: 'from-white/10 to-transparent' },
    { label: 'Open', value: open, icon: Activity, color: 'text-blue-400', glow: 'from-blue-500/20 to-transparent' },
    { label: 'Completed', value: byStatus.completed, icon: CheckCircle2, color: 'text-accent', glow: 'from-accent/20 to-transparent' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'text-accent', glow: 'from-accent/20 to-transparent' },
  ]

  if (loading) return <div className="text-primary-foreground/60">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative glass-card rounded-2xl p-5 border border-white/10 overflow-hidden group hover:border-accent/30 transition-colors"
          >
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${s.glow} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-primary-foreground/50 mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-white/10 text-stone-800">
          <h3 className="text-primary-foreground font-semibold mb-4 text-slate-700">Status Distribution</h3>
          <div className="space-y-3">
            {STATUSES.map(s => {
              const count = byStatus[s]
              const pct = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={s}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-md border ${STATUS_COLOR[s]}`}>{STATUS_LABEL[s]}</span>
                    <span className="text-sm text-primary-foreground/70">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} className="h-full bg-gradient-to-r from-accent to-accent/60" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 text-stone-800">
          <h3 className="text-primary-foreground font-semibold mb-4 text-slate-700">Priority Distribution</h3>
          <div className="space-y-3">
            {PRIORITIES.slice().reverse().map(p => {
              const count = byPriority[p]
              const pct = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={p}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-md border capitalize ${PRIORITY_COLOR[p]}`}>{p}</span>
                    <span className="text-sm text-primary-foreground/70">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} className="h-full bg-gradient-to-r from-accent to-accent/60" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white/10 text-stone-800">
        <h3 className="text-primary-foreground font-semibold mb-4 flex items-center gap-2 text-slate-700">
          <Clock className="w-4 h-4" /> Recent Activity
        </h3>
        {recent.length === 0 ? (
          <div className="text-primary-foreground/50 text-sm py-8 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No requests yet. They will appear here as users submit them.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {recent.map(r => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-primary-foreground text-sm font-medium truncate text-neutral-950">{r.title}</p>
                  <p className="text-primary-foreground/40 text-xs">
                    {r.submitter_name} | {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-md border ${STATUS_COLOR[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
