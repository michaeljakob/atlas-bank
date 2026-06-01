import { Container } from '@/components/ui/container';

const providers = [
  { name: 'Atlas', fee: '€0.50', rate: 'Mid-market', markup: '€0', total: '€0.50', highlight: true },
  { name: 'Traditional bank', fee: '€0', rate: '+1.5%', markup: '€15.00', total: '€15.00', highlight: false },
  { name: 'PayPal', fee: '€3.99', rate: '+3.0%', markup: '€30.00', total: '€33.99', highlight: false },
];

export function ComparisonTable() {
  return (
    <section className="py-24 sm:py-32 bg-atlas-bg-subtle">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Stop paying hidden fees
          </h2>
          <p className="mt-4 text-lg text-atlas-text-secondary max-w-xl mx-auto">
            Banks hide their margins in the exchange rate. We show you exactly what you pay.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-atlas-border overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-atlas-border bg-atlas-bg-subtle/50 text-xs font-medium text-atlas-text-secondary uppercase tracking-wide">
              <div className="col-span-1">Provider</div>
              <div>Fee</div>
              <div>Rate</div>
              <div>Markup</div>
              <div>Total cost</div>
            </div>
            {/* Rows */}
            {providers.map((provider) => (
              <div
                key={provider.name}
                className={`grid grid-cols-5 gap-4 px-6 py-5 border-b border-atlas-border last:border-0 items-center ${
                  provider.highlight ? 'bg-atlas-accent/5' : ''
                }`}
              >
                <div className="col-span-1 flex items-center gap-2">
                  {provider.highlight && (
                    <div className="w-6 h-6 rounded-full bg-atlas-dark-surface flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">A</span>
                    </div>
                  )}
                  <span className={`text-sm ${provider.highlight ? 'font-medium' : ''}`}>{provider.name}</span>
                </div>
                <div className="text-sm">{provider.fee}</div>
                <div className={`text-sm ${provider.highlight ? 'text-atlas-success font-medium' : ''}`}>{provider.rate}</div>
                <div className={`text-sm ${provider.highlight ? 'text-atlas-success font-medium' : 'text-atlas-error'}`}>{provider.markup}</div>
                <div className={`text-sm font-medium ${provider.highlight ? 'text-atlas-success' : ''}`}>{provider.total}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-atlas-text-secondary text-center mt-4">
            Based on a €1,000 EUR→EUR SEPA transfer. Traditional bank fees vary.
          </p>
        </div>
      </Container>
    </section>
  );
}
