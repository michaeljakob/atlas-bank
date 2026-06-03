import { Container } from '@/components/ui/container';
import Link from 'next/link';

export const metadata = { title: 'Careers — Auriga' };

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-auriga-bg-subtle py-16">
      <Container className="max-w-2xl">
        <Link href="/" className="inline-flex items-center mb-10">
          <img src="/auriga-lockup.svg" alt="Auriga" className="h-8 w-auto" />
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight mb-4">Careers at Auriga</h1>
        <p className="text-auriga-text-secondary mb-8">Help us build the future of borderless finance.</p>
        <div className="bg-white rounded-2xl border border-auriga-border/70 p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-auriga-bg-subtle flex items-center justify-center">
            <svg className="w-7 h-7 text-auriga-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">No open positions right now</h2>
          <p className="text-sm text-auriga-text-secondary max-w-sm mx-auto">We&apos;re a small team building fast. Drop your CV to <a href="mailto:careers@aurigamoney.com" className="text-auriga-text-primary font-medium hover:underline">careers@aurigamoney.com</a> and we&apos;ll reach out when something opens up.</p>
        </div>
      </Container>
    </div>
  );
}
