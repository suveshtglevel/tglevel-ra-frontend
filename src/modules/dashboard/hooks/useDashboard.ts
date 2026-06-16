import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setCommunities,
  selectCommunity,
  selectSubCommunity,
} from '@/store/slices/communitySlice';
import {
  setMessages,
  setPinned,
} from '@/store/slices/messageSlice';
import type { FileAttachment } from '@/store/slices/messageSlice';
import { useCommunities } from '@/modules/dashboard/hooks/useCommunities';
import { useMessages } from '@/modules/dashboard/hooks/useMessages';
import { useMessageTypes } from '@/modules/dashboard/hooks/useMessageTypes';
import { useBundles } from '@/modules/dashboard/hooks/useBundles';
import { useCreateBundle } from '@/modules/dashboard/hooks/useCreateBundle';
import { useDeleteBundle } from '@/modules/dashboard/hooks/useDeleteBundle';
import { usePinnedMessages } from '@/modules/dashboard/hooks/usePinnedMessages';
import { toCommunityVM } from '@/modules/dashboard/services/community.service';
import { sendMessage as sendMessageApi } from '@/modules/dashboard/services/messages.service';
import { togglePinnedMessage } from '@/modules/dashboard/services/pinnedMessages.service';
import { getApiErrorMessage } from '@/lib/errors/api-error';
import { mapBackendMessage } from '@/lib/mappers/message';
import type { CommunityVM, BundleVM } from '@/types/dashboard';

// Plain-text preview from a message's HTML content / attachment.
const messagePreview = (content: string, attachmentName?: string) => {
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text || attachmentName || 'Attachment';
};

// Sidebar checkbox selection: only one community can have checked sub-communities
// at a time. These checked subs are the broadcast targets when no bundle is picked.
interface CheckboxTargets {
  communityId: string | null;
  subIds: string[];
}

// Poll draft handed up from the composer's poll builder.
export interface ComposerPoll {
  question: string;
  options: string[];
  allowsMultiple: boolean;
  // ISO timestamp; when the poll closes (optional).
  expiresAt?: string;
}

export interface SendOptions {
  messageType?: string;
  messageTypeId?: number;
  group?: string;
  notifyUsers?: boolean;
  targetCommunityIds?: string[];
  // Set when this message is a follow-up reply to an existing message; carries
  // the parent message's id so the backend can thread it.
  parentMessageId?: string;
  // Attachment to upload with the message (send-message is multipart). `file`
  // is the raw upload; `attachment` carries the composer's local preview metadata.
  file?: File;
  fileType?: FileAttachment['fileType'];
  attachment?: FileAttachment;
}

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // ----- Server state: communities (admin-owned), gated by assignment --------
  const assignedCommunities = useAppSelector(
    (state) => state.auth.user?.assignedCommunities ?? []
  );
  const {
    data: rawCommunities,
    isLoading: communitiesLoading,
    isError: communitiesError,
  } = useCommunities();

  // Only the RA's assigned communities are shown (the backend returns every
  // community, but the RA should see just the ones it owns/can use).
  const communityVMs = useMemo<CommunityVM[]>(
    () =>
      (rawCommunities ?? [])
        .map((c) => toCommunityVM(c, assignedCommunities)),
    [rawCommunities, assignedCommunities]
  );

  // Mirror the fetched list into the store so the rest of the UI reads it the
  // same way it always has (selection lives in the store too).
  useEffect(() => {
    if (rawCommunities) {
      dispatch(setCommunities(communityVMs));
    }
  }, [rawCommunities, communityVMs, dispatch]);

  const communities = useAppSelector((state) => state.community.communities);
  const selectedCommunityId = useAppSelector(
    (state) => state.community.selectedCommunityId
  );
  const selectedSubCommunityId = useAppSelector(
    (state) => state.community.selectedSubCommunityId
  );
  const allMessages = useAppSelector((state) => state.messages.messages);

  const selectedCommunity =
    communities.find((c) => c.id === selectedCommunityId) ?? communities[0] ?? null;

  const selectedSubCommunity =
    selectedCommunity?.subCommunities?.find((s) => s.id === selectedSubCommunityId) ?? null;

  // The chat unit is the sub-community; fall back to the community id for local
  // keying when a community has no sub-communities.
  const activeChatId = selectedSubCommunityId ?? selectedCommunityId ?? '';
  const currentMessages = allMessages[activeChatId] ?? [];

  // ----- Bundles (RA-owned sub-community groupings) --------------------------
  const { data: rawBundles } = useBundles();
  const createBundleMutation = useCreateBundle();
  const deleteBundleMutation = useDeleteBundle();
  const bundles = useMemo<BundleVM[]>(
    () =>
      (rawBundles ?? []).map((b) => ({
        id: b.bundle_id,
        name: b.name,
        communityId: b.community_id,
        subIds: b.sub_communities ?? [],
      })),
    [rawBundles]
  );

  const handleCreateBundle = (payload: {
    name: string;
    communityId: string;
    subIds: string[];
  }) => {
    createBundleMutation.mutate({
      name: payload.name,
      status: 'active',
      subCommunities_Ids: payload.subIds,
      community_id: payload.communityId,
    });
  };

  const handleDeleteBundle = (bundleId: string) => {
    deleteBundleMutation.mutate(bundleId);
  };

  // ----- Message types (for label <-> numeric id mapping) --------------------
  const { data: messageTypes } = useMessageTypes();
  const typeNameById = useMemo(() => {
    const map = new Map<number, string>();
    (messageTypes ?? []).forEach((t) => map.set(t.id, t.name));
    return map;
  }, [messageTypes]);

  // ----- Server state: messages + pinned messages for the open chat ----------
  const { data: fetchedMessages, isLoading: messagesLoading } = useMessages(
    selectedCommunityId ?? undefined,
    selectedSubCommunityId ?? undefined
  );
  const { data: pinnedData } = usePinnedMessages(
    selectedCommunityId ?? undefined,
    selectedSubCommunityId ?? undefined
  );
  const pinnedIdSet = useMemo(
    () => new Set((pinnedData ?? []).map((p) => p.message_id)),
    [pinnedData]
  );

  useEffect(() => {
    if (fetchedMessages && selectedSubCommunityId) {
      dispatch(
        setMessages({
          chatId: selectedSubCommunityId,
          messages: fetchedMessages.map((m) => {
            const cm = mapBackendMessage(m, m.type != null ? typeNameById.get(m.type) : undefined);
            cm.pinned = pinnedIdSet.has(cm.id);
            return cm;
          }),
        })
      );
    }
  }, [fetchedMessages, selectedSubCommunityId, typeNameById, pinnedIdSet, dispatch]);

  // The pinned bar is driven by the server's pinned list (so it persists across
  // reloads), with previews taken from each pin's message content.
  const pinnedItems = (pinnedData ?? []).map((p) => ({
    id: p.message_id,
    preview: messagePreview(p.message ?? ''),
  }));

  // Pin/unpin a message via the pinned-messages API (a single toggle endpoint).
  // Optimistically flip the feed, reconcile with the server's reported status,
  // then refresh the pinned list so the pinned bar stays in sync. Pins are
  // removed manually by the RA (no automatic eviction).
  const handleTogglePin = (messageId: string) => {
    const msg = currentMessages.find((m) => m.id === messageId);
    if (!msg) return;
    const willPin = !msg.pinned;

    dispatch(setPinned({ communityId: activeChatId, messageId, pinned: willPin }));
    togglePinnedMessage(messageId)
      .then((status) => {
        dispatch(setPinned({ communityId: activeChatId, messageId, pinned: status === 'pinned' }));
        queryClient.invalidateQueries({
          queryKey: ['pinned-messages', selectedCommunityId, selectedSubCommunityId],
        });
      })
      .catch((error) => {
        dispatch(setPinned({ communityId: activeChatId, messageId, pinned: !willPin }));
        toast.error(getApiErrorMessage(error));
      });
  };

  const [checkboxTargets, setCheckboxTargets] = useState<CheckboxTargets>({
    communityId: null,
    subIds: [],
  });

  // Toggle a single sub-community. Picking a sub from a different community
  // resets the selection to that community (one community at a time).
  const toggleSubTarget = (communityId: string, subId: string) => {
    setCheckboxTargets((prev) => {
      if (prev.communityId !== communityId) {
        return { communityId, subIds: [subId] };
      }
      const subIds = prev.subIds.includes(subId)
        ? prev.subIds.filter((id) => id !== subId)
        : [...prev.subIds, subId];
      return { communityId: subIds.length > 0 ? communityId : null, subIds };
    });
  };

  // Master checkbox: select every sub under a community, or clear if all are
  // already selected. Switching communities clears the previous selection.
  const toggleCommunityTargets = (communityId: string, allSubIds: string[]) => {
    setCheckboxTargets((prev) => {
      const allSelected =
        prev.communityId === communityId && prev.subIds.length === allSubIds.length;
      if (allSelected) {
        return { communityId: null, subIds: [] };
      }
      return { communityId, subIds: [...allSubIds] };
    });
  };

  const handleSelectSubCommunity = (id: string) => {
    dispatch(selectSubCommunity(id));
  };

  // Used for communities that have no sub-communities (they are their own chat).
  const handleSelectCommunity = (id: string) => {
    dispatch(selectCommunity(id));
  };

  // Resolve the parent community id for a given sub-community id.
  const parentCommunityOf = (subId: string): CommunityVM | undefined =>
    communities.find((c) => c.subCommunities?.some((s) => s.id === subId));

  const handleSendMessage = (content: string, options?: SendOptions) => {
    const hasContent = Boolean(content && content !== '<p></p>');
    if (!hasContent && !options?.file) {
      toast.error('Please enter a message');
      return;
    }

    // Targeting priority: an explicit bundle, then the sidebar checkbox
    // selection, then the currently open sub-community chat as a fallback.
    const rawTargets =
      options?.targetCommunityIds && options.targetCommunityIds.length > 0
        ? options.targetCommunityIds
        : checkboxTargets.subIds.length > 0
          ? checkboxTargets.subIds
          : selectedSubCommunityId
            ? [selectedSubCommunityId]
            : [];

    if (rawTargets.length === 0) {
      toast.error('Select a sub-community to send to');
      return;
    }

    // Gate: keep only targets whose parent community the RA is assigned to.
    const sendable = rawTargets.filter((subId) => parentCommunityOf(subId)?.sendable);
    const blocked = rawTargets.length - sendable.length;
    if (sendable.length === 0) {
      toast.error('You are not assigned to message this community');
      return;
    }
    if (blocked > 0) {
      toast.error(`Skipped ${blocked} community you are not assigned to`);
    }

    if (options?.messageTypeId == null) {
      toast.error('Could not resolve the message type');
      return;
    }

    // Images go in the `images` field; PDFs/Excel/docs go in `docs`.
    // (Video handling is undecided, so it currently falls through to `docs`.)
    const isImage = options?.fileType === 'image';

    // Fire one send per target sub-community, then refresh those chats. The feed
    // is updated only from the server response (no temporary local append).
    Promise.allSettled(
      sendable.map((subId) => {
        const parent = parentCommunityOf(subId)!;
        return sendMessageApi({
          community_id: parent.id,
          sub_community_id: subId,
          type: options!.messageTypeId!,
          content: hasContent ? content : '',
          parent_message_id: options?.parentMessageId,
          notification_sent: options?.notifyUsers ?? false,
          imageFile: isImage ? options?.file : undefined,
          docFile: !isImage ? options?.file : undefined,
        }).then(() =>
          queryClient.invalidateQueries({ queryKey: ['messages', parent.id, subId] })
        );
      })
    ).then((results) => {
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed > 0) {
        const reason = (results.find((r) => r.status === 'rejected') as PromiseRejectedResult)
          ?.reason;
        toast.error(getApiErrorMessage(reason));
      } else {
        toast.success(
          sendable.length > 1
            ? `Message sent to ${sendable.length} communities!`
            : 'Message sent successfully!'
        );
      }
    });
  };

  // Send a poll (type-6 message) to the targeted sub-communities, mirroring the
  // targeting used for regular messages (sidebar checkbox selection, else the
  // open chat). The feed is refreshed from the server response.
  const handleSendPoll = (poll: ComposerPoll) => {
    const question = poll.question.trim();
    const options = poll.options.map((o) => o.trim()).filter(Boolean);
    if (!question) {
      toast.error('Add a poll question');
      return;
    }
    if (options.length < 2) {
      toast.error('Add at least two options');
      return;
    }

    const rawTargets =
      checkboxTargets.subIds.length > 0
        ? checkboxTargets.subIds
        : selectedSubCommunityId
          ? [selectedSubCommunityId]
          : [];
    if (rawTargets.length === 0) {
      toast.error('Select a sub-community to send to');
      return;
    }

    const sendable = rawTargets.filter((subId) => parentCommunityOf(subId)?.sendable);
    if (sendable.length === 0) {
      toast.error('You are not assigned to message this community');
      return;
    }
    const blocked = rawTargets.length - sendable.length;
    if (blocked > 0) {
      toast.error(`Skipped ${blocked} community you are not assigned to`);
    }

    Promise.allSettled(
      sendable.map((subId) => {
        const parent = parentCommunityOf(subId)!;
        return sendMessageApi({
          community_id: parent.id,
          sub_community_id: subId,
          type: 6,
          content: question,
          notification_sent: false,
          poll: {
            options: options.map((text) => ({ text })),
            allows_multiple: poll.allowsMultiple,
            ...(poll.expiresAt ? { expires_at: poll.expiresAt } : {}),
          },
        }).then(() =>
          queryClient.invalidateQueries({ queryKey: ['messages', parent.id, subId] })
        );
      })
    ).then((results) => {
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed > 0) {
        const reason = (results.find((r) => r.status === 'rejected') as PromiseRejectedResult)
          ?.reason;
        toast.error(getApiErrorMessage(reason));
      } else {
        toast.success(
          sendable.length > 1
            ? `Poll sent to ${sendable.length} communities!`
            : 'Poll sent successfully!'
        );
      }
    });
  };

  return {
    communities,
    communitiesLoading,
    communitiesError,
    messageTypes: messageTypes ?? [],
    bundles,
    handleCreateBundle,
    creatingBundle: createBundleMutation.isPending,
    handleDeleteBundle,
    deletingBundleId: deleteBundleMutation.isPending ? deleteBundleMutation.variables : null,
    selectedCommunityId,
    selectedSubCommunityId,
    selectedCommunity,
    selectedSubCommunity,
    currentMessages,
    messagesLoading,
    pinnedItems,
    checkboxTargets,
    toggleSubTarget,
    toggleCommunityTargets,
    handleSelectSubCommunity,
    handleSelectCommunity,
    handleSendMessage,
    handleSendPoll,
    handleTogglePin,
  };
};
