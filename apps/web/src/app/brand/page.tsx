import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { BRAND_LIST, BRAND_SCALES, type BrandColor } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Brand Kit',
  description: 'The official Atlas color palette and usage guidelines.',
  robots: { index: false, follow: false },
};

/** Pick readable text color (relative luminance) for a given hex. */
function textOn(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.45 ? '#1C180D' : '#FFFFFF';
}

function SwatchRow({ color }: { color: BrandColor }) {
  const fg = textOn(color.hex);
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr] gap-x-8 items-center rounded-2xl px-6 py-8 sm:px-10 sm:py-10"
      style={{ backgroundColor: color.hex, color: fg }}
    >
      <p className="text-xl sm:text-2xl font-bold tracking-tight">{color.name}</p>
      <div className="mt-3 sm:mt-0 space-y-0.5 font-mono text-sm" style={{ opacity: 0.92 }}>
        <p>{color.hex}</p>
        <p>{`R${color.rgb[0]} G${color.rgb[1]} B${color.rgb[2]}`}</p>
        {color.pms && <p>{color.pms}</p>}
        <p className="font-sans pt-2" style={{ opacity: 0.8 }}>{color.usage}</p>
      </div>
    </div>
  );
}

function Scale({ title, scale }: { title: string; scale: Record<string | number, string> }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-atlas-text-secondary mb-3">{title}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {Object.entries(scale).map(([step, hex]) => (
          <div key={step} className="rounded-xl overflow-hidden border border-atlas-border">
            <div className="h-16" style={{ backgroundColor: hex }} />
            <div className="px-2 py-1.5 bg-white">
              <p className="text-xs font-bold text-atlas-text-primary">{step}</p>
              <p className="text-[10px] font-mono text-atlas-text-secondary">{hex}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrandPage() {
  return (
    <main className="min-h-screen bg-atlas-bg-subtle py-16 sm:py-24">
      <Container className="max-w-5xl">
        <header className="mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-atlas-text-secondary">
            Atlas Branding Kit
          </span>
          <h1 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight text-atlas-text-primary">
            Official colors
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-atlas-text-secondary leading-relaxed">
            The Atlas palette is warm, confident, and unmistakably ours. Robin
            Neon leads, grounded by Robin Black and the Heather warm-grays, with
            UI Green for positive moments.
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight text-atlas-text-primary mb-6">Logo</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <figure className="rounded-2xl bg-white border border-atlas-border p-8 flex flex-col items-center justify-center gap-4 min-h-[180px]">
              <img src="/atlas-icon.svg" alt="Atlas icon" className="h-16 w-16" />
              <figcaption className="text-xs font-bold uppercase tracking-widest text-atlas-text-secondary">Icon</figcaption>
            </figure>
            <figure className="rounded-2xl bg-white border border-atlas-border p-8 flex flex-col items-center justify-center gap-4 min-h-[180px]">
              <img src="/atlas-logo.svg" alt="Atlas wordmark" className="h-10 w-auto" />
              <figcaption className="text-xs font-bold uppercase tracking-widest text-atlas-text-secondary">Wordmark</figcaption>
            </figure>
            <figure className="rounded-2xl bg-white border border-atlas-border p-8 flex flex-col items-center justify-center gap-4 min-h-[180px]">
              <img src="/atlas-lockup.svg" alt="Atlas logo and wordmark" className="h-12 w-auto" />
              <figcaption className="text-xs font-bold uppercase tracking-widest text-atlas-text-secondary">Lockup</figcaption>
            </figure>
            <figure className="rounded-2xl bg-atlas-black p-8 flex flex-col items-center justify-center gap-4 min-h-[180px] sm:col-span-3">
              <img src="/atlas-lockup-light.svg" alt="Atlas logo and wordmark on dark" className="h-12 w-auto" />
              <figcaption className="text-xs font-bold uppercase tracking-widest text-white/60">Lockup on dark</figcaption>
            </figure>
          </div>
        </section>

        <section className="space-y-3">
          {BRAND_LIST.map((c) => (
            <SwatchRow key={c.hex} color={c} />
          ))}
        </section>

        <section className="mt-16 space-y-10">
          <h2 className="text-2xl font-bold tracking-tight text-atlas-text-primary">Tints &amp; shades</h2>
          <Scale title="Robin Neon" scale={BRAND_SCALES.accent} />
          <Scale title="UI Green" scale={BRAND_SCALES.green} />
          <Scale title="Heather" scale={BRAND_SCALES.heather} />
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-atlas-text-primary mb-6">In use</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-atlas-black p-8 flex flex-col gap-4">
              <p className="text-white text-lg font-bold">Dark surface</p>
              <button className="self-start rounded-full bg-atlas-accent px-6 py-3 text-sm font-semibold text-atlas-black">
                Neon CTA
              </button>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-atlas-green-500 px-4 py-2 text-sm font-semibold text-white">
                Money in +€3,200
              </span>
            </div>
            <div className="rounded-2xl bg-white border border-atlas-border p-8 flex flex-col gap-4">
              <p className="text-atlas-text-primary text-lg font-bold">Light surface</p>
              <p className="text-atlas-text-secondary">Secondary text on white sits in Heather.</p>
              <button className="self-start rounded-full bg-atlas-black px-6 py-3 text-sm font-semibold text-white">
                Dark CTA
              </button>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
