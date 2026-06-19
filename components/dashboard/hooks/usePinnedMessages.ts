'use client';

import { useQuery } from '@tanstack/react-query';
import { getPinnedMessages } from '@/components/dashboard/services/pinnedMessages.service';

// Server-side pinned messages for one sub-community chat. Disabled until both
// ids are known. Cached under ['pinned-messages', communityId, subCommunityId];
// the pin toggle invalidates this key to keep the pinned bar in sync.
export function usePinnedMessages(communityId?: string, subCommunityId?: string) {
  return useQuery({
    queryKey: ['pinned-messages', communityId, subCommunityId],
    queryFn: () => getPinnedMessages(communityId!, subCommunityId!),
    enabled: Boolean(communityId && subCommunityId),
    // No sockets: refetch the pinned bar on every navigation back to the dashboard.
    refetchOnMount: 'always',
  });
}
