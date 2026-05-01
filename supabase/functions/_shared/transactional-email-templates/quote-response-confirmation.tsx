import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  decision?: 'accepted' | 'declined'
  quoteTitle?: string
  portalUrl?: string
}

const QuoteResponseConfirmationEmail = ({ name, decision, quoteTitle, portalUrl }: Props) => {
  const accepted = decision === 'accepted'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{accepted ? 'Thanks for accepting your quote' : 'Thanks for letting us know'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Heading style={h1}>
              {accepted ? (name ? `Thanks, ${name}.` : 'Thanks!') : (name ? `No problem, ${name}.` : 'No problem.')}
            </Heading>
            <Text style={text}>
              {accepted
                ? `We received your acceptance${quoteTitle ? ` of "${quoteTitle}"` : ''}. We will be in touch shortly with the next steps.`
                : `We have logged that you declined${quoteTitle ? ` "${quoteTitle}"` : ' the quote'}. If anything changes, just reply on your request page.`}
            </Text>
            {portalUrl && <Button style={button} href={portalUrl}>Open your request</Button>}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: QuoteResponseConfirmationEmail,
  subject: (data: Record<string, any>) => data.decision === 'accepted' ? 'Thanks for accepting your quote' : 'Thanks for letting us know',
  displayName: 'Quote response confirmation',
  previewData: { name: 'Jane', decision: 'accepted', quoteTitle: 'AI tutor MVP build', portalUrl: 'https://invictusfaith.studio/r/sample' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Poppins', 'Inter', Arial, sans-serif", padding: '40px 20px' }
const container = { maxWidth: '560px', margin: '0 auto' }
const card = { backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '40px 32px' }
const h1 = { fontSize: '24px', fontWeight: 700 as const, color: '#0A0A0A', margin: '0 0 16px', letterSpacing: '-0.02em' }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6', margin: '0 0 28px' }
const button = { backgroundColor: '#0A0A0A', color: '#00FFAB', fontSize: '14px', fontWeight: 600 as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
