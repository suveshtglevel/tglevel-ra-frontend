import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectCommunity, selectSubCommunity } from '@/redux/slices/communitySlice';
import { sendMessage, sendFileMessage, togglePin, updateMessageStatus } from '@/redux/slices/messageSlice';
import type { FileAttachment } from '@/redux/slices/messageSlice';

const MAX_PINNED = 3;

// Plain-text preview from a message's HTML content / attachment.
const messagePreview = (content: string, attachmentName?: string) => {
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text || attachmentName || 'Attachment';
};

// Sidebar checkbox selection: only one community can have checked sub-communities
// at a time. These checked subs are the broadcast targets when no bundle is picked.
interface CheckboxTargets {
  communityId: number | null;
  subIds: number[];
}

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const communities = useAppSelector((state) => state.community.communities);
  const selectedCommunityId = useAppSelector(
    (state) => state.community.selectedCommunityId
  );
  const selectedSubCommunityId = useAppSelector(
    (state) => state.community.selectedSubCommunityId
  );
  const allMessages = useAppSelector((state) => state.messages.messages);

  const selectedCommunity =
    communities.find((c) => c.id === selectedCommunityId) ?? communities[0];

  const selectedSubCommunity =
    selectedCommunity.subCommunities?.find((s) => s.id === selectedSubCommunityId) ?? null;

  const activeChatId = selectedSubCommunityId ?? selectedCommunityId;
  const currentMessages = allMessages[activeChatId] ?? [];

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
  const toggleSubTarget = (communityId: number, subId: number) => {
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
  const toggleCommunityTargets = (communityId: number, allSubIds: number[]) => {
    setCheckboxTargets((prev) => {
      const allSelected =
        prev.communityId === communityId && prev.subIds.length === allSubIds.length;
      if (allSelected) {
        return { communityId: null, subIds: [] };
      }
      return { communityId, subIds: [...allSubIds] };
    });
  };

  const handleSelectSubCommunity = (id: number) => {
    dispatch(selectSubCommunity(id));
  };

  // Used for communities that have no sub-communities (they are their own chat).
  const handleSelectCommunity = (id: number) => {
    dispatch(selectCommunity(id));
  };

  const handleSendMessage = (
    content: string,
    options?: { messageType?: string; group?: string; notifyUsers?: boolean; targetCommunityIds?: number[] }
  ) => {
    if (!content || content === '<p></p>') {
      toast.error('Please enter a message');
      return;
    }

    // Targeting priority: an explicit bundle, then the sidebar checkbox
    // selection, then the currently open chat as a fallback.
    const targets =
      options?.targetCommunityIds && options.targetCommunityIds.length > 0
        ? options.targetCommunityIds
        : checkboxTargets.subIds.length > 0
          ? checkboxTargets.subIds
          : [activeChatId];

    targets.forEach((id) => {
      dispatch(sendMessage({
        communityId: id,
        content,
        messageType: options?.messageType,
        group: options?.group,
        notifyUsers: options?.notifyUsers,
      }));
    });

    toast.success(
      targets.length > 1
        ? `Message sent to ${targets.length} communities!`
        : 'Message sent successfully!'
    );
  };

  const handleSendFile = (attachment: FileAttachment, caption?: string) => {
    dispatch(sendFileMessage({
      communityId: activeChatId,
      attachment,
      caption,
    }));
    toast.success(`${attachment.name} sent!`);
  };

  return {
    communities,
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
