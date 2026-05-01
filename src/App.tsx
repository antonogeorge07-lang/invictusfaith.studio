import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { LanguageProvider } from './i18n/LanguageContext'
import Index from './pages/Index'
import Auth from './pages/Auth'
import AdminOverview from './pages/admin/Overview'
import AdminInbox from './pages/admin/Inbox'
import AdminBoard from './pages/admin/Board'
import RequestPortal from './pages/RequestPortal'
import Unsubscribe from './pages/Unsubscribe'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/inbox" element={<AdminInbox />} />
          <Route path="/admin/board" element={<AdminBoard />} />
          <Route path="/r/:token" element={<RequestPortal />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
