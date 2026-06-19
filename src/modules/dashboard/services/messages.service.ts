import * as z from 'zod';
import axiosInstance from '@/services/axios';
import { parseResponse } from '@/lib/validate';
import { htmlToWhatsApp, whatsappToHtml, looksLikeHtml } from '@/lib/whatsappMarkdown';

const BASE = '/api/v1/messages';

// Lenient runtime schemas. The backend message schema is open-ended, so we only
// assert the envelope + that the collections are arrays of objects; element
// fields stay loose (the service normalizes them).
const sendMessageResponseSchema = z
  .object({ success: z.boolean(), data: z.object({}).loose() })
  .loose();

// `messages`/`data` are optional: the service falls back to [] when absent.
const getMessagesResponseSchema = z
  .object({ success: z.boolean(), messages: z.array(z.object({}).loose()).optional() })
  .loose();

const getMessageTypesResponseSchema = z
  .object({ success: z.boolean(), data: z.array(z.object({}).loose()).optional() })
  .loose();

// Message kind, sent as a numeric code the backend understands.
export type MessageType = number;

// Poll payload sent with a type-6 (poll) message. The backend supports three
// poll variants distinguished by `poll_type`:
//   "poll"   – classic options-based poll (single/multiple choice)
//   "slider" – numeric scale with labels
//   "emoji"  – emoji reaction scale
export interface SendPollInput {
  poll_type: 'poll' | 'slider' | 'emoji';
  // Options-based poll (poll_type === 'poll')
  options?: { text: string }[];
  allows_multiple?: boolean;
  // Slider poll (poll_type === 'slider')
  slider?: {
    minimum: number;
    maximum: number;
    leftLabel: string;
    rightLabel: string;
  };
  // Emoji poll (poll_type === 'emoji'): a flat array of emoji glyphs.
  emojis?: string[];
  // ISO timestamp; when the poll closes.
  expires_at?: string;
}

// send-message is multipart/form-data: text fields plus optional file fields
// (`images` for an image/video, `docs` for a document). Poll messages are the
// exception — they carry a nested `poll` object and are sent as JSON.
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
  // Present only for poll messages (type 6).
  poll?: SendPollInput;
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
  // Poll messages have no files and carry a nested object, so they go as JSON
  // rather than multipart. Content is the poll question (plain text).
  if (input.poll) {
    const { data } = await axiosInstance.post<SendMessageResponse>(`${BASE}/send-message`, {
      community_id: input.community_id,
      sub_community_id: input.sub_community_id,
      type: input.type,
      content: input.content ?? '',
      notification_sent: input.notification_sent ?? false,
      ...(input.parent_message_id ? { parent_message_id: input.parent_message_id } : {}),
      poll: input.poll,
    });
    if (!data.success) {
      throw new Error(data.message || 'Failed to send message');
    }
    parseResponse(sendMessageResponseSchema, data, 'send-message');
    return data.data;
  }

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
  parseResponse(sendMessageResponseSchema, data, 'send-message');
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

// Poll as returned on a type-6 message.
export interface BackendPollOption {
  option_id: string;
  text: string;
  vote_count?: number;
}

export interface BackendPoll {
  poll_id?: string;
  question: string;
  poll_type?: 'poll' | 'slider' | 'emoji';
  options?: BackendPollOption[];
  slider?: {
    minimum: number;
    maximum: number;
    leftLabel?: string;
    rightLabel?: string;
    selectedValue?: number;
  };
  // Slider results: responses bucketed into bad/neutral/excellent ranges, plus
  // the average of all responses (null when there are none).
  slider_res?: {
    minimum?: number;
    maximum?: number;
    leftLabel?: string;
    rightLabel?: string;
    results?: {
      bad?: { range: [number, number]; count: number; percentage: number };
      neutral?: { range: [number, number]; count: number; percentage: number };
      excellent?: { range: [number, number]; count: number; percentage: number };
      average?: number | null;
    };
  } | null;
  // Emoji poll: a flat array of emoji glyphs (e.g. ["😀","🔥","💯"]).
  emojis?: string[];
  // Per-emoji results returned by get-messages for an emoji poll.
  emojis_res?: { emoji: string; count: number; percentage: number }[];
  total_votes?: number;
  allows_multiple?: boolean;
  expires_at?: string;
}

export interface BackendMessage {
  // UUID-style message id (e.g. "msg_..."); used as message_id when pinning.
  message_id?: string;
  _id?: string;
  sequence_key?: number;
  sequenceKey?: number;
  community_id: string;
  sub_community_id?: string;
  type?: MessageType;
  content: string;
  parent_message_id?: string;
  notification_sent?: boolean;
  author_id?: string;
  author_name?: string;
  attachments?: BackendAttachment[];
  poll?: BackendPoll;
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
  parseResponse(getMessagesResponseSchema, data, 'messages');
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
  // Stable, unique backend id — used as the React key / selection identity.
  // (`id` below can be NaN when the backend omits a numeric code, so it is not
  // safe to key on.)
  _id: string;
  id: number;
  name: string;
}

// The backend's exact field names for message types have varied (`_id` /
// `message_type_id` vs a plain `id`/`type`), so accept the known aliases and
// normalize, rather than assuming one shape.
interface BackendMessageType {
  _id?: string;
  id?: string | number;
  message_type_id?: string | number;
  type?: string | number;
  name?: string;
  label?: string;
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
  parseResponse(getMessageTypesResponseSchema, data, 'message types');
  return (data.data ?? []).map((t, index) => {
    // Numeric code sent back as `type` on send-message.
    const code = t.message_type_id ?? t.id ?? t.type;
    // Stable, guaranteed-unique key/identity — never undefined or duplicate.
    const _id = String(t._id ?? code ?? t.name ?? index);
    return {
      _id,
      id: Number(code),
      name: t.name ?? t.label ?? `Type ${index + 1}`,
    };
  });
}
