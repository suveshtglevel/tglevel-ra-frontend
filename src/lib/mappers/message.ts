import type { BackendMessage, BackendAttachment, BackendPoll } from '@/modules/dashboard/services/messages.service';
import type { ChatMessage, FileAttachment, SliderBucket, SliderResults } from '@/store/slices/messageSlice';

// Turn the backend's slider_res (bad/neutral/excellent buckets + average) into
// the ordered bucket list the poll card renders. Returns undefined when there
// are no results to show.
function mapSliderResults(res: BackendPoll['slider_res']): SliderResults | undefined {
  if (!res || !res.results) return undefined;
  const r = res.results;
  const order: { key: 'bad' | 'neutral' | 'excellent'; label: string }[] = [
    { key: 'bad', label: 'Bad' },
    { key: 'neutral', label: 'Neutral' },
    { key: 'excellent', label: 'Excellent' },
  ];
  const buckets = order
    .map(({ key, label }): SliderBucket | null => {
      const b = r[key];
      if (!b) return null;
      return { label, range: b.range, count: b.count ?? 0, percentage: b.percentage ?? 0 };
    })
    .filter((b): b is SliderBucket => b !== null);
  if (buckets.length === 0) return undefined;
  return { buckets, average: r.average ?? null };
}

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
  const poll = m.poll
    ? {
        question: m.poll.question,
        poll_type: m.poll.poll_type,
        options: m.poll.options?.map((o) => ({
          id: o.option_id,
          text: o.text,
          votes: o.vote_count ?? 0,
        })),
        slider: m.poll.slider
          ? {
              minimum: m.poll.slider.minimum,
              maximum: m.poll.slider.maximum,
              leftLabel: m.poll.slider.leftLabel,
              rightLabel: m.poll.slider.rightLabel,
              selectedValue: m.poll.slider.selectedValue,
            }
          : undefined,
        emojis: m.poll.emojis,
        emojiResults: m.poll.emojis_res?.map((e) => ({
          emoji: e.emoji,
          count: e.count ?? 0,
          percentage: e.percentage ?? 0,
        })),
        sliderResults: mapSliderResults(m.poll.slider_res),
        total_votes: m.poll.total_votes,
        expires_at: m.poll.expires_at,
      }
    : undefined;
  return {
    // Prefer the UUID message_id so pin/unpin can reference it.
    id: m.message_id ?? m._id ?? '',
    communityId: m.sub_community_id ?? m.community_id,
    content: m.content,
    sequenceKey: m.sequence_key ?? m.sequenceKey,
    type: 'received',
    messageType: typeName,
    messageTypeId: m.type ?? undefined,
    timestamp: formatTime(m.createdAt),
    // Messages only flow outward from the RA (no per-recipient read receipts on
    // the feed), so show the WhatsApp "delivered" state: a grey double tick.
    status: 'delivered',
    sender: m.author_name ?? 'RA',
    attachment,
    poll,
    parentMessageId: m.parent_message_id || undefined,
  };
}
