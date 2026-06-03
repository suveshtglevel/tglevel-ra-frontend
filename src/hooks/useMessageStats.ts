'use client';

import { useQuery } from '@tanstack/react-query';
import { getMessageStats } from '@/lib/api/messageStats';

// Seen-by stats for one message. Only enabled for backend (`msg_...`) ids —
// optimistic locally-sent messages have no stats yet. Drives both the
// single/double delivery tick and the "Viewed by" panel, so the cached result
// is shared between them.
export function useMessageStats(messageId?: string, enabled = true) {
  return useQuery({
    queryKey: ['message-stats', messageId],
    queryFn: () => getMessageStats(messageId!),
    enabled: Boolean(messageId) && enabled,
  });
}
