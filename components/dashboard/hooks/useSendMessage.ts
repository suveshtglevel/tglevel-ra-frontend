'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { sendMessage, type SendMessageInput } from '@/components/dashboard/services/messages.service';
import { getApiErrorMessage } from '@/lib/errors/api-error';

// One send per target sub-community. `communityId` is the parent community id,
// since a broadcast can span sub-communities under different parents.
export interface SendTarget {
  communityId: string;
  subId: string;
}

export interface SendMessageVariables {
  targets: SendTarget[];
  // Per-target message input minus the community/sub ids (filled in per target).
  input: Omit<SendMessageInput, 'community_id' | 'sub_community_id'>;
  // Used for the success-toast wording ("Message" / "Poll").
  label?: string;
}

// Broadcasts a message/poll to one or more sub-communities and refreshes the
// affected chats. Sending is fire-one-per-target via Promise.allSettled, so a
// partial failure still delivers the rest; the toast reflects the outcome.
//
// Uses TanStack so callers get `isPending`/`isError` for free and the feed is
// refreshed by invalidating the same `['messages', communityId, subId]` query
// keys that `useMessages` reads.
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targets, input }: SendMessageVariables) => {
      const results = await Promise.allSettled(
        targets.map((t) =>
          sendMessage({ ...input, community_id: t.communityId, sub_community_id: t.subId })
        )
      );
      // If every target failed, throw so `onError` runs; otherwise treat it as a
      // (possibly partial) success and report the failures in `onSuccess`.
      if (results.every((r) => r.status === 'rejected')) {
        throw (results[0] as PromiseRejectedResult).reason;
      }
      return results;
    },
    onSuccess: (results, { targets, label = 'Message' }) => {
      // Refresh each affected chat — same keys `useMessages` queries on.
      targets.forEach((t) =>
        queryClient.invalidateQueries({ queryKey: ['messages', t.communityId, t.subId] })
      );

      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        toast.error(getApiErrorMessage((failed[0] as PromiseRejectedResult).reason));
        return;
      }
      toast.success(
        targets.length > 1
          ? `${label} sent to ${targets.length} communities!`
          : `${label} sent successfully!`
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
