'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Direction the element slides in from. Defaults to "up". */
  direction?: Direction;
  /** Delay before the animation starts, in milliseconds. */
  delay?: number;
  /** How much of the element must be visible before animating (0–1). */
  threshold?: number;
  /** Animate only the first time it enters the viewport. Defaults to true. */
  once?: boolean;
  /** Render as a different element (e.g. "section", "li"). Defaults to "div". */
  as?: ElementType;
}

// useLayoutEffect on the client, useEffect on the server (avoids SSR warning).
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Lightweight scroll-triggered "slide in" wrapper used across the landing
 * page and the in-app screens.
 *
 * Important: the content is fully visible by default (SSR + first client
 * render). The hidden/animated state is only "armed" after the component
 * mounts on the client. This guarantees the page is never blank if JS is
 * disabled, slow, or errors during hydration — the animation is pure
 * progressive enhancement.
 */
export function Reveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  threshold = 0.15,
  once = true,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  // 'idle'   -> not armed yet (visible, no animation) — the SSR/first-paint state
  // 'hidden' -> armed and waiting to enter the viewport
  // 'shown'  -> entered, animate to final state
  const [phase, setPhase] = useState<'idle' | 'hidden' | 'shown'>('idle');

  // Arm the animation before paint so above-the-fold elements don't flash.
  useIsomorphicLayoutEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setPhase('shown');
      return;
    }
    setPhase('hidden');
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPhase('shown');
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setPhase('hidden');
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  return (
    <Tag
      ref={ref}
      data-direction={direction}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
      className={cn(phase !== 'idle' && 'reveal', phase === 'shown' && 'is-visible', className)}
    >
      {children}
    </Tag>
  );
}
