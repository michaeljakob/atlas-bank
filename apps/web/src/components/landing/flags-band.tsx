import { Container } from '@/components/ui/container';
import { Flag } from '@/components/ui/flag';

const countries = [
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'Spain', code: 'ES' },
  { name: 'Italy', code: 'IT' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'Portugal', code: 'PT' },
  { name: 'Austria', code: 'AT' },
  { name: 'Belgium', code: 'BE' },
  { name: 'Ireland', code: 'IE' },
  { name: 'Finland', code: 'FI' },
  { name: 'Greece', code: 'GR' },
  { name: 'Luxembourg', code: 'LU' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Denmark', code: 'DK' },
  { name: 'Poland', code: 'PL' },
  { name: 'Czech Republic', code: 'CZ' },
  { name: 'Croatia', code: 'HR' },
  { name: 'Romania', code: 'RO' },
];

export function FlagsBand() {
  return (
    <section className="py-24 sm:py-36 bg-atlas-dark-surface">
      <Container>
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-heading text-white uppercase tracking-tight leading-[0.95] mb-6">
          One account.
          <br />
          Every country.
        </h2>
        <p className="text-lg sm:text-xl text-atlas-heather-300 max-w-lg mb-16 leading-relaxed">
          One IBAN that works the same in every EEA member state. No borders,
          no local paperwork, no second account.
        </p>
        <div className="flex flex-wrap gap-3 max-w-5xl">
          {countries.map(({ name, code }) => (
            <span
              key={name}
              className="flex items-center gap-2.5 text-sm font-bold text-white bg-white/8 hover:bg-white/15 px-5 py-2.5 rounded-full transition-colors"
            >
              <Flag code={code} name={name} className="w-6 h-6 ring-white/20" />
              {name}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
