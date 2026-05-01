import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Invictus Faith Studio'

interface Props {
  name?: string
  title?: string
  portalUrl?: string
}

const RequestReceivedEmail = ({ name, title, portalUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your request at {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Heading style={h1}>{name ? `Thanks, ${name}.` : 'Thanks for reaching out.'}</Heading>
          <Text style={text}>
            We received your request{title ? <> regarding <strong>{title}</strong></> : ''} and our team is reviewing it.
            You can track progress, see updates, and reply at any time using the link below.
          </Text>
          {portalUrl && (
            <Button style={button} href={portalUrl}>Open your request</Button>
          )}
          <Text style={footer}>
            We typically reply within 1 business day.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: RequestReceivedEmail,
  subject: 'We received your request',
  displayName: 'Request received',
  previewData: { name: 'Jane', title: 'New AI tutor idea', portalUrl: 'https://invictusfaith.studio/r/sample' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Poppins', 'Inter', Arial, sans-serif", padding: '40px 20px' }
const container = { maxWidth: '560px', margin: '0 auto' }
const card = { backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '40px 32px' }
const h1 = { fontSize: '24px', fontWeight: 700 as const, color: '#0A0A0A', margin: '0 0 20px', letterSpacing: '-0.02em' }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6', margin: '0 0 28px' }
const button = { backgroundColor: '#0A0A0A', color: '#00FFAB', fontSize: '14px', fontWeight: 600 as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0', lineHeight: '1.5' }
