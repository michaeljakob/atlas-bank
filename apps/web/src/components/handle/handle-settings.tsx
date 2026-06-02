'use client';

import { useEffect, useState } from 'react';
import { HandleField } from '@/components/handle/handle-field';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

export function HandleSettings() {
  const [loaded, setLoaded] = useState(false);
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    api
      .getMyHandle()
      .then((r) => setHandle(r.handle))
      .catch(() => setHandle(null))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return <Skeleton className="h-11 w-full rounded-xl" />;

  return <HandleField initialHandle={handle} ctaLabel={handle ? 'Update' : 'Claim handle'} />;
}
