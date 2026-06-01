import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export function BusinessHero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="absolute inset-0 bg-gradient-to-br from-atlas-bg-subtle via-white to-emerald-50/30" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-atlas-accent/5 blur-3xl" />

      <Container className="relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
              <svg className="w-4 h-4 text-atlas-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
              <span className="text-xs font-medium text-atlas-text-primary">Atlas Business</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-medium tracking-tight leading-[1.08]">
              The business account<br />
              for going{' '}
              <span className="relative inline-block">
                global
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-atlas-accent/60" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 8C40 2 80 2 100 6C120 10 160 4 198 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="mt-6 text-lg text-atlas-text-secondary max-w-lg leading-relaxed">
              Make payments, get paid, spend and manage finances in EUR. Save time, money and hassle with the all-in-one Atlas Business account.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
              <Button size="lg" asChild>
                <Link href="/onboarding">Open a business account</Link>
              </Button>
              <Button variant="secondary" size="lg">
                Contact sales
              </Button>
            </div>
          </div>

          {/* Right — card visual */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Business card */}
              <div className="w-80 h-48 bg-gradient-to-br from-atlas-dark-surface to-[#1a3d0a] rounded-2xl p-6 shadow-2xl shadow-atlas-dark-surface/30 transform rotate-[-2deg]">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-atlas-accent flex items-center justify-center">
                      <span className="text-[10px] font-bold text-atlas-dark-surface">A</span>
                    </div>
                    <span className="text-white text-sm font-medium">Atlas Business</span>
                  </div>
                  <svg viewBox="0 0 48 32" className="h-6 w-auto"><circle cx="16" cy="16" r="10" fill="#EB001B" opacity="0.9"/><circle cx="28" cy="16" r="10" fill="#F79E1B" opacity="0.9"/><path d="M22 8a10 10 0 000 16" fill="#FF5F00" opacity="0.9"/></svg>
                </div>
                <p className="font-mono text-white/90 text-lg tracking-[0.2em] mb-6">•••• •••• •••• 7842</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/50 uppercase">Business</p>
                    <p className="text-sm text-white/80">Acme Technologies</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase">Exp</p>
                    <p className="text-sm text-white/80">09/28</p>
                  </div>
                </div>
              </div>

              {/* Floating stats */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl px-4 py-3 shadow-lg border border-atlas-border">
                <p className="text-[10px] text-atlas-text-secondary uppercase tracking-wide">This month</p>
                <p className="text-lg font-medium text-atlas-success">+€47,200</p>
                <p className="text-[10px] text-atlas-text-secondary">12 payments received</p>
              </div>

              {/* Floating team */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl px-4 py-3 shadow-lg border border-atlas-border">
                <p className="text-[10px] text-atlas-text-secondary mb-2">Team cards active</p>
                <div className="flex -space-x-2">
                  <img src="https://i.pravatar.cc/32?img=11" alt="" className="w-7 h-7 rounded-full border-2 border-white" />
                  <img src="https://i.pravatar.cc/32?img=23" alt="" className="w-7 h-7 rounded-full border-2 border-white" />
                  <img src="https://i.pravatar.cc/32?img=36" alt="" className="w-7 h-7 rounded-full border-2 border-white" />
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-atlas-accent/20 flex items-center justify-center text-[10px] font-medium">+4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
