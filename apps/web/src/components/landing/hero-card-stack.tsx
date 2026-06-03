'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Slide = {
  src: string;
  alt: string;
  toast: {
    label: string;
    meta: string;
    amount: string;
  };
};

const SLIDES: Slide[] = [
  {
    src: '/images/hero-customer-1.png',
    alt: 'An Auriga customer working and banking from a sun-lit seaside suite in Europe',
    toast: { label: 'Salary received', meta: 'Acme Inc · just now', amount: '+€3,200' },
  },
  {
    src: '/images/hero-customer-2.png',
    alt: 'An Auriga customer banking from a beachfront café while travelling',
    toast: { label: 'Payment received', meta: 'Lina Fischer · just now', amount: '+€1,850' },
  },
  {
    src: '/images/hero-customer-3.png',
    alt: 'An Auriga customer managing finances on the go across Europe',
    toast: { label: 'Transfer sent', meta: 'Max Weber · just now', amount: '-€420' },
  },
];

const SWAP_MS = 4200;

export function HeroCardStack() {
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setFront((f) => (f + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    if (typeof window !== 'undefined') {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (reduce.matches) return;
    }
    timer.current = setInterval(advance, SWAP_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [advance, paused]);

  return (
    <button
      type="button"
      onClick={advance}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Show the next Auriga customer story"
      className="group relative block aspect-[4/5] w-full cursor-pointer outline-none"
    >
      {SLIDES.map((slide, i) => {
        const offset = (i - front + SLIDES.length) % SLIDES.length;
        const isFront = offset === 0;
        return (
          <figure
            key={slide.src}
            aria-hidden={!isFront}
            style={{ zIndex: SLIDES.length - offset }}
            className={[
              'absolute inset-0 m-0 overflow-hidden rounded-[2rem] ring-1 ring-black/[0.06]',
              'transition-[transform,opacity,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
              isFront
                ? 'translate-x-0 translate-y-0 rotate-0 scale-100 opacity-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]'
                : offset === 1
                  ? 'translate-x-3 translate-y-4 rotate-[4deg] scale-[0.95] opacity-90 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.25)]'
                  : 'translate-x-5 translate-y-7 rotate-[7deg] scale-[0.90] opacity-70 shadow-[0_14px_40px_-24px_rgba(0,0,0,0.2)]',
            ].join(' ')}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="h-full w-full object-cover object-center"
              width={1024}
              height={1024}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              draggable={false}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            <figcaption
              className={[
                'absolute left-4 top-4 flex items-center gap-3 rounded-2xl bg-white/95 px-3.5 py-2.5',
                'shadow-[0_18px_40px_-12px_rgba(0,0,0,0.3)] ring-1 ring-black/[0.06] backdrop-blur-sm',
                'transition-all duration-500',
                isFront ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
              ].join(' ')}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-auriga-green-50 text-auriga-green-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m0 0l3.5-3.5M12 18l-3.5-3.5" />
                </svg>
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold text-auriga-text-primary">{slide.toast.label}</p>
                <p className="text-xs text-auriga-text-secondary">{slide.toast.meta}</p>
              </div>
              <span className="ml-1 text-sm font-bold text-auriga-green-700">{slide.toast.amount}</span>
            </figcaption>
          </figure>
        );
      })}

      {/* Swap indicator dots */}
      <span className="absolute -bottom-7 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((slide, i) => (
          <span
            key={slide.src}
            className={[
              'h-1.5 rounded-full transition-all duration-500',
              i === front ? 'w-6 bg-auriga-black' : 'w-1.5 bg-auriga-black/25',
            ].join(' ')}
          />
        ))}
      </span>
    </button>
  );
}
