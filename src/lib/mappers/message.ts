import type { BackendMessage } from '@/lib/api/messages';
import type { ChatMessage } from '@/redux/slices/messageSlice';

// Format an ISO timestamp as a short "h:mm AM/PM" label for the chat feed.
export function formatTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const m = d.getMinutes();
  const period = d.getHours() >= 12 ? 'PM' : 'AM';
  const h12 = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

// Adapt a backend message to the ChatMessage shape the feed renders. `typeName`
// is the resolved label for the numeric message type (when known).
export function mapBackendMessage(m: BackendMessage, typeName?: string): ChatMessage {
  return {
    id: m._id,
    communityId: m.sub_community_id ?? m.community_id,
    content: m.content,
    type: 'received',
    messageType: typeName,
    timestamp: formatTime(m.createdAt),
    status: 'read',
    sender: m.sender_name ?? 'RA',
  };
}
