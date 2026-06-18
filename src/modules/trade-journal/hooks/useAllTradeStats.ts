'use client';

import { useQueries } from '@tanstack/react-query';
import { getTradeStats, type TradeStats } from '@/modules/trade-journal/services/tradeJournals.service';
import type { SubScope } from '@/modules/trade-journal/hooks/useAllTradeJournals';

// Like useAllTradeJournals: the stats endpoint needs a specific community_id +
// sub_community_id, so we fetch each sub-community's stats in parallel. The
// caller shows the selected sub's stats, or aggregates across all of them.
export function useAllTradeStats(subs: SubScope[]) {
  const results = useQueries({
    queries: subs.map((s) => ({
      queryKey: ['trade-stats', s.communityId, s.subCommunityId] as const,
      queryFn: () =>
        getTradeStats({ communityId: s.communityId, subCommunityId: s.subCommunityId }),
      enabled: Boolean(s.communityId && s.subCommunityId),
      // No sockets: refetch the stat cards on every navigation to the tab.
      refetchOnMount: 'always' as const,
    })),
  });

  // Stats keyed by sub_community_id for direct lookup, plus the full list for
  // aggregation.
  const byId: Record<string, TradeStats> = {};
  const list: TradeStats[] = [];
  results.forEach((r, i) => {
    if (r.data) {
      byId[subs[i].subCommunityId] = r.data;
      list.push(r.data);
    }
  });

  const isLoading = subs.length > 0 && results.some((r) => r.isLoading);

  return { byId, list, isLoading };
}
