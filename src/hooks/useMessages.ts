'use client';

import { useQuery } from '@tanstack/react-query';
import { getMessages } from '@/lib/api/messages';

// Fetches messages for one sub-community chat. Disabled until both ids are
// known so we never fire a request for an unselected chat.
export function useMessages(communityId?: string, subCommunityId?: string) {
  return useQuery({
    queryKey: ['messages', communityId, subCommunityId],
    queryFn: () => getMessages(communityId!, subCommunityId!),
    enabled: Boolean(communityId && subCommunityId),
  });
}
