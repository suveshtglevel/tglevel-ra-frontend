'use client';

import { useQuery } from '@tanstack/react-query';
import { getMessageStats } from '@/components/dashboard/services/messageStats.service';

// Seen-by stats for one message. Only enabled for backend (`msg_...`) ids —
// optimistic locally-sent messages have no stats yet. Drives both the
// single/double delivery tick and the "Viewed by" panel, so the cached result
// is shared between them.
export function useMessageStats(messageId?: string, enabled = true) {
  // Optimistic, locally-sent messages use a `msg-<communityId>-<ts>` id that the
  // stats endpoint doesn't know about; only query for real backend ids.
  const isServerId = !!messageId && !messageId.startsWith('msg-');
  return useQuery({
    queryKey: ['message-stats', messageId],
    queryFn: () => getMessageStats(messageId!),
    enabled: isServerId && enabled,
    // No sockets: the panel only mounts when the tick is clicked, so refetch each
    // time it opens to show the latest viewers rather than a cached list.
    refetchOnMount: 'always',
  });
}
