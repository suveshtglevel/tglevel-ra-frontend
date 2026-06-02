'use client';

import { useQuery } from '@tanstack/react-query';
import { getBundles } from '@/lib/api/bundle';

// The RA's saved bundles. Cached under ['bundles']; the create mutation
// invalidates this key so new bundles show up immediately.
export function useBundles() {
  return useQuery({
    queryKey: ['bundles'],
    queryFn: getBundles,
  });
}
