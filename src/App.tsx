import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Index from './pages/Index'
import Business from './pages/Business'
import Auth from './pages/Auth'
import AdminConsole from './pages/admin/Console'
import RequestPortal from './pages/RequestPortal'
import Unsubscribe from './pages/Unsubscribe'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Business />} />
        <Route path="/studio" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<AdminConsole />} />
        <Route path="/admin/inbox" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/board" element={<Navigate to="/admin" replace />} />
        <Route path="/r/:token" element={<RequestPortal />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
