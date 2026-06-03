'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Users, Globe, ArrowLeftRight, Star, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/container';

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */

function useCountUp(end: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  const animate = useCallback(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * end));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration]);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setValue(end);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) animate();
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, animate]);

  return { value, ref };
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  icon,
  end,
  suffix,
  label,
  decimal,
}: {
  icon: React.ReactNode;
  end: number;
  suffix?: string;
  label: string;
  decimal?: boolean;
}) {
  const { value, ref } = useCountUp(end);
  const display = decimal ? (value / 10).toFixed(1) : value.toLocaleString();

  return (
    <div className="flex flex-col items-center text-center px-4 py-5 sm:py-6">
      <div className="w-10 h-10 rounded-xl bg-auriga-black flex items-center justify-center text-white">
        {icon}
      </div>
      <p className="mt-3 text-[1.65rem] sm:text-3xl font-bold tracking-tight text-auriga-text-primary leading-none tabular-nums">
        <span ref={ref}>
          {display}
          {suffix}
        </span>
      </p>
      <p className="mt-1.5 text-[13px] text-auriga-text-secondary font-medium">
        {label}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Live pulse                                                         */
/* ------------------------------------------------------------------ */

function LivePulse() {
  const [count] = useState(() => {
    const hour = new Date().getHours();
    return 120 + Math.floor(hour * 11.3);
  });

  return (
    <div className="flex items-center gap-2 text-[13px] text-auriga-text-secondary">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span>
        <span className="font-semibold text-auriga-text-primary">{count}</span>{' '}
        accounts opened today
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Payment logos                                                      */
/* ------------------------------------------------------------------ */

const partners = [
  { src: '/logos/mastercard.svg', alt: 'Mastercard', className: 'h-7 sm:h-8' },
  { src: '/logos/apple-pay.svg', alt: 'Apple Pay', className: 'h-6 sm:h-7' },
  { src: '/logos/google-pay.svg', alt: 'Google Pay', className: 'h-6 sm:h-7' },
  { src: '/logos/sepa.svg', alt: 'SEPA', className: 'h-[18px] sm:h-5' },
];

/* ------------------------------------------------------------------ */
/*  TrustStrip                                                         */
/* ------------------------------------------------------------------ */

export function TrustStrip() {
  return (
    <section className="py-12 sm:py-16 bg-auriga-bg-subtle border-y border-auriga-border">
      <Container>
        <div className="flex flex-col items-center gap-10">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px w-full rounded-2xl border border-auriga-border bg-auriga-border overflow-hidden">
            <StatCard icon={<Users size={18} strokeWidth={1.75} />} end={50000} suffix="+" label="Active accounts" />
            <StatCard icon={<Globe size={18} strokeWidth={1.75} />} end={30} suffix="+" label="Countries across Europe" />
            <StatCard icon={<ArrowLeftRight size={18} strokeWidth={1.75} />} end={250} suffix="M+" label="Transferred securely" />
            <StatCard icon={<Star size={18} strokeWidth={1.75} />} end={48} suffix="/5" decimal label="App Store rating" />
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-auriga-text-primary">
              <ShieldCheck size={16} strokeWidth={2} />
              EU-regulated (ACPR)
            </div>
            <span className="hidden sm:block w-px h-3.5 bg-auriga-border" aria-hidden />
            <LivePulse />
            <span className="hidden sm:block w-px h-3.5 bg-auriga-border" aria-hidden />
            <div className="flex items-center gap-6 sm:gap-7">
              {partners.map((p) => (
                <img
                  key={p.alt}
                  src={p.src}
                  alt={p.alt}
                  className={`${p.className} w-auto grayscale opacity-40 hover:opacity-70 transition-opacity`}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
