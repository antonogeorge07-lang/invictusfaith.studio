import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  title?: string
  quoteTitle?: string
  totalDisplay?: string
  notes?: string
  acceptUrl?: string
  declineUrl?: string
  portalUrl?: string
}

const QuoteSentEmail = ({ name, title, quoteTitle, totalDisplay, notes, acceptUrl, declineUrl, portalUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your quote from Invictus Faith Studio</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={badge}>QUOTE</Text>
          <Heading style={h1}>{name ? `Hi ${name}, here is your quote.` : 'Here is your quote.'}</Heading>
          {title && <Text style={ref}>Request: <strong>{title}</strong></Text>}

          <Section style={quoteBox}>
            <Text style={quoteLabel}>{quoteTitle ?? 'Project quote'}</Text>
            <Text style={total}>{totalDisplay ?? ''}</Text>
            {notes && <Text style={notesStyle}>{notes}</Text>}
          </Section>

          <Section style={{ textAlign: 'center' as const }}>
            {acceptUrl && (
              <Button style={acceptBtn} href={acceptUrl}>Accept quote</Button>
            )}
            {declineUrl && (
              <>
                {' '}
                <Button style={declineBtn} href={declineUrl}>Decline</Button>
              </>
            )}
          </Section>

          {portalUrl && (
            <Text style={muted}>
              Or open your request page to discuss: <a href={portalUrl} style={link}>{portalUrl}</a>
            </Text>
          )}

          <Text style={footer}>This quote was prepared just for you. Replies are always welcome.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: QuoteSentEmail,
  subject: 'Your quote from Invictus Faith Studio',
  displayName: 'Quote sent',
  previewData: {
    name: 'Jane', title: 'AI tutor MVP', quoteTitle: 'AI tutor MVP build',
    totalDisplay: 'EUR 4,500', notes: 'Includes 2 rounds of revisions and 1 month of post-launch support.',
    acceptUrl: 'https://example.com/a', declineUrl: 'https://example.com/d', portalUrl: 'https://invictusfaith.studio/r/sample'
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Poppins', 'Inter', Arial, sans-serif", padding: '40px 20px' }
const container = { maxWidth: '560px', margin: '0 auto' }
const card = { backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '40px 32px' }
const badge = { fontSize: '11px', letterSpacing: '0.18em', color: '#00B377', fontWeight: 600 as const, margin: '0 0 12px' }
const h1 = { fontSize: '22px', fontWeight: 700 as const, color: '#0A0A0A', margin: '0 0 12px', letterSpacing: '-0.02em' }
const ref = { fontSize: '13px', color: '#666666', margin: '0 0 24px' }
const quoteBox = { backgroundColor: '#0A0A0A', borderRadius: '12px', padding: '24px', margin: '0 0 28px', textAlign: 'center' as const }
const quoteLabel = { fontSize: '12px', color: '#FFFFFF', opacity: 0.6, letterSpacing: '0.08em', margin: '0 0 8px' }
const total = { fontSize: '32px', fontWeight: 700 as const, color: '#00FFAB', margin: '0 0 12px' }
const notesStyle = { fontSize: '13px', color: '#FFFFFF', opacity: 0.8, lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' as const }
const acceptBtn = { backgroundColor: '#00FFAB', color: '#0A0A0A', fontSize: '14px', fontWeight: 700 as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const declineBtn = { backgroundColor: '#FFFFFF', color: '#0A0A0A', border: '1px solid #E5E5E5', fontSize: '14px', fontWeight: 600 as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const link = { color: '#00B377', textDecoration: 'underline' }
const muted = { fontSize: '12px', color: '#666666', margin: '20px 0 0', textAlign: 'center' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
