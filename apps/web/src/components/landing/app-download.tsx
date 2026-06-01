import { Container } from '@/components/ui/container';

export function AppDownload() {
  return (
    <section className="py-24 sm:py-32 bg-atlas-bg-subtle overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">
              For people going places
            </h2>
            <p className="text-lg text-atlas-text-secondary leading-relaxed mb-8 max-w-md">
              Manage your money from anywhere. Pay in-store, online, or send to friends — all from your phone.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              {/* App Store badge */}
              <a href="#" className="inline-flex items-center gap-3 bg-atlas-dark-surface text-white px-5 py-3 rounded-xl hover:opacity-90 transition-opacity">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <p className="text-[10px] text-gray-400">Download on the</p>
                  <p className="text-sm font-medium">App Store</p>
                </div>
              </a>

              {/* Google Play badge */}
              <a href="#" className="inline-flex items-center gap-3 bg-atlas-dark-surface text-white px-5 py-3 rounded-xl hover:opacity-90 transition-opacity">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/>
                </svg>
                <div>
                  <p className="text-[10px] text-gray-400">Get it on</p>
                  <p className="text-sm font-medium">Google Play</p>
                </div>
              </a>
            </div>

            <div className="flex items-center gap-6 text-sm text-atlas-text-secondary">
              <div className="flex items-center gap-1">
                <span className="font-medium text-atlas-text-primary">4.9★</span>
                <span>App Store</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-atlas-text-primary">4.8★</span>
                <span>Google Play</span>
              </div>
            </div>
          </div>

          {/* Visual — testimonial cards */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-atlas-border shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <img src="https://i.pravatar.cc/36?img=44" alt="" className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-xs font-medium">Maria K.</p>
                      <p className="text-[10px] text-atlas-text-secondary">Berlin, DE</p>
                    </div>
                  </div>
                  <p className="text-xs text-atlas-text-secondary leading-relaxed">
                    &ldquo;Got my IBAN faster than ordering a coffee. My freelance clients pay me directly now — no more waiting 3 days.&rdquo;
                  </p>
                  <div className="flex mt-2">
                    {[1,2,3,4,5].map(i => <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-atlas-border shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <img src="https://i.pravatar.cc/36?img=52" alt="" className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-xs font-medium">Tom R.</p>
                      <p className="text-[10px] text-atlas-text-secondary">Amsterdam, NL</p>
                    </div>
                  </div>
                  <p className="text-xs text-atlas-text-secondary leading-relaxed">
                    &ldquo;The card was in my Apple Pay before I even finished the signup. Mind blown.&rdquo;
                  </p>
                  <div className="flex mt-2">
                    {[1,2,3,4,5].map(i => <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                  </div>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-white rounded-2xl p-5 border border-atlas-border shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <img src="https://i.pravatar.cc/36?img=22" alt="" className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-xs font-medium">Priya S.</p>
                      <p className="text-[10px] text-atlas-text-secondary">Lisbon, PT</p>
                    </div>
                  </div>
                  <p className="text-xs text-atlas-text-secondary leading-relaxed">
                    &ldquo;I run my SaaS from Portugal. Atlas gave me a German IBAN — my clients think I have a Berlin office 😂&rdquo;
                  </p>
                  <div className="flex mt-2">
                    {[1,2,3,4,5].map(i => <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-atlas-border shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <img src="https://i.pravatar.cc/36?img=60" alt="" className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-xs font-medium">Lucas M.</p>
                      <p className="text-[10px] text-atlas-text-secondary">Remote, EU</p>
                    </div>
                  </div>
                  <p className="text-xs text-atlas-text-secondary leading-relaxed">
                    &ldquo;Finally a bank that doesn&apos;t ask me to visit a branch. The future is here.&rdquo;
                  </p>
                  <div className="flex mt-2">
                    {[1,2,3,4,5].map(i => <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
