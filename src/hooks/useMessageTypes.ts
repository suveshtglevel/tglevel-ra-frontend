'use client';

import { useQuery } from '@tanstack/react-query';
import { getMessageTypes } from '@/lib/api/messages';

// Backend-configured message types (Trade Call, Follow-up, …). Cached under
// ['message-types']; rarely changes, so it is fetched once and reused.
export function useMessageTypes() {
  return useQuery({
    queryKey: ['message-types'],
    queryFn: getMessageTypes,
    staleTime: 5 * 60 * 1000,
  });
}
