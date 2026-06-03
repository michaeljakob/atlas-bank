import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { BRAND_LIST, BRAND_SCALES, type BrandColor } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Brand Kit',
  description: 'The official Auriga color palette and usage guidelines.',
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
      <h3 className="text-sm font-bold uppercase tracking-widest text-auriga-text-secondary mb-3">{title}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {Object.entries(scale).map(([step, hex]) => (
          <div key={step} className="rounded-xl overflow-hidden border border-auriga-border">
            <div className="h-16" style={{ backgroundColor: hex }} />
            <div className="px-2 py-1.5 bg-white">
              <p className="text-xs font-bold text-auriga-text-primary">{step}</p>
              <p className="text-[10px] font-mono text-auriga-text-secondary">{hex}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrandPage() {
  return (
    <main className="min-h-screen bg-auriga-bg-subtle py-16 sm:py-24">
      <Container className="max-w-5xl">
        <header className="mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-auriga-text-secondary">
            Auriga Branding Kit
          </span>
          <h1 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight text-auriga-text-primary">
            Official colors
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-auriga-text-secondary leading-relaxed">
            The Auriga palette is warm, confident, and unmistakably ours. Auriga
            Neon leads, grounded by Auriga Black and the Heather warm-grays, with
            UI Green for positive moments.
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight text-auriga-text-primary mb-6">Logo</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <figure className="rounded-2xl bg-white border border-auriga-border p-8 flex flex-col items-center justify-center gap-4 min-h-[180px]">
              <img src="/auriga-icon.svg" alt="Auriga icon" className="h-16 w-16" />
              <figcaption className="text-xs font-bold uppercase tracking-widest text-auriga-text-secondary">Icon</figcaption>
            </figure>
            <figure className="rounded-2xl bg-white border border-auriga-border p-8 flex flex-col items-center justify-center gap-4 min-h-[180px]">
              <img src="/auriga-logo.svg" alt="Auriga wordmark" className="h-10 w-auto" />
              <figcaption className="text-xs font-bold uppercase tracking-widest text-auriga-text-secondary">Wordmark</figcaption>
            </figure>
            <figure className="rounded-2xl bg-white border border-auriga-border p-8 flex flex-col items-center justify-center gap-4 min-h-[180px]">
              <img src="/auriga-lockup.svg" alt="Auriga logo and wordmark" className="h-12 w-auto" />
              <figcaption className="text-xs font-bold uppercase tracking-widest text-auriga-text-secondary">Lockup</figcaption>
            </figure>
            <figure className="rounded-2xl bg-auriga-black p-8 flex flex-col items-center justify-center gap-4 min-h-[180px] sm:col-span-3">
              <img src="/auriga-lockup-light.svg" alt="Auriga logo and wordmark on dark" className="h-12 w-auto" />
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
          <h2 className="text-2xl font-bold tracking-tight text-auriga-text-primary">Tints &amp; shades</h2>
          <Scale title="Auriga Neon" scale={BRAND_SCALES.accent} />
          <Scale title="UI Green" scale={BRAND_SCALES.green} />
          <Scale title="Heather" scale={BRAND_SCALES.heather} />
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-auriga-text-primary mb-6">In use</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-auriga-black p-8 flex flex-col gap-4">
              <p className="text-white text-lg font-bold">Dark surface</p>
              <button className="self-start rounded-full bg-auriga-accent px-6 py-3 text-sm font-semibold text-auriga-black">
                Neon CTA
              </button>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-auriga-green-500 px-4 py-2 text-sm font-semibold text-white">
                Money in +€3,200
              </span>
            </div>
            <div className="rounded-2xl bg-white border border-auriga-border p-8 flex flex-col gap-4">
              <p className="text-auriga-text-primary text-lg font-bold">Light surface</p>
              <p className="text-auriga-text-secondary">Secondary text on white sits in Heather.</p>
              <button className="self-start rounded-full bg-auriga-black px-6 py-3 text-sm font-semibold text-white">
                Dark CTA
              </button>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
