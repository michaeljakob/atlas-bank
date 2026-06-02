import type { Metadata, Viewport } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { CookieConsent } from '@/components/cookie-consent';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { SITE_URL } from '@/lib/site';
import { fontBody, fontHeading } from '@/fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Atlas Bank — Your account for everywhere',
    template: '%s — Atlas Bank',
  },
  description:
    'A bank account and card for people who live and earn across borders. Get a EUR IBAN in under a minute and a virtual Mastercard instantly.',
  applicationName: 'Atlas Bank',
  keywords: [
    'neobank',
    'digital bank',
    'IBAN',
    'virtual card',
    'freelancer bank',
    'remote worker bank',
    'digital nomad bank',
    'SEPA',
    'EUR account',
  ],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'Atlas Bank — Your account for everywhere',
    description: 'EUR IBAN in a minute. Virtual Mastercard instantly.',
    url: SITE_URL,
    siteName: 'Atlas Bank',
    type: 'website',
    locale: 'en_EU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atlas Bank — Your account for everywhere',
    description: 'EUR IBAN in a minute. Virtual Mastercard instantly.',
  },
};

export const viewport: Viewport = {
  themeColor: '#1C180D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`antialiased ${fontBody.variable} ${fontHeading.variable}`}
    >
      <body className="min-h-screen font-sans">
        {children}
        <Toaster />
        <CookieConsent />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
