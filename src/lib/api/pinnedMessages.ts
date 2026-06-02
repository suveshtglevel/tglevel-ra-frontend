import axiosInstance from '@/lib/axios';

const BASE = '/api/v1/pinned-messages';

export type PinStatus = 'pinned' | 'unpinned';

interface PinResponse {
  success: boolean;
  message: string;
  data?: { status: PinStatus };
}

// Toggle pin state for a message. The same endpoint pins or unpins and reports
// the resulting state via data.status. Only the message UUID is required.
export async function togglePinnedMessage(messageId: string): Promise<PinStatus> {
  const { data } = await axiosInstance.post<PinResponse>(
    `${BASE}/create-pinnedmessage`,
    { message_id: messageId }
  );
  if (!data.success) {
    throw new Error(data.message || 'Failed to update pin');
  }
  return data.data?.status ?? 'pinned';
}

// A currently-pinned message as returned by get-pinnedmessages. `message` holds
// the pinned message's (HTML) content.
export interface PinnedMessage {
  message_id: string;
  community_id: string;
  sub_community_id: string;
  status: PinStatus;
  message?: string;
  pinned_at?: string;
}

interface GetPinnedResponse {
  success: boolean;
  count: number;
  data: PinnedMessage[];
}

export async function getPinnedMessages(
  communityId: string,
  subCommunityId: string
): Promise<PinnedMessage[]> {
  const { data } = await axiosInstance.get<GetPinnedResponse>(
    `${BASE}/get-pinnedmessages`,
    { params: { community_id: communityId, sub_community_id: subCommunityId } }
  );
  if (!data.success) {
    throw new Error('Failed to load pinned messages');
  }
  return data.data ?? [];
}
