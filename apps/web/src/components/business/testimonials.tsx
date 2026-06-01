import { Container } from '@/components/ui/container';

const testimonials = [
  {
    quote: "Having a EUR IBAN lets us receive payments directly from EU clients without conversion fees eating our margins.",
    name: 'Sofia & Marc',
    role: 'Co-founders, NovaTech',
    image: 'https://i.pravatar.cc/64?img=32',
  },
  {
    quote: "Atlas is a game-changer. Simple, saves us money, and perfect for paying our remote team across Europe.",
    name: 'Daniel K.',
    role: 'CEO, RemoteFirst',
    image: 'https://i.pravatar.cc/64?img=53',
  },
  {
    quote: "Batch payments used to take me a week. Now I pay all our contractors in a few minutes. The time savings alone are worth it.",
    name: 'Emma L.',
    role: 'Finance Lead, CreativeStudio',
    image: 'https://i.pravatar.cc/64?img=47',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Hear from businesses scaling with Atlas
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 border border-atlas-border shadow-sm">
              <div className="flex mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-atlas-text-secondary leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-atlas-text-secondary">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
