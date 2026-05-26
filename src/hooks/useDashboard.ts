import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectCommunity } from '@/redux/slices/communitySlice';

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const communities = useAppSelector((state) => state.community.communities);
  const selectedCommunityId = useAppSelector(
    (state) => state.community.selectedCommunityId
  );

  const selectedCommunity =
    communities.find((c) => c.id === selectedCommunityId) ?? communities[0];

  const handleSelectCommunity = (id: number) => {
    dispatch(selectCommunity(id));
  };

  const handleSendMessage = (content: string) => {
    if (!content || content === '<p></p>') {
      toast.error('Please enter a message');
      return;
    }
    console.log('Sending message:', content);
    toast.success('Message sent successfully!');
  };

  return {
    communities,
    selectedCommunityId,
    selectedCommunity,
    currentAnalysis: selectedCommunity.analysis,
    handleSelectCommunity,
    handleSendMessage,
  };
};
