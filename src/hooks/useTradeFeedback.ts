'use client';

import { useQuery } from '@tanstack/react-query';
import { getTradeFeedback } from '@/lib/api/tradeFeedback';

// Fetches the RA's trade feedback. A large page is requested so the existing
// client-side search / community / sentiment filters and pagination stay
// consistent (the list is small).
export function useTradeFeedback() {
  return useQuery({
    queryKey: ['trade-feedback'],
    queryFn: () => getTradeFeedback({ page: 1, limit: 1000 }),
  });
}
