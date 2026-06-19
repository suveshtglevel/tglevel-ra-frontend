'use client';

import { useQuery } from '@tanstack/react-query';
import { getTradeFeedback } from '@/modules/trade-feedback/services/tradeFeedback.service';

// Fetches the RA's trade feedback. A large page is requested so the existing
// client-side search / community / sentiment filters and pagination stay
// consistent (the list is small).
export function useTradeFeedback() {
  return useQuery({
    queryKey: ['trade-feedback'],
    queryFn: () => getTradeFeedback({ page: 1, limit: 1000 }),
    // No sockets: refetch on every navigation to the Trade Feedback tab so the
    // list reflects the latest feedback (cached rows stay visible meanwhile).
    refetchOnMount: 'always',
  });
}
