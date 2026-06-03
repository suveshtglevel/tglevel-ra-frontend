import type { BackendMessage, BackendAttachment } from '@/lib/api/messages';
import type { ChatMessage, FileAttachment } from '@/redux/slices/messageSlice';

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

// Resolve the UI attachment kind from the backend file_type / file name.
function toAttachmentType(a: BackendAttachment): FileAttachment['fileType'] {
  if (a.file_type === 'image') return 'image';
  if (a.file_type === 'video') return 'video';
  const ext = a.file_name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
  return 'file';
}

// Adapt a backend message to the ChatMessage shape the feed renders. `typeName`
// is the resolved label for the numeric message type (when known).
export function mapBackendMessage(m: BackendMessage, typeName?: string): ChatMessage {
  const first = m.attachments?.[0];
  const attachment: FileAttachment | undefined = first
    ? { name: first.file_name, size: '', fileType: toAttachmentType(first), url: first.file_url }
    : undefined;
  return {
    // Prefer the UUID message_id so pin/unpin can reference it.
    id: m.message_id ?? m._id ?? '',
    communityId: m.sub_community_id ?? m.community_id,
    content: m.content,
    type: 'received',
    messageType: typeName,
    messageTypeId: m.type ?? undefined,
    timestamp: formatTime(m.createdAt),
    status: 'read',
    sender: m.author_name ?? 'RA',
    attachment,
  };
}
