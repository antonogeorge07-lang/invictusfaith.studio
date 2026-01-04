'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { 
  LogOut, Mail, User, MessageSquare, Calendar, Shield, ArrowLeft, 
  Search, Trash2, RefreshCw, ChevronLeft, ChevronRight, Filter, X
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface ContactSubmission {
  id: string
  name: string
  email: string
  message: string
  created_at: string
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50]

export default function Admin() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
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
    setIsRefreshing(true)
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
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedSubmission) return
    
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', selectedSubmission.id)

      if (error) throw error
      
      setSubmissions(prev => prev.filter(s => s.id !== selectedSubmission.id))
      toast.success('Submission deleted successfully')
    } catch (error) {
      console.error('Error deleting submission:', error)
      toast.error('Failed to delete submission')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedSubmission(null)
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

  const filteredSubmissions = useMemo(() => {
    let filtered = submissions

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.message.toLowerCase().includes(query)
      )
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
      }
      
      filtered = filtered.filter(s => new Date(s.created_at) >= filterDate)
    }

    return filtered
  }, [submissions, searchQuery, dateFilter])

  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSubmissions.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredSubmissions, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, dateFilter, itemsPerPage])

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
            <span className="text-sm text-primary-foreground/60 hidden sm:block">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-primary-foreground hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
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
          {/* Stats & Title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground">Contact Submissions</h2>
              <p className="text-primary-foreground/60 mt-1">
                {filteredSubmissions.length} of {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchSubmissions}
              disabled={isRefreshing}
              className="border-white/10 bg-white/5 text-primary-foreground hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <div className="glass-card rounded-2xl p-4 border border-white/10 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
                <Input
                  placeholder="Search by name, email, or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-primary-foreground placeholder:text-primary-foreground/40"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/40 hover:text-primary-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-primary-foreground">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Date filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                  <SelectTrigger className="w-[100px] bg-white/5 border-white/10 text-primary-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} / page</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submissions Table */}
          {paginatedSubmissions.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-white/10">
              <MessageSquare className="w-12 h-12 text-primary-foreground/30 mx-auto mb-4" />
              <p className="text-primary-foreground/60">
                {searchQuery || dateFilter !== 'all' 
                  ? 'No submissions match your filters' 
                  : 'No submissions yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block glass-card rounded-2xl border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-primary-foreground/60">Name</TableHead>
                      <TableHead className="text-primary-foreground/60">Email</TableHead>
                      <TableHead className="text-primary-foreground/60">Message</TableHead>
                      <TableHead className="text-primary-foreground/60">Date</TableHead>
                      <TableHead className="text-primary-foreground/60 w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubmissions.map((submission) => (
                      <TableRow key={submission.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium text-primary-foreground">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-accent" />
                            </div>
                            {submission.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <a 
                            href={`mailto:${submission.email}`} 
                            className="text-primary-foreground/80 hover:text-accent transition-colors flex items-center gap-2"
                          >
                            <Mail className="w-3 h-3" />
                            {submission.email}
                          </a>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="text-primary-foreground/80 truncate" title={submission.message}>
                            {submission.message}
                          </p>
                        </TableCell>
                        <TableCell className="text-primary-foreground/60 text-sm whitespace-nowrap">
                          {formatDate(submission.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedSubmission(submission)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-primary-foreground/60 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {paginatedSubmissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary-foreground">{submission.name}</h3>
                          <a 
                            href={`mailto:${submission.email}`} 
                            className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                          >
                            {submission.email}
                          </a>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-primary-foreground/60 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-primary-foreground/80 text-sm mb-3 line-clamp-3">
                      {submission.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-primary-foreground/40">
                      <Calendar className="w-3 h-3" />
                      {formatDate(submission.created_at)}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-primary-foreground/60">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-white/10 bg-white/5 text-primary-foreground hover:bg-white/10 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-primary-foreground/60 px-3">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-white/10 bg-white/5 text-primary-foreground hover:bg-white/10 disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-primary border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary-foreground">Delete Submission</AlertDialogTitle>
            <AlertDialogDescription className="text-primary-foreground/60">
              Are you sure you want to delete the submission from <strong className="text-primary-foreground">{selectedSubmission?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 text-primary-foreground hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
