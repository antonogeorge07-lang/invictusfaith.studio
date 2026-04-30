'use client'

import { useEffect, useState, ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import {
  LayoutDashboard, Inbox, Kanban, LogOut, Shield, ArrowLeft, Menu, X
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Props {
  children: ReactNode
  title: string
}

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/inbox', label: 'Inbox', icon: Inbox },
  { to: '/admin/board', label: 'Kanban', icon: Kanban },
]

export function AdminLayout({ children, title }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [isStaff, setIsStaff] = useState<boolean | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) navigate('/auth')
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (!session?.user) navigate('/auth')
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
      const roles = (data ?? []).map(r => r.role)
      setIsStaff(roles.some(r => ['owner','admin','designer'].includes(r)))
    })()
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (isStaff === null) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-pulse text-primary-foreground">Loading...</div>
      </div>
    )
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-accent mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-primary-foreground mb-4">Access Denied</h1>
          <p className="text-primary-foreground/60 mb-8">
            You need Owner, Admin, or Designer access to view this console.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-primary-foreground hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to site
            </a>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 px-6 py-3 btn-electric rounded-xl">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-primary border-r border-white/10 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10">
          <a href="/" className="text-primary-foreground font-bold text-lg tracking-tight">
            Owner Console
          </a>
          <p className="text-xs text-primary-foreground/40 mt-1 uppercase tracking-widest">
            Invictus Faith Studio
          </p>
        </div>
        <nav className="p-4 space-y-1">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/30'
                    : 'text-primary-foreground/70 hover:bg-white/5 hover:text-primary-foreground'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <p className="text-xs text-primary-foreground/40 truncate mb-2">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-primary-foreground hover:bg-white/10 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden" />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="border-b border-white/10 bg-primary/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-primary-foreground/70 hover:text-primary-foreground"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-primary-foreground">{title}</h1>
            </div>
            <a href="/" className="text-primary-foreground/60 hover:text-accent transition-colors text-sm flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to site</span>
            </a>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
