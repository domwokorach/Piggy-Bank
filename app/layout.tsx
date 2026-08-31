import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CookieConsentProvider } from '@/components/consent/CookieConsentProvider'

export const metadata: Metadata = {
  title: 'Piggy Bank',
  description: 'Premium family banking for parents and kids.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a2a6b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CookieConsentProvider>{children}</CookieConsentProvider>
      </body>
    </html>
  )
}
