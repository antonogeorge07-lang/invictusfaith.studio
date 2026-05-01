import { supabase } from '@/integrations/supabase/client'

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://invictusfaith.studio'

interface RequestLite {
  id: string
  title: string
  status: string
  submitter_name: string
  submitter_email: string
  public_token: string
  notify_on_status_change?: boolean | null
}

export async function notifyStatusChange(req: RequestLite, newStatus: string) {
  if (req.notify_on_status_change === false) return
  try {
    await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'request-status-update',
        recipientEmail: req.submitter_email,
        idempotencyKey: `status-${req.id}-${newStatus}`,
        templateData: {
          name: req.submitter_name,
          title: req.title,
          status: newStatus,
          portalUrl: `${SITE_URL}/r/${req.public_token}`,
        },
      },
    })
  } catch (e) {
    console.error('Status email failed', e)
  }
}

export async function sendCustomerMessage(req: RequestLite, message: string) {
  await supabase.functions.invoke('send-transactional-email', {
    body: {
      templateName: 'request-message',
      recipientEmail: req.submitter_email,
      idempotencyKey: `msg-${req.id}-${Date.now()}`,
      templateData: {
        name: req.submitter_name,
        title: req.title,
        message,
        portalUrl: `${SITE_URL}/r/${req.public_token}`,
      },
    },
  })
}

export async function sendQuoteEmail(quote: {
  id: string
  title: string
  total_cents: number
  currency: string
  notes: string | null
  accept_token: string
  decline_token: string
}, req: RequestLite) {
  const projectRef = (import.meta as any).env.VITE_SUPABASE_PROJECT_ID
  const fnBase = `https://${projectRef}.supabase.co/functions/v1/quote-respond`
  const totalDisplay = formatCurrency(quote.total_cents, quote.currency)
  await supabase.functions.invoke('send-transactional-email', {
    body: {
      templateName: 'quote-sent',
      recipientEmail: req.submitter_email,
      idempotencyKey: `quote-sent-${quote.id}`,
      templateData: {
        name: req.submitter_name,
        title: req.title,
        quoteTitle: quote.title,
        totalDisplay,
        notes: quote.notes ?? undefined,
        acceptUrl: `${fnBase}?action=accept&token=${quote.accept_token}`,
        declineUrl: `${fnBase}?action=decline&token=${quote.decline_token}`,
        portalUrl: `${SITE_URL}/r/${req.public_token}`,
      },
    },
  })
}

export function formatCurrency(cents: number, currency = 'EUR') {
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cents / 100)
}
