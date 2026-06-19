import { supabase } from '@/integrations/supabase/client'

type CreateRequestInput = {
  name: string
  email: string
  title: string
  description: string
  category?: 'feature' | 'bug' | 'idea' | 'support'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

type CreatedRequest = {
  id: string
  public_token: string
}

export async function createRequest(input: CreateRequestInput): Promise<CreatedRequest> {
  const { data, error } = await (supabase as any).rpc('create_request', {
    _name: input.name,
    _email: input.email,
    _title: input.title,
    _description: input.description,
    _category: input.category ?? 'support',
    _priority: input.priority ?? 'medium',
  })

  if (error) throw error

  const row = Array.isArray(data) ? data[0] : data

  if (!row?.id || !row?.public_token) {
    throw new Error('Request created without a portal token')
  }

  return {
    id: String(row.id),
    public_token: String(row.public_token),
  }
}