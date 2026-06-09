'use client';

import { useQuery } from '@tanstack/react-query';
import { getMessages } from '@/modules/dashboard/services/messages.service';

// Fetches messages for one sub-community chat. Disabled until both ids are
// known so we never fire a request for an unselected chat.
//
// NB: we deliberately do NOT use `placeholderData: keepPreviousData` here. The
// dashboard mirrors this query into Redux keyed by chat id; the placeholder
// would briefly be the *previous* chat's data while the id is already the new
// chat, writing the wrong messages under the new chat's key. Instant switching
// is instead provided by the Redux store retaining each visited chat's messages
// (so the skeleton only shows on a genuine first visit).
export function useMessages(communityId?: string, subCommunityId?: string) {
  return useQuery({
    queryKey: ['messages', communityId, subCommunityId],
    queryFn: () => getMessages(communityId!, subCommunityId!),
    enabled: Boolean(communityId && subCommunityId),
  });
}
