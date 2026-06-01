import { Container } from '@/components/ui/container';

const solutions = [
  {
    title: 'For startups',
    description: 'Get your business IBAN before incorporation clears. Accept investment, pay suppliers, issue team cards — all from day one.',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop&crop=faces',
    tag: 'STARTUPS',
  },
  {
    title: 'For freelancers',
    description: 'A professional EUR IBAN that makes you look like a local business. Invoice clients, get paid fast, spend with your card.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=faces',
    tag: 'FREELANCERS',
  },
  {
    title: 'For agencies',
    description: 'Manage multiple client payments, issue cards for your team, and keep project finances separate and organised.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop&crop=faces',
    tag: 'AGENCIES',
  },
];

export function Solutions() {
  return (
    <section className="py-24 sm:py-32 bg-atlas-bg-subtle">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Solutions for every kind of business
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {solutions.map((solution) => (
            <div key={solution.title} className="group rounded-2xl overflow-hidden bg-white border border-atlas-border hover:shadow-lg transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={solution.image}
                  alt={solution.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute top-4 left-4 text-[10px] font-bold text-white uppercase tracking-wider">
                  {solution.tag}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-2">{solution.title}</h3>
                <p className="text-sm text-atlas-text-secondary leading-relaxed">{solution.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
