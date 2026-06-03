import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';

type Cell = { value: string; bad?: boolean };

type Row = {
  label: string;
  auriga: string;
  wise: Cell;
  revolut: Cell;
  traditional: Cell;
};

const rows: Row[] = [
  {
    label: 'Monthly fee',
    auriga: '€0 forever',
    wise: { value: '€0' },
    revolut: { value: '€0–13.99', bad: true },
    traditional: { value: '€5–15', bad: true },
  },
  {
    label: 'Account opening',
    auriga: '60 seconds',
    wise: { value: 'Minutes' },
    revolut: { value: 'Minutes' },
    traditional: { value: 'Days to weeks', bad: true },
  },
  {
    label: 'EUR IBAN',
    auriga: 'Dedicated, in your name',
    wise: { value: 'Shared Belgian IBAN', bad: true },
    revolut: { value: 'Pooled sub-account', bad: true },
    traditional: { value: 'Dedicated' },
  },
  {
    label: 'Physical card',
    auriga: 'Free',
    wise: { value: '€7', bad: true },
    revolut: { value: '€9.99', bad: true },
    traditional: { value: '€15–30', bad: true },
  },
  {
    label: 'Virtual card',
    auriga: 'Free, instant',
    wise: { value: 'Free' },
    revolut: { value: 'Free' },
    traditional: { value: 'Not available', bad: true },
  },
  {
    label: 'SEPA transfers',
    auriga: 'Free',
    wise: { value: 'From €0.43', bad: true },
    revolut: { value: 'Free' },
    traditional: { value: '€0.20–2', bad: true },
  },
  {
    label: 'SEPA Instant',
    auriga: 'Free',
    wise: { value: 'Not supported', bad: true },
    revolut: { value: '€0–0.50', bad: true },
    traditional: { value: '€0.50–5', bad: true },
  },
  {
    label: 'FX markup',
    auriga: '0%',
    wise: { value: '0.33–1.5%', bad: true },
    revolut: { value: '0.5–2%', bad: true },
    traditional: { value: '1.5–3%', bad: true },
  },
  {
    label: 'Residency required',
    auriga: 'No',
    wise: { value: 'No' },
    revolut: { value: 'Varies', bad: true },
    traditional: { value: 'Yes', bad: true },
  },
];

const GRID = 'grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr] gap-2 sm:gap-3';

function CheckBadge() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-auriga-black text-white shrink-0">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </span>
  );
}

function CrossMark() {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-auriga-error/10 text-auriga-error shrink-0">
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
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-auriga-text-secondary/10 text-auriga-text-secondary shrink-0">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
      )}
      <span className={`text-sm ${cell.bad ? 'text-auriga-text-secondary' : 'text-auriga-text-primary'}`}>
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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-auriga-text-primary leading-[1.1]">
            Everything they charge for,<br className="hidden sm:block" /> Auriga includes free
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed max-w-2xl">
            Wise takes a cut on every transfer. Revolut locks features behind paid plans.
            Traditional banks charge you just to exist. Compare the details — then decide.
          </p>
        </Reveal>

        {/* Mobile: stacked cards (no horizontal scroll) */}
        <div className="sm:hidden space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-2xl border border-auriga-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-auriga-text-secondary">
                {row.label}
              </p>
              <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-auriga-accent/10 px-3 py-2.5">
                <CheckBadge />
                <span className="text-[15px] font-bold text-auriga-text-primary">{row.auriga}</span>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-auriga-text-primary">
                  Auriga
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-auriga-border pt-3 text-xs">
                {[
                  { name: 'Wise', cell: row.wise },
                  { name: 'Revolut', cell: row.revolut },
                  { name: 'Banks', cell: row.traditional },
                ].map(({ name, cell }) => (
                  <div key={name}>
                    <dt className="text-auriga-text-secondary">{name}</dt>
                    <dd
                      className={
                        cell.bad
                          ? 'text-auriga-text-secondary mt-0.5'
                          : 'text-auriga-text-primary font-medium mt-0.5'
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
              <div className="bg-auriga-accent/10 rounded-t-2xl px-3 sm:px-5 pt-5 pb-3 border border-b-0 border-auriga-accent/25">
                <img src="/auriga-logo.svg" alt="Auriga" className="h-4" />
              </div>
              <div className="px-3 sm:px-5 pt-5 pb-3">
                <img src="/logos/wise.svg" alt="Wise" className="h-3.5 opacity-40" />
              </div>
              <div className="px-3 sm:px-5 pt-5 pb-3">
                <img src="/logos/revolut.svg" alt="Revolut" className="h-3.5 opacity-40" />
              </div>
              <div className="px-3 sm:px-5 pt-5 pb-3">
                <p className="text-sm font-semibold text-auriga-text-secondary">Traditional bank</p>
              </div>
            </div>

            {/* Data rows */}
            {rows.map((row, i) => (
              <div key={row.label} className={GRID}>
                <div className="px-2 sm:px-4 py-3.5 flex items-center">
                  <span className="text-sm font-medium text-auriga-text-primary">{row.label}</span>
                </div>
                <div
                  className={`px-3 sm:px-5 py-3.5 flex items-center gap-2 border-x border-auriga-accent/25 bg-auriga-accent/10 ${
                    i === rows.length - 1 ? 'rounded-b-2xl border-b' : ''
                  }`}
                >
                  <CheckBadge />
                  <span className="text-sm font-semibold text-auriga-text-primary">{row.auriga}</span>
                </div>
                <CompetitorCell cell={row.wise} />
                <CompetitorCell cell={row.revolut} />
                <CompetitorCell cell={row.traditional} />
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal as="div" className="mt-14 rounded-2xl border border-auriga-border bg-auriga-bg-subtle p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-lg sm:text-xl font-bold text-auriga-text-primary">
              The average customer saves €120+/year by switching
            </p>
            <p className="mt-1.5 text-sm text-auriga-text-secondary">
              No monthly fee. No FX markup. No transfer fees. No card fees. Zero catches.
            </p>
          </div>
          <Button size="lg" className="text-base px-8 rounded-full font-semibold shrink-0" asChild>
            <Link href="/onboarding">Switch now — it&apos;s free</Link>
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
