import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setCommunities,
  selectCommunity,
  selectSubCommunity,
} from '@/redux/slices/communitySlice';
import {
  setMessages,
  sendMessage,
  sendFileMessage,
  togglePin,
} from '@/redux/slices/messageSlice';
import type { FileAttachment } from '@/redux/slices/messageSlice';
import { useCommunities } from '@/hooks/useCommunities';
import { useMessages } from '@/hooks/useMessages';
import { useMessageTypes } from '@/hooks/useMessageTypes';
import { toCommunityVM } from '@/lib/api/community';
import { sendMessage as sendMessageApi } from '@/lib/api/messages';
import { getApiErrorMessage } from '@/lib/api/errors';
import { mapBackendMessage } from '@/lib/mappers/message';
import type { CommunityVM } from '@/types/dashboard';

const MAX_PINNED = 3;

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

export interface SendOptions {
  messageType?: string;
  messageTypeId?: number;
  group?: string;
  notifyUsers?: boolean;
  targetCommunityIds?: string[];
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

  const communityVMs = useMemo<CommunityVM[]>(
    () => (rawCommunities ?? []).map((c) => toCommunityVM(c, assignedCommunities)),
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

  // ----- Message types (for label <-> numeric id mapping) --------------------
  const { data: messageTypes } = useMessageTypes();
  const typeNameById = useMemo(() => {
    const map = new Map<number, string>();
    (messageTypes ?? []).forEach((t) => map.set(t.id, t.name));
    return map;
  }, [messageTypes]);

  // ----- Server state: messages for the open chat ----------------------------
  const { data: fetchedMessages } = useMessages(
    selectedCommunityId ?? undefined,
    selectedSubCommunityId ?? undefined
  );

  useEffect(() => {
    if (fetchedMessages && selectedSubCommunityId) {
      dispatch(
        setMessages({
          chatId: selectedSubCommunityId,
          messages: fetchedMessages.map((m) =>
            mapBackendMessage(m, m.type != null ? typeNameById.get(m.type) : undefined)
          ),
        })
      );
    }
  }, [fetchedMessages, selectedSubCommunityId, typeNameById, dispatch]);

  const pinnedMessages = currentMessages.filter((m) => m.pinned);
  const pinnedItems = pinnedMessages.map((m) => ({
    id: m.id,
    preview: messagePreview(m.content, m.attachment?.name),
  }));

  // Pin/unpin a message in the current chat. Pinning while already at
  // MAX_PINNED drops the oldest pinned message to make room.
  const handleTogglePin = (messageId: string) => {
    const msg = currentMessages.find((m) => m.id === messageId);
    if (!msg) return;
    if (!msg.pinned && pinnedMessages.length >= MAX_PINNED) {
      dispatch(togglePin({ communityId: activeChatId, messageId: pinnedMessages[0].id }));
    }
    dispatch(togglePin({ communityId: activeChatId, messageId }));
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
    if (!content || content === '<p></p>') {
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

    // Fire one send per target sub-community, then refresh those chats.
    Promise.allSettled(
      sendable.map((subId) => {
        const parent = parentCommunityOf(subId)!;
        // Optimistic local append so the feed updates immediately.
        dispatch(
          sendMessage({
            communityId: subId,
            content,
            messageType: options?.messageType,
            group: options?.group,
            notifyUsers: options?.notifyUsers,
          })
        );
        return sendMessageApi({
          community_id: parent.id,
          sub_community_id: subId,
          type: options!.messageTypeId!,
          content,
          notification_sent: options?.notifyUsers ?? false,
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

  const handleSendFile = (attachment: FileAttachment, caption?: string) => {
    // No file-upload endpoint in the RA API yet; keep this local-only.
    dispatch(sendFileMessage({ communityId: activeChatId, attachment, caption }));
    toast.success(`${attachment.name} sent!`);
  };

  return {
    communities,
    communitiesLoading,
    communitiesError,
    messageTypes: messageTypes ?? [],
    selectedCommunityId,
    selectedSubCommunityId,
    selectedCommunity,
    selectedSubCommunity,
    currentMessages,
    pinnedItems,
    checkboxTargets,
    toggleSubTarget,
    toggleCommunityTargets,
    handleSelectSubCommunity,
    handleSelectCommunity,
    handleSendMessage,
    handleSendFile,
    handleTogglePin,
  };
};
