'use client';

const flags = [
  { country: 'DE', emoji: '🇩🇪' },
  { country: 'FR', emoji: '🇫🇷' },
  { country: 'ES', emoji: '🇪🇸' },
  { country: 'IT', emoji: '🇮🇹' },
  { country: 'NL', emoji: '🇳🇱' },
  { country: 'PT', emoji: '🇵🇹' },
  { country: 'AT', emoji: '🇦🇹' },
  { country: 'BE', emoji: '🇧🇪' },
  { country: 'IE', emoji: '🇮🇪' },
  { country: 'FI', emoji: '🇫🇮' },
  { country: 'GR', emoji: '🇬🇷' },
  { country: 'LU', emoji: '🇱🇺' },
  { country: 'SE', emoji: '🇸🇪' },
  { country: 'DK', emoji: '🇩🇰' },
  { country: 'PL', emoji: '🇵🇱' },
  { country: 'CZ', emoji: '🇨🇿' },
  { country: 'HR', emoji: '🇭🇷' },
  { country: 'RO', emoji: '🇷🇴' },
];

export function FlagsBand() {
  const doubled = [...flags, ...flags];

  return (
    <section className="py-10 bg-atlas-dark-surface overflow-hidden">
      <div className="relative">
        <div className="flex animate-scroll gap-6">
          {doubled.map((flag, i) => (
            <div
              key={`${flag.country}-${i}`}
              className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl sm:text-4xl backdrop-blur-sm border border-white/5 hover:scale-110 transition-transform"
            >
              {flag.emoji}
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-gray-400 mt-6">
        Available across the European Economic Area — with local IBANs
      </p>
    </section>
  );
}
