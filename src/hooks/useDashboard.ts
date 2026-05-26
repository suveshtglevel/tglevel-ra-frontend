import { toast } from 'react-hot-toast';
import { COMMUNITIES, CURRENT_ANALYSIS } from '@/constants/mockData';

export const useDashboard = () => {
  const handleSendMessage = (content: string) => {
    if (!content || content === '<p></p>') {
      toast.error('Please enter a message');
      return;
    }
    console.log('Sending message:', content);
    toast.success('Message sent successfully!');
  };

  return {
    communities: COMMUNITIES,
    currentAnalysis: CURRENT_ANALYSIS,
    handleSendMessage,
  };
};
