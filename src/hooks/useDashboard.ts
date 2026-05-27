import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectCommunity } from '@/redux/slices/communitySlice';
import { sendMessage, updateMessageStatus } from '@/redux/slices/messageSlice';

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const communities = useAppSelector((state) => state.community.communities);
  const selectedCommunityId = useAppSelector(
    (state) => state.community.selectedCommunityId
  );
  const allMessages = useAppSelector((state) => state.messages.messages);

  const selectedCommunity =
    communities.find((c) => c.id === selectedCommunityId) ?? communities[0];

  const currentMessages = allMessages[selectedCommunityId] ?? [];

  const handleSelectCommunity = (id: number) => {
    dispatch(selectCommunity(id));
  };

  const handleSendMessage = (content: string, options?: { messageType?: string; group?: string; notifyUsers?: boolean }) => {
    if (!content || content === '<p></p>') {
      toast.error('Please enter a message');
      return;
    }
    dispatch(sendMessage({
      communityId: selectedCommunityId,
      content,
      messageType: options?.messageType,
      group: options?.group,
      notifyUsers: options?.notifyUsers,
    }));

    // Simulate status progression: sent -> delivered -> read
    const msgId = `msg-${selectedCommunityId}-${Date.now()}`;
    setTimeout(() => {
      dispatch(updateMessageStatus({ messageId: msgId, communityId: selectedCommunityId, status: 'delivered' }));
    }, 1000);
    setTimeout(() => {
      dispatch(updateMessageStatus({ messageId: msgId, communityId: selectedCommunityId, status: 'read' }));
    }, 2500);

    toast.success('Message sent successfully!');
  };

  return {
    communities,
    selectedCommunityId,
    selectedCommunity,
    currentAnalysis: selectedCommunity.analysis,
    currentMessages,
    handleSelectCommunity,
    handleSendMessage,
  };
};
