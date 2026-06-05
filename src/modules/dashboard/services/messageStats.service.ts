import * as z from 'zod';
import axiosInstance from '@/services/axios';
import { parseResponse } from '@/lib/validate';

const BASE = '/api/v1/message-stats';

// This endpoint returns the stats object directly (no success envelope), so we
// assert the field the UI drives the delivery tick from. Unknown keys pass through.
const messageStatsSchema = z
  .object({ total_seen: z.number() })
  .loose();

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
  parseResponse(messageStatsSchema, data, 'message stats');
  return data;
}
