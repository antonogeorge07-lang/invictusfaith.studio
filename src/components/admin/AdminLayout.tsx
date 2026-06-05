'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { LogOut, Shield, ArrowLeft } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Props {
  children: ReactNode
  title: string
}

export function AdminLayout({ children, title }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [isStaff, setIsStaff] = useState<boolean | null>(null)
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
    <div className="min-h-screen bg-primary relative overflow-hidden">
      {/* Ambient glow background */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <header className="relative border-b border-white/10 bg-primary/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent/40 grid place-items-center shadow-[0_0_24px_-4px_hsl(var(--accent))]">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base lg:text-lg font-bold text-primary-foreground truncate leading-tight">{title}</h1>
              <p className="text-[10px] uppercase tracking-widest text-primary-foreground/40">Invictus Faith Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs text-primary-foreground/40 truncate max-w-[200px]">{user?.email}</span>
            <a href="/" className="text-primary-foreground/60 hover:text-accent transition-colors text-xs flex items-center gap-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5">
              <ArrowLeft className="w-3 h-3" /> <span className="hidden sm:inline">Site</span>
            </a>
            <button onClick={handleLogout}
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-xs flex items-center gap-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5">
              <LogOut className="w-3 h-3" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">{children}</main>
    </div>
  )
}
