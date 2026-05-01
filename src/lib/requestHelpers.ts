export const STATUSES = ['new','reviewing','approved','in_progress','completed','rejected'] as const
export type Status = typeof STATUSES[number]

export const PRIORITIES = ['low','medium','high','urgent'] as const
export type Priority = typeof PRIORITIES[number]

export const CATEGORIES = ['feature','bug','idea','support'] as const
export type Category = typeof CATEGORIES[number]

export const STATUS_LABEL: Record<Status, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  approved: 'Approved',
  in_progress: 'In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
}

export const STATUS_COLOR: Record<Status, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  reviewing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  approved: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  in_progress: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  completed: 'bg-accent/10 text-accent border-accent/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export const PRIORITY_COLOR: Record<Priority, string> = {
  low: 'bg-white/5 text-primary-foreground/60 border-white/10',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  urgent: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export const CATEGORY_LABEL: Record<Category, string> = {
  feature: 'Feature',
  bug: 'Bug',
  idea: 'Idea',
  support: 'Support',
}

export interface RequestRow {
  id: string
  title: string
  description: string
  category: Category
  priority: Priority
  status: Status
  submitter_name: string
  submitter_email: string
  impact_score: number | null
  effort_score: number | null
  value_score: number | null
  position: number
  created_at: string
  updated_at: string
  public_token: string
  notify_on_status_change: boolean
}

export function ricePriority(impact: number | null, effort: number | null, value: number | null): number | null {
  if (!impact || !effort || !value) return null
  // Simple weighted: (impact + value) / effort, scaled to 100
  return Math.round(((impact + value) / Math.max(effort, 1)) * 10)
}
