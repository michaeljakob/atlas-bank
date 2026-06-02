import { Container } from '@/components/ui/container';

const items = [
  {
    icon: (
      <svg className="w-5 h-5 text-atlas-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
    title: 'Trusted by businesses',
    description: 'Companies across Europe move and manage money with Atlas',
  },
  {
    icon: <img src="/logos/acpr.svg" alt="EU Regulated" className="h-5 w-auto" />,
    title: 'EU regulated',
    description: 'Authorised by the ACPR under Swan\u2019s EMI licence',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-atlas-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
    title: 'Dedicated support',
    description: 'Business specialists available via email, phone and chat',
  },
];

export function TrustBar() {
  return (
    <section className="py-10 sm:py-12 bg-atlas-bg-subtle border-y border-atlas-border">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {items.map((item) => (
            <div key={item.title} className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-atlas-accent/15 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-atlas-text-primary">{item.title}</p>
                <p className="mt-0.5 text-xs text-atlas-text-secondary leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
