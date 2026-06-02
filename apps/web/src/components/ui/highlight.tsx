import { cn } from '@/lib/utils';

/**
 * Signature Atlas accent: a solid neon "highlighter" band painted behind the
 * lower third of the text. Uses an inset box-shadow (not a gradient) so the
 * dark text stays fully legible on top, and box-decoration-break: clone so the
 * stroke wraps cleanly across multiple lines. Use on light backgrounds only —
 * on dark surfaces use `text-atlas-accent` directly (neon is legible there).
 */
export function Highlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'relative inline text-atlas-text-primary',
        '[-webkit-box-decoration-break:clone] [box-decoration-break:clone]',
        'shadow-[inset_0_-0.3em_0_0_#CCFF00]',
        className
      )}
    >
      {children}
    </span>
  );
}
