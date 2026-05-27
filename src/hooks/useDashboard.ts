import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectCommunity, selectSubCommunity } from '@/redux/slices/communitySlice';
import { sendMessage, sendFileMessage, updateMessageStatus } from '@/redux/slices/messageSlice';
import type { FileAttachment } from '@/redux/slices/messageSlice';

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

    // When a bundle is selected, broadcast to every sub-community in it;
    // otherwise send to the currently open chat.
    const targets =
      options?.targetCommunityIds && options.targetCommunityIds.length > 0
        ? options.targetCommunityIds
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
    handleSelectSubCommunity,
    handleSelectCommunity,
    handleSendMessage,
    handleSendFile,
  };
};
