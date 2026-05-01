import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Invictus Faith Studio'

const STATUS_COPY: Record<string, { heading: string; body: string }> = {
  new: { heading: 'Your request is in our queue', body: 'We have your request and will start reviewing it shortly.' },
  reviewing: { heading: 'We are reviewing your request', body: 'Our team is taking a closer look. You will hear from us soon.' },
  approved: { heading: 'Good news, your request is approved', body: 'We are getting things ready to start work. Watch for a quote or next steps.' },
  in_progress: { heading: 'Your request is now in progress', body: 'Work has officially started. We will keep you posted on milestones.' },
  completed: { heading: 'Your request is complete', body: 'All done. Open the link below to review the outcome and any next steps.' },
  rejected: { heading: 'An update on your request', body: 'After review we will not be moving forward with this request. Open the link for details.' },
}

interface Props {
  name?: string
  title?: string
  status?: string
  portalUrl?: string
}

const RequestStatusUpdateEmail = ({ name, title, status, portalUrl }: Props) => {
  const copy = STATUS_COPY[status ?? 'new'] ?? STATUS_COPY.new
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{copy.heading}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Text style={badge}>STATUS UPDATE</Text>
            <Heading style={h1}>{copy.heading}</Heading>
            {title && <Text style={ref}>Request: <strong>{title}</strong></Text>}
            <Text style={text}>{name ? `Hi ${name}, ` : ''}{copy.body}</Text>
            {portalUrl && <Button style={button} href={portalUrl}>View your request</Button>}
            <Text style={footer}>Reply by opening your request page.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: RequestStatusUpdateEmail,
  subject: (data: Record<string, any>) => {
    const copy = STATUS_COPY[data.status] ?? STATUS_COPY.new
    return copy.heading
  },
  displayName: 'Request status update',
  previewData: { name: 'Jane', title: 'New AI tutor idea', status: 'in_progress', portalUrl: 'https://invictusfaith.studio/r/sample' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Poppins', 'Inter', Arial, sans-serif", padding: '40px 20px' }
const container = { maxWidth: '560px', margin: '0 auto' }
const card = { backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '40px 32px' }
const badge = { fontSize: '11px', letterSpacing: '0.18em', color: '#00B377', fontWeight: 600 as const, margin: '0 0 12px' }
const h1 = { fontSize: '24px', fontWeight: 700 as const, color: '#0A0A0A', margin: '0 0 16px', letterSpacing: '-0.02em' }
const ref = { fontSize: '13px', color: '#666666', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6', margin: '0 0 28px' }
const button = { backgroundColor: '#0A0A0A', color: '#00FFAB', fontSize: '14px', fontWeight: 600 as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
