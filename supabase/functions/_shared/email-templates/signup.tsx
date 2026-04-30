/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Heading style={h1}>Welcome to Invictus Faith</Heading>
          <Text style={text}>
            Thanks for joining{' '}
            <Link href={siteUrl} style={link}>
              <strong>{siteName}</strong>
            </Link>
            . Confirm your email ({recipient}) to activate your account.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Verify Email
          </Button>
          <Text style={footer}>
            If you didn't create an account, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Poppins', 'Inter', Arial, sans-serif", padding: '40px 20px' }
const container = { maxWidth: '560px', margin: '0 auto' }
const card = { backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '16px', padding: '40px 32px' }
const h1 = { fontSize: '24px', fontWeight: 700 as const, color: '#0A0A0A', margin: '0 0 20px', letterSpacing: '-0.02em' }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6', margin: '0 0 28px' }
const link = { color: '#0A0A0A', textDecoration: 'underline' }
const button = {
  backgroundColor: '#0A0A0A',
  color: '#00FFAB',
  fontSize: '14px',
  fontWeight: 600 as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0', lineHeight: '1.5' }
