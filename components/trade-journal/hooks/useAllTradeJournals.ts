'use client';

import { useQueries } from '@tanstack/react-query';
import { getTradeJournals, type BackendTradeJournal } from '@/components/trade-journal/services/tradeJournals.service';

// The API has no "all sub-communities" endpoint — it requires a specific
// community_id + sub_community_id. To build a combined view we fetch each
// sub-community in parallel (a large page each, so one request gets them all)
// and merge the journals. Filtering, sorting and pagination then happen
// client-side in useTradeJournal.
const ALL_LIMIT = 1000;

export interface SubScope {
  communityId: string;
  subCommunityId: string;
}

export function useAllTradeJournals(subs: SubScope[]) {
  const results = useQueries({
    queries: subs.map((s) => ({
      queryKey: ['trade-journals', s.communityId, s.subCommunityId, 'all'] as const,
      queryFn: () =>
        getTradeJournals({
          communityId: s.communityId,
          subCommunityId: s.subCommunityId,
          page: 1,
          limit: ALL_LIMIT,
        }),
      enabled: Boolean(s.communityId && s.subCommunityId),
      // No sockets on the RA panel: refetch on every navigation to this tab so
      // the table reflects the latest server state. Cached rows stay visible
      // while the refetch runs in the background (no skeleton flash).
      refetchOnMount: 'always' as const,
    })),
  });

  const journals: BackendTradeJournal[] = results.flatMap((r) => r.data?.journals ?? []);
  // Loading only while the first batch resolves; refetches keep showing data.
  const isLoading = subs.length > 0 && results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);
  const error = results.find((r) => r.error)?.error ?? null;

  return { journals, isLoading, isError, error };
}
