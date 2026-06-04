import axiosInstance from '@/lib/axios';
import { htmlToWhatsApp, whatsappToHtml, looksLikeHtml } from '@/lib/whatsappMarkdown';

const BASE = '/api/v1/messages';

// Message kind, sent as a numeric code the backend understands.
export type MessageType = number;

// send-message is multipart/form-data: text fields plus optional file fields
// (`images` for an image/video, `docs` for a document).
export interface SendMessageInput {
  community_id: string;
  sub_community_id: string;
  type: MessageType;
  content?: string;
  // Set when this message is a reply to an existing one.
  parent_message_id?: string;
  // Whether the backend should fan out a push notification for this message.
  notification_sent?: boolean;
  imageFile?: File;
  docFile?: File;
}

export interface SentMessage {
  _id: string;
  message_id?: string;
  community_id: string;
  sub_community_id?: string;
  type: MessageType;
  content: string;
  notification_sent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SendMessageResponse {
  success: boolean;
  message: string;
  data: SentMessage;
}

export async function sendMessage(input: SendMessageInput): Promise<SentMessage> {
  const form = new FormData();
  form.append('community_id', input.community_id);
  form.append('sub_community_id', input.sub_community_id);
  form.append('type', String(input.type));
  // The composer produces HTML; the backend/mobile store WhatsApp markdown, so
  // convert <strong>…</strong> back to *…* (etc.) before sending.
  form.append('content', htmlToWhatsApp(input.content ?? ''));
  form.append('notification_sent', String(input.notification_sent ?? false));
  if (input.parent_message_id) {
    form.append('parent_message_id', input.parent_message_id);
  }
  if (input.imageFile) form.append('images', input.imageFile);
  if (input.docFile) form.append('docs', input.docFile);

  const { data } = await axiosInstance.post<SendMessageResponse>(
    `${BASE}/send-message`,
    form,
    // Clear the default JSON Content-Type so the browser sets the multipart
    // boundary itself.
    { headers: { 'Content-Type': null } }
  );
  if (!data.success) {
    throw new Error(data.message || 'Failed to send message');
  }
  return data.data;
}

// ----- Get messages ---------------------------------------------------------

// A message as returned by get-messages. The backend schema is open-ended, so
// fields beyond the ones we rely on are kept optional.
export interface BackendAttachment {
  file_url: string;
  file_type: string;
  file_name: string;
}

export interface BackendMessage {
  // UUID-style message id (e.g. "msg_..."); used as message_id when pinning.
  message_id?: string;
  _id?: string;
  community_id: string;
  sub_community_id?: string;
  type?: MessageType;
  content: string;
  parent_message_id?: string;
  notification_sent?: boolean;
  author_id?: string;
  author_name?: string;
  attachments?: BackendAttachment[];
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
  // Messages are stored as WhatsApp markdown; the renderer expects HTML. Convert
  // markdown back to HTML, leaving any legacy HTML content untouched.
  return (data.messages ?? []).map((m) => ({
    ...m,
    content: m.content && !looksLikeHtml(m.content) ? whatsappToHtml(m.content) : m.content,
  }));
}

// ----- Message types --------------------------------------------------------

// A message type as configured on the backend. `id` is the numeric code sent as
// `type` on send-message; the backend returns it as a string `message_type_id`
// (e.g. "3" = follow-up), so it is coerced to a number here.
export interface MessageTypeOption {
  id: number;
  name: string;
}

interface BackendMessageType {
  _id: string;
  message_type_id: string;
  name: string;
}

interface GetMessageTypesResponse {
  success: boolean;
  data: BackendMessageType[];
}

export async function getMessageTypes(): Promise<MessageTypeOption[]> {
  const { data } = await axiosInstance.get<GetMessageTypesResponse>(
    `${BASE}/types`
  );
  if (!data.success) {
    throw new Error('Failed to load message types');
  }
  return (data.data ?? []).map((t) => ({
    id: Number(t.message_type_id),
    name: t.name,
  }));
}
