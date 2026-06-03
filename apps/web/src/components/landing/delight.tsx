import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';
import { Highlight } from '@/components/ui/highlight';

/* A floating wrapper that gives each chip a gentle, friendly bob. */
function Float({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-float ${className ?? ''}`}
      style={{ '--float-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

const chip =
  'inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-[15px] font-semibold text-auriga-text-primary shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.06]';

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2zM19 14l.8 2.4L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.6L19 14z" />
    </svg>
  );
}

export function Delight() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-36 bg-white">
      <Container>
        <Reveal as="div" className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-auriga-text-secondary">
            Delightfully simple
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-auriga-text-primary leading-[1.1]">
            Banking that feels{' '}
            <Highlight>good to use</Highlight>
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed">
            Every tap, every screen, every little detail — designed to be the
            friendliest money app you&apos;ve ever opened.
          </p>
        </Reveal>

        {/* Floating element playground */}
        <Reveal direction="scale" delay={120} className="relative mx-auto mt-16 max-w-4xl">
          <div className="flex flex-col items-center gap-5 sm:gap-6">
            {/* Row 1 */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <Float delay={0}>
                <span className="inline-flex items-center gap-2 rounded-2xl bg-auriga-black px-4 py-3 text-[15px] font-semibold text-white">
                  <SparkleIcon className="h-4 w-4" />
                  Send instantly
                </span>
              </Float>

              <Float delay={600}>
                <span className={chip}>
                  <img
                    src="/images/avatars/avatar-beach.png"
                    alt="Ella M."
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  Ella M.
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-auriga-text-secondary/60 hover:bg-black/5">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                </span>
              </Float>

              <Float delay={1100}>
                <span className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-auriga-heather-200 px-4 py-3 text-[15px] font-semibold text-auriga-text-secondary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add money
                </span>
              </Float>
            </div>

            {/* Row 2 */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <Float delay={900}>
                <span className={chip}>
                  <svg className="h-4 w-4 text-auriga-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18l-7 8.5v6l-4 2v-8L3 4.5z" />
                  </svg>
                  Filter
                  <span className="font-bold text-auriga-accent-600">· 2</span>
                  <span className="ml-1 h-4 w-px bg-auriga-heather-200" />
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-auriga-text-secondary/60 hover:bg-black/5">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                </span>
              </Float>

              {/* Amount stepper */}
              <Float delay={300}>
                <span className={`${chip} pr-3`}>
                  <span className="text-auriga-text-secondary">€</span>
                  <span className="text-base font-bold tabular-nums">250</span>
                  <span className="ml-1 flex flex-col">
                    <button className="text-auriga-text-secondary/60 hover:text-auriga-text-primary" aria-label="Increase">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button className="text-auriga-text-secondary/60 hover:text-auriga-text-primary" aria-label="Decrease">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </span>
                </span>
              </Float>

              <Float delay={1300}>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-2xl bg-auriga-accent px-5 py-3 text-[15px] font-semibold text-auriga-black shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
                >
                  Send now
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </Float>
            </div>

            {/* Row 3 */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <Float delay={500}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.06]">
                  <svg className="h-5 w-5 text-auriga-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </span>
              </Float>

              <Float delay={1500}>
                <span className="inline-flex items-center gap-2 rounded-2xl bg-auriga-green-50 px-4 py-3 text-[15px] font-semibold text-auriga-green-800">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-auriga-green-500 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-auriga-black" />
                  </span>
                  Account active
                </span>
              </Float>

              <Float delay={200}>
                <span className="inline-flex items-center gap-2.5 rounded-2xl bg-auriga-accent/15 px-4 py-3 text-[15px] font-semibold text-auriga-accent-700">
                  <span className="block h-4 w-4 rounded-full border-2 border-dashed border-auriga-accent-600 animate-spin-slow" />
                  Transfer pending
                </span>
              </Float>

              <Float delay={1000}>
                <span className="inline-flex items-center gap-2 rounded-2xl bg-auriga-heather-100 py-2 pl-4 pr-2 text-[15px] font-medium text-auriga-text-secondary">
                  Search transactions
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/[0.06]">
                    <svg className="h-4 w-4 text-auriga-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                    </svg>
                  </span>
                </span>
              </Float>
            </div>
          </div>

          {/* Floating notification toast */}
          <Float
            delay={750}
            className="pointer-events-none absolute -bottom-6 right-0 hidden sm:block"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.3)] ring-1 ring-black/[0.06]">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-auriga-green-50 text-auriga-green-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m0 0l3.5-3.5M12 18l-3.5-3.5" />
                </svg>
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold text-auriga-text-primary">Salary received</p>
                <p className="text-xs text-auriga-text-secondary">Acme Inc · just now</p>
              </div>
              <span className="ml-2 text-sm font-bold text-auriga-green-700">+€3,200.00</span>
            </div>
          </Float>
        </Reveal>
      </Container>
    </section>
  );
}
