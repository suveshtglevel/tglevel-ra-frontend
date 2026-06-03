import axiosInstance from '@/lib/axios';

const BASE = '/api/v1/message-stats';

// One user who has seen a message, as returned by the stats endpoint.
export interface MessageViewer {
  user_id: string;
  name: string;
  email: string;
  profile_image?: string;
  seen_at: string;
  created_at: string;
}

export interface MessageStats {
  total_seen: number;
  message_info: {
    message_id: string;
    content: string;
    type: number;
    community_id: string;
    sub_community_id?: string;
    message_created_at: string;
  };
  seen_by: MessageViewer[];
}

// How many users have seen a message and who they are. `messageId` is the
// UUID-style `msg_...` id (the `message_id` from get-messages). This endpoint
// returns the stats object directly (no `success` envelope).
export async function getMessageStats(messageId: string): Promise<MessageStats> {
  const { data } = await axiosInstance.get<MessageStats>(`${BASE}/${messageId}`);
  return data;
}
