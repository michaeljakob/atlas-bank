import { Container } from '@/components/ui/container';

const trustPoints = [
  { label: 'EU regulated', detail: 'Licensed EMI under ACPR' },
  { label: 'Funds safeguarded', detail: 'Protected per EU e-money rules' },
  { label: 'Mastercard network', detail: 'Accepted in 210+ countries' },
  { label: 'Bank-grade security', detail: 'PSD2 SCA, encrypted, audited' },
];

export function TrustBand() {
  return (
    <section className="py-16 border-y border-atlas-border bg-white">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {trustPoints.map((point) => (
            <div key={point.label} className="text-center">
              <div className="text-sm font-medium text-atlas-text-primary">{point.label}</div>
              <div className="text-xs text-atlas-text-secondary mt-1">{point.detail}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
