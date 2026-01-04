'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { LogOut, Mail, User, MessageSquare, Calendar, Shield, ArrowLeft } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface ContactSubmission {
  id: string
  name: string
  email: string
  message: string
  created_at: string
}

export default function Admin() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        navigate('/auth')
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        navigate('/auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (user) {
      checkAdminRole()
    }
  }, [user])

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .maybeSingle()

      if (error) throw error
      
      setIsAdmin(!!data)
      
      if (data) {
        fetchSubmissions()
      }
    } catch (error) {
      console.error('Error checking admin role:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('Failed to load submissions')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-pulse text-primary-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Shield className="w-16 h-16 text-accent mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-primary-foreground mb-4">Access Denied</h1>
          <p className="text-primary-foreground/60 mb-8">
            You don't have admin privileges. Contact the site owner to request access.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-primary-foreground hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to site
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-6 py-3 btn-electric rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="border-b border-white/10 bg-primary/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-primary-foreground/60 hover:text-accent transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="text-xl font-bold text-primary-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-foreground/60">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-primary-foreground hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground">Contact Submissions</h2>
              <p className="text-primary-foreground/60 mt-1">
                {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'} received
              </p>
            </div>
            <button
              onClick={fetchSubmissions}
              className="px-4 py-2 bg-accent/10 text-accent rounded-xl hover:bg-accent/20 transition-colors"
            >
              Refresh
            </button>
          </div>

          {submissions.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-white/10">
              <MessageSquare className="w-12 h-12 text-primary-foreground/30 mx-auto mb-4" />
              <p className="text-primary-foreground/60">No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary-foreground">{submission.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
                          <Mail className="w-3 h-3" />
                          <a href={`mailto:${submission.email}`} className="hover:text-accent transition-colors">
                            {submission.email}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary-foreground/40">
                      <Calendar className="w-3 h-3" />
                      {formatDate(submission.created_at)}
                    </div>
                  </div>
                  <p className="text-primary-foreground/80 whitespace-pre-wrap pl-14">
                    {submission.message}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
