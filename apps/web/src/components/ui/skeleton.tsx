import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-atlas-bg-subtle', className)}
      {...props}
    />
  );
}

export { Skeleton };
