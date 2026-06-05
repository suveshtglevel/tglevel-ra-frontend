'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTradeJournal, type UpdateTradeJournalInput } from '@/modules/trade-journal/services/tradeJournals.service';

// RA fills the analysis fields (points, quantity, profit, exit price, high of)
// via update-trade-journal. On success the trade-journals queries are refetched
// so the table shows the new values. Success/error toasts are left to the
// caller. The combined "all sub-communities" view fetches every sub-community
// under the same ['trade-journals', ...] key prefix, so invalidating the prefix
// refreshes whichever view is active.
export function useUpdateTradeJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ journalId, input }: { journalId: string; input: UpdateTradeJournalInput }) =>
      updateTradeJournal(journalId, input),
    onSuccess: () => {
      // Refresh both the journal rows and the stat cards (the edit changes both).
      queryClient.invalidateQueries({ queryKey: ['trade-journals'] });
      queryClient.invalidateQueries({ queryKey: ['trade-stats'] });
    },
  });
}
