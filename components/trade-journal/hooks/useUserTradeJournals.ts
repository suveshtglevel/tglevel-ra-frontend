'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserTradeJournals } from '@/components/trade-journal/services/tradeJournals.service';

// Fetches customer (user-logged) trade journals. A large page is requested so
// the Customer Trade Journal view's client-side date/community filters, sorting
// and pagination stay consistent (the list is small).
export function useUserTradeJournals() {
  return useQuery({
    queryKey: ['user-trade-journals'],
    queryFn: () => getUserTradeJournals({ page: 1, limit: 1000 }),
  });
}
