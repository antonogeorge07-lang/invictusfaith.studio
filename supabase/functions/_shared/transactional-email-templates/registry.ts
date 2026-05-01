/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as requestReceived } from './request-received.tsx'
import { template as requestStatusUpdate } from './request-status-update.tsx'
import { template as requestMessage } from './request-message.tsx'
import { template as quoteSent } from './quote-sent.tsx'
import { template as quoteResponseConfirmation } from './quote-response-confirmation.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'request-received': requestReceived,
  'request-status-update': requestStatusUpdate,
  'request-message': requestMessage,
  'quote-sent': quoteSent,
  'quote-response-confirmation': quoteResponseConfirmation,
}
