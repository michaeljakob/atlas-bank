import { Container } from '@/components/ui/container';

export function SocialProof() {
  return (
    <section className="py-8 border-y border-atlas-border bg-white">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-medium">4.9</span>
            <span className="text-xs text-atlas-text-secondary">Trustpilot</span>
          </div>

          <div className="h-4 w-px bg-atlas-border hidden sm:block" />

          <div className="text-center">
            <span className="text-sm font-medium">€240M+</span>
            <span className="text-xs text-atlas-text-secondary ml-1">moved monthly</span>
          </div>

          <div className="h-4 w-px bg-atlas-border hidden sm:block" />

          <div className="text-center">
            <span className="text-sm font-medium">2,400+</span>
            <span className="text-xs text-atlas-text-secondary ml-1">happy customers</span>
          </div>

          <div className="h-4 w-px bg-atlas-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            <span className="text-xs text-atlas-text-secondary">EU regulated</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
