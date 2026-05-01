'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/admin/AdminLayout'
import {
  STATUSES, STATUS_LABEL, STATUS_COLOR, PRIORITY_COLOR, CATEGORY_LABEL,
  type RequestRow, type Status
} from '@/lib/requestHelpers'
import { notifyStatusChange } from '@/lib/customerComms'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent, useDroppable, useDraggable, closestCorners
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

function Card({ r }: { r: RequestRow }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: r.id,
    data: { request: r },
  })
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white/5 border border-white/10 hover:border-accent/40 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-colors"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-3 h-3 text-primary-foreground/30 mt-1 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-primary-foreground text-sm font-medium line-clamp-2">{r.title}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${PRIORITY_COLOR[r.priority]}`}>
              {r.priority}
            </span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded border border-white/10 text-primary-foreground/50">
              {CATEGORY_LABEL[r.category]}
            </span>
          </div>
          <p className="text-primary-foreground/40 text-[10px] mt-2 truncate">{r.submitter_name}</p>
        </div>
      </div>
    </div>
  )
}

function Column({ status, items }: { status: Status; items: RequestRow[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className={`text-xs uppercase px-2 py-1 rounded-md border ${STATUS_COLOR[status]}`}>
          {STATUS_LABEL[status]}
        </span>
        <span className="text-primary-foreground/40 text-xs">{items.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[400px] glass-card rounded-2xl p-3 space-y-2 border transition-colors ${
          isOver ? 'border-accent/50 bg-accent/5' : 'border-white/10'
        }`}
      >
        {items.length === 0 && (
          <p className="text-primary-foreground/30 text-xs text-center py-8">Drop here</p>
        )}
        {items.map(r => <Card key={r.id} r={r} />)}
      </div>
    </div>
  )
}

export default function AdminBoard() {
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeReq, setActiveReq] = useState<RequestRow | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    fetchAll()
    const channel = supabase
      .channel('requests-board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => fetchAll())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchAll() {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { toast.error('Failed to load'); return }
    setRequests((data ?? []) as RequestRow[])
    setLoading(false)
  }

  function handleDragStart(e: DragStartEvent) {
    const r = requests.find(x => x.id === e.active.id)
    setActiveReq(r ?? null)
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveReq(null)
    const { active, over } = e
    if (!over) return
    const newStatus = over.id as Status
    if (!STATUSES.includes(newStatus)) return
    const req = requests.find(r => r.id === active.id)
    if (!req || req.status === newStatus) return

    // Optimistic
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: newStatus } : r))
    const { error } = await supabase.from('requests').update({ status: newStatus }).eq('id', req.id)
    if (error) {
      toast.error('Update failed')
      fetchAll()
    } else {
      toast.success(`Moved to ${STATUS_LABEL[newStatus]}`)
      notifyStatusChange(req, newStatus)
    }
  }

  return (
    <AdminLayout title="Kanban Board">
      {loading ? (
        <div className="text-primary-foreground/60 text-center py-12">Loading...</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto pb-4 -mx-2 px-2">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex gap-4 min-w-max"
            >
              {STATUSES.map(s => (
                <Column key={s} status={s} items={requests.filter(r => r.status === s)} />
              ))}
            </motion.div>
          </div>
          <DragOverlay>
            {activeReq && (
              <div className="bg-primary border-2 border-accent rounded-xl p-3 shadow-2xl rotate-3 w-72">
                <p className="text-primary-foreground text-sm font-medium">{activeReq.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </AdminLayout>
  )
}
