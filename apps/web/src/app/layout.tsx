import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Atlas Bank — Your account for everywhere',
  description:
    'A bank account and card for people who live and earn across borders. Get a EUR IBAN in under a minute and a virtual Mastercard instantly.',
  keywords: [
    'neobank',
    'digital bank',
    'IBAN',
    'virtual card',
    'freelancer bank',
    'remote worker bank',
    'SEPA',
    'EUR account',
  ],
  openGraph: {
    title: 'Atlas Bank — Your account for everywhere',
    description: 'EUR IBAN in a minute. Virtual Mastercard instantly.',
    type: 'website',
    locale: 'en_EU',
  },
};

export const viewport: Viewport = {
  themeColor: '#163300',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
