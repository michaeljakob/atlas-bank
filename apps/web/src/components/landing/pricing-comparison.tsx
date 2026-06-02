import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';

type Cell = { value: string; bad?: boolean };

type Row = {
  label: string;
  atlas: string;
  wise: Cell;
  revolut: Cell;
  traditional: Cell;
};

const rows: Row[] = [
  {
    label: 'Monthly fee',
    atlas: '€0 forever',
    wise: { value: '€0' },
    revolut: { value: '€0–13.99', bad: true },
    traditional: { value: '€5–15', bad: true },
  },
  {
    label: 'Account opening',
    atlas: '60 seconds',
    wise: { value: 'Minutes' },
    revolut: { value: 'Minutes' },
    traditional: { value: 'Days to weeks', bad: true },
  },
  {
    label: 'EUR IBAN',
    atlas: 'Dedicated, in your name',
    wise: { value: 'Belgian IBAN, shared', bad: true },
    revolut: { value: 'Pooled sub-account', bad: true },
    traditional: { value: 'Dedicated' },
  },
  {
    label: 'Virtual card',
    atlas: 'Free, instant',
    wise: { value: 'Free' },
    revolut: { value: 'Free' },
    traditional: { value: 'Not available', bad: true },
  },
  {
    label: 'Physical card',
    atlas: 'Free',
    wise: { value: '€7 one-time', bad: true },
    revolut: { value: '€9.99', bad: true },
    traditional: { value: '€15–30', bad: true },
  },
  {
    label: 'SEPA transfers',
    atlas: 'Free',
    wise: { value: 'From €0.43', bad: true },
    revolut: { value: 'Free' },
    traditional: { value: '€0.20–2.00', bad: true },
  },
  {
    label: 'SEPA Instant',
    atlas: 'Free',
    wise: { value: 'Not supported', bad: true },
    revolut: { value: '€0–0.50', bad: true },
    traditional: { value: '€0.50–5.00', bad: true },
  },
  {
    label: 'FX markup',
    atlas: '0%',
    wise: { value: '0.33–1.5%', bad: true },
    revolut: { value: '0.5–2%', bad: true },
    traditional: { value: '1.5–3%', bad: true },
  },
  {
    label: 'Weekend FX surcharge',
    atlas: 'None',
    wise: { value: 'Up to 2%', bad: true },
    revolut: { value: 'Up to 1%', bad: true },
    traditional: { value: 'Varies', bad: true },
  },
  {
    label: 'Residency required',
    atlas: 'No',
    wise: { value: 'No' },
    revolut: { value: 'Varies', bad: true },
    traditional: { value: 'Yes', bad: true },
  },
  {
    label: 'Apple & Google Pay',
    atlas: 'Instant',
    wise: { value: 'Yes' },
    revolut: { value: 'Yes' },
    traditional: { value: 'Usually' },
  },
];

const GRID = 'grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr] gap-2 sm:gap-3';

function CheckBadge() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-atlas-accent-600 text-white shrink-0">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </span>
  );
}

function CrossMark() {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-atlas-error/10 text-atlas-error shrink-0">
      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </span>
  );
}

function CompetitorCell({ cell }: { cell: Cell }) {
  return (
    <div className="px-3 sm:px-5 py-3.5 flex items-center gap-2">
      {cell.bad ? (
        <CrossMark />
      ) : (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-atlas-text-secondary/10 text-atlas-text-secondary shrink-0">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
      )}
      <span className={`text-sm ${cell.bad ? 'text-atlas-text-secondary' : 'text-atlas-text-primary'}`}>
        {cell.value}
      </span>
    </div>
  );
}

export function PricingComparison() {
  return (
    <section className="py-24 sm:py-36 bg-white">
      <Container>
        <Reveal as="div" className="max-w-3xl mb-14">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-atlas-text-primary leading-[1.1]">
            See why people switch to Atlas
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-atlas-text-secondary leading-relaxed">
            Wise hides FX fees behind percentages. Revolut puts the good stuff behind a paywall.
            Atlas gives you everything upfront — a real IBAN in your name, 0% FX, free cards —
            with no catches and no monthly fee.
          </p>
        </Reveal>

        {/* Mobile: stacked cards (no horizontal scroll) */}
        <div className="sm:hidden space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-2xl border border-atlas-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-atlas-text-secondary">
                {row.label}
              </p>
              <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-atlas-accent/15 px-3 py-2.5">
                <CheckBadge />
                <span className="text-[15px] font-bold text-atlas-text-primary">{row.atlas}</span>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-atlas-text-primary">
                  Atlas
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-atlas-border pt-3 text-xs">
                {[
                  { name: 'Wise', cell: row.wise },
                  { name: 'Revolut', cell: row.revolut },
                  { name: 'Banks', cell: row.traditional },
                ].map(({ name, cell }) => (
                  <div key={name}>
                    <dt className="text-atlas-text-secondary">{name}</dt>
                    <dd
                      className={
                        cell.bad
                          ? 'text-atlas-text-secondary mt-0.5'
                          : 'text-atlas-text-primary font-medium mt-0.5'
                      }
                    >
                      {cell.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        {/* Comparison table (sm and up) */}
        <Reveal as="div" direction="scale" className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[820px] px-4 sm:px-0">
            {/* Header row */}
            <div className={GRID}>
              <div />
              <div className="bg-atlas-accent/15 rounded-t-2xl px-3 sm:px-5 pt-5 pb-3 border-2 border-b-0 border-atlas-accent">
                <img src="/atlas-logo.svg" alt="Atlas" className="h-4" />
              </div>
              <div className="px-3 sm:px-5 pt-5 pb-3">
                <p className="text-sm font-semibold text-atlas-text-secondary">Wise</p>
              </div>
              <div className="px-3 sm:px-5 pt-5 pb-3">
                <p className="text-sm font-semibold text-atlas-text-secondary">Revolut</p>
              </div>
              <div className="px-3 sm:px-5 pt-5 pb-3">
                <p className="text-sm font-semibold text-atlas-text-secondary">Traditional bank</p>
              </div>
            </div>

            {/* Data rows */}
            {rows.map((row, i) => (
              <div key={row.label} className={GRID}>
                <div className="px-2 sm:px-4 py-3.5 flex items-center">
                  <span className="text-sm font-medium text-atlas-text-primary">{row.label}</span>
                </div>
                <div
                  className={`px-3 sm:px-5 py-3.5 flex items-center gap-2 border-x-2 border-atlas-accent bg-atlas-accent/15 ${
                    i === rows.length - 1 ? 'rounded-b-2xl border-b-2' : ''
                  }`}
                >
                  <CheckBadge />
                  <span className="text-sm font-semibold text-atlas-text-primary">{row.atlas}</span>
                </div>
                <CompetitorCell cell={row.wise} />
                <CompetitorCell cell={row.revolut} />
                <CompetitorCell cell={row.traditional} />
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button size="lg" className="text-base px-8 rounded-full font-semibold" asChild>
            <Link href="/onboarding">Open your free account</Link>
          </Button>
          <p className="text-sm text-atlas-text-secondary">
            No monthly fee. No FX markup. Cancel anytime.
          </p>
        </div>
      </Container>
    </section>
  );
}
