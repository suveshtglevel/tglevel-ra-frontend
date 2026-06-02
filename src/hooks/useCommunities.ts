'use client';

import { useQuery } from '@tanstack/react-query';
import { getCommunities } from '@/lib/api/community';

// Fetches the admin-owned community list. Cached under ['communities'] so any
// component can read it without re-requesting.
export function useCommunities() {
  return useQuery({
    queryKey: ['communities'],
    queryFn: getCommunities,
  });
}
