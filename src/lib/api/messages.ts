import axiosInstance from '@/lib/axios';

const BASE = '/api/v1/messages';

// Message kind, sent as a numeric code the backend understands.
export type MessageType = number;

export interface SendMessagePayload {
  community_id: string;
  sub_community_id?: string;
  type: MessageType;
  content: string;
  // Set when this message is a reply to an existing one.
  parent_message_id?: string;
  // Whether the backend should fan out a push notification for this message.
  notification_sent?: boolean;
}

export interface SentMessage {
  _id: string;
  community_id: string;
  sub_community_id?: string;
  type: MessageType;
  content: string;
  parent_message_id?: string;
  notification_sent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SendMessageResponse {
  success: boolean;
  message: string;
  data: SentMessage;
}

export async function sendMessage(
  payload: SendMessagePayload
): Promise<SentMessage> {
  const { data } = await axiosInstance.post<SendMessageResponse>(
    `${BASE}/send-message`,
    payload
  );
  if (!data.success) {
    throw new Error(data.message || 'Failed to send message');
  }
  return data.data;
}

// ----- Get messages ---------------------------------------------------------

// A message as returned by get-messages. The backend schema is open-ended, so
// fields beyond the ones we rely on are kept optional.
export interface BackendMessage {
  _id: string;
  community_id: string;
  sub_community_id?: string;
  type?: MessageType;
  content: string;
  parent_message_id?: string;
  notification_sent?: boolean;
  sender_name?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GetMessagesResponse {
  success: boolean;
  messages: BackendMessage[];
}

export async function getMessages(
  communityId: string,
  subCommunityId: string
): Promise<BackendMessage[]> {
  const { data } = await axiosInstance.get<GetMessagesResponse>(
    `${BASE}/get-messages`,
    { params: { community_id: communityId, sub_community_id: subCommunityId } }
  );
  if (!data.success) {
    throw new Error('Failed to load messages');
  }
  return data.messages ?? [];
}

// ----- Message types --------------------------------------------------------

// A message type as configured on the backend. `id` is the numeric code sent as
// `type` on send-message (swagger: "Message type ID, e.g. 3 = follow-up").
export interface MessageTypeOption {
  id: number;
  name: string;
}

interface GetMessageTypesResponse {
  success: boolean;
  data: Array<{ id?: number; type?: number; name: string }>;
}

export async function getMessageTypes(): Promise<MessageTypeOption[]> {
  const { data } = await axiosInstance.get<GetMessageTypesResponse>(
    `${BASE}/types`
  );
  if (!data.success) {
    throw new Error('Failed to load message types');
  }
  return (data.data ?? []).map((t) => ({
    id: (t.id ?? t.type) as number,
    name: t.name,
  }));
}
