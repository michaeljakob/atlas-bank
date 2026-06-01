import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32">
      <div className="absolute inset-0 bg-gradient-to-br from-atlas-bg-subtle via-white to-atlas-accent/5" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-atlas-accent/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-atlas-accent/5 blur-3xl" />

      <Container className="relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-atlas-accent/10 border border-atlas-accent/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-atlas-accent animate-pulse" />
              <span className="text-xs font-medium text-atlas-text-primary">Now live in the EU</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-medium tracking-tight leading-[1.08]">
              Your money,<br />
              <span className="relative">
                everywhere
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-atlas-accent/60" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 8C40 2 80 2 100 6C120 10 160 4 198 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-atlas-text-secondary font-normal text-3xl sm:text-4xl block mt-2">you need it.</span>
            </h1>

            <p className="mt-6 text-lg text-atlas-text-secondary max-w-md leading-relaxed">
              Get a EUR IBAN in 60 seconds. A Mastercard in your wallet instantly. 
              Send, spend, and get paid — like a local, anywhere.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
              <Button size="lg" asChild>
                <Link href="/onboarding">Get started — it&apos;s free</Link>
              </Button>
              <div className="flex items-center gap-3 text-sm text-atlas-text-secondary">
                <div className="flex -space-x-2">
                  <img src="https://i.pravatar.cc/40?img=1" alt="" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="https://i.pravatar.cc/40?img=5" alt="" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="https://i.pravatar.cc/40?img=8" alt="" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="https://i.pravatar.cc/40?img=12" alt="" className="w-8 h-8 rounded-full border-2 border-white" />
                </div>
                <span>Join 2,400+ people</span>
              </div>
            </div>

            {/* Trust logos */}
            <div className="mt-12 flex items-center gap-6 opacity-60">
              <svg viewBox="0 0 48 32" className="h-7 w-auto"><rect width="48" height="32" rx="4" fill="#1A1F36"/><circle cx="20" cy="16" r="9" fill="#EB001B"/><circle cx="28" cy="16" r="9" fill="#F79E1B"/><path d="M24 9.5a9 9 0 000 13" fill="#FF5F00"/></svg>
              <svg viewBox="0 0 60 20" className="h-5 w-auto"><text x="0" y="16" fontFamily="system-ui" fontWeight="bold" fontSize="14" fill="#333">SEPA</text></svg>
              <svg viewBox="0 0 24 24" className="h-6 w-auto" fill="none" stroke="#333" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
              <span className="text-xs font-medium text-atlas-text-primary">ACPR Regulated</span>
            </div>
          </div>

          {/* Right — phone mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-[280px] sm:w-[320px]">
              {/* Phone frame */}
              <div className="relative bg-atlas-dark-surface rounded-[2.5rem] p-3 shadow-2xl shadow-atlas-dark-surface/20">
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-6 py-3 bg-atlas-bg-subtle">
                    <span className="text-xs font-medium">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-2 bg-atlas-text-primary rounded-sm" />
                    </div>
                  </div>
                  {/* App content */}
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs text-atlas-text-secondary">Balance</p>
                        <p className="text-2xl font-medium">€2,450.00</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-atlas-accent/20 flex items-center justify-center">
                        <span className="text-sm">A</span>
                      </div>
                    </div>
                    {/* IBAN */}
                    <div className="bg-atlas-bg-subtle rounded-xl p-3 mb-4">
                      <p className="text-[10px] text-atlas-text-secondary mb-1">YOUR IBAN</p>
                      <p className="text-xs font-mono font-medium">DE89 3704 0044 0532 0130 00</p>
                    </div>
                    {/* Transactions */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-xs">+</div>
                          <div>
                            <p className="text-xs font-medium">Acme Corp</p>
                            <p className="text-[10px] text-atlas-text-secondary">Salary</p>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-atlas-success">+€3,500.00</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">↑</div>
                          <div>
                            <p className="text-xs font-medium">Spotify</p>
                            <p className="text-[10px] text-atlas-text-secondary">Subscription</p>
                          </div>
                        </div>
                        <p className="text-xs font-medium">-€9.99</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-xs">+</div>
                          <div>
                            <p className="text-xs font-medium">Freelance Client</p>
                            <p className="text-[10px] text-atlas-text-secondary">Invoice #42</p>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-atlas-success">+€1,200.00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-4 -left-8 w-48 bg-atlas-dark-surface text-white rounded-xl p-4 shadow-xl rotate-[-4deg]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-gray-400">VIRTUAL CARD</span>
                  <svg viewBox="0 0 48 32" className="h-4 w-auto"><circle cx="16" cy="16" r="8" fill="#EB001B"/><circle cx="24" cy="16" r="8" fill="#F79E1B"/></svg>
                </div>
                <p className="font-mono text-xs tracking-wider">•••• •••• •••• 4289</p>
                <p className="text-[10px] text-gray-400 mt-2">Added to Apple Pay ✓</p>
              </div>
              {/* Floating notification */}
              <div className="absolute -top-2 -right-4 bg-white rounded-xl px-4 py-2.5 shadow-lg border border-atlas-border animate-bounce">
                <p className="text-[11px] font-medium text-atlas-success">✓ IBAN ready in 47s</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
