import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  title?: string
  message?: string
  portalUrl?: string
}

const RequestMessageEmail = ({ name, title, message, portalUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{title ? `New message about ${title}` : 'New message from Invictus Faith Studio'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={badge}>NEW MESSAGE</Text>
          <Heading style={h1}>{name ? `Hi ${name},` : 'Hello,'}</Heading>
          {title && <Text style={ref}>About: <strong>{title}</strong></Text>}
          <Section style={quote}>
            <Text style={quoteText}>{message ?? ''}</Text>
          </Section>
          {portalUrl && <Button style={button} href={portalUrl}>Reply to this message</Button>}
          <Text style={footer}>Open your request page to keep the conversation going.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: RequestMessageEmail,
  subject: (data: Record<string, any>) => data.title ? `New message about ${data.title}` : 'New message from Invictus Faith Studio',
  displayName: 'Request message',
  previewData: { name: 'Jane', title: 'New AI tutor idea', message: 'Quick question on your idea, can we hop on a 15 min call?', portalUrl: 'https://invictusfaith.studio/r/sample' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Poppins', 'Inter', Arial, sans-serif", padding: '40px 20px' }
const container = { maxWidth: '560px', margin: '0 auto' }
const card = { backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '40px 32px' }
const badge = { fontSize: '11px', letterSpacing: '0.18em', color: '#00B377', fontWeight: 600 as const, margin: '0 0 12px' }
const h1 = { fontSize: '22px', fontWeight: 700 as const, color: '#0A0A0A', margin: '0 0 12px', letterSpacing: '-0.02em' }
const ref = { fontSize: '13px', color: '#666666', margin: '0 0 16px' }
const quote = { backgroundColor: '#F7F7F7', borderLeft: '3px solid #00FFAB', borderRadius: '8px', padding: '16px 20px', margin: '0 0 24px' }
const quoteText = { fontSize: '15px', color: '#222222', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' as const }
const button = { backgroundColor: '#0A0A0A', color: '#00FFAB', fontSize: '14px', fontWeight: 600 as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
