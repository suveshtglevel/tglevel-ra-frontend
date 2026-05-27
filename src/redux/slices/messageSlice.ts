import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { COMMUNITIES, CommunityAnalysis } from '@/constants/mockData';

export interface FileAttachment {
  name: string;
  size: string;
  fileType: 'image' | 'video' | 'pdf' | 'doc' | 'excel' | 'file';
  url: string; // base64 data URL or blob URL
}

export interface ChatMessage {
  id: string;
  communityId: number;
  content: string;
  type: 'sent' | 'received';
  messageType?: string;
  group?: string;
  notifyUsers?: boolean;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  sender: string;
  attachment?: FileAttachment;
  // Trade-card metadata (only present when messageType === 'Trade')
  tradeTag?: string;
  tradeRefId?: string;
}

interface MessageState {
  messages: Record<number, ChatMessage[]>;
}

// Build the HTML body of a Trade card from structured analysis data.
const analysisToHtml = (a: CommunityAnalysis) =>
  `<p><b>${a.title}</b></p>` +
  `<p>Entry Above = ${a.entry}</p>` +
  `<p>SL = ${a.sl}</p>` +
  `<p>Target 1 = ${a.target1}</p>` +
  `<p>Target 2 = ${a.target2}</p>` +
  `<p>Our Customer Care:- ${a.customerCare}</p>` +
  `<p>Rationale = <a href="${a.rationale}" target="_blank" rel="noopener noreferrer">${a.rationale}</a></p>` +
  `<p>Confidence Level Trade: ${a.confidence}</p>`;

// One seed Trade card per chat (derived from the parent community's analysis).
const seedTrade = (chatId: number, a: CommunityAnalysis): ChatMessage => ({
  id: `seed-${chatId}`,
  communityId: chatId,
  content: analysisToHtml(a),
  type: 'received',
  messageType: 'Trade',
  timestamp: a.time,
  status: 'read',
  sender: 'RA Admin',
  tradeTag: a.tag,
  tradeRefId: a.id,
});

// Every community and subcommunity starts with exactly one seed Trade card —
// no random messages. Subcommunities inherit the parent community's analysis.
const INITIAL_MESSAGES: Record<number, ChatMessage[]> = {};
COMMUNITIES.forEach((c) => {
  INITIAL_MESSAGES[c.id] = [seedTrade(c.id, c.analysis)];
  c.subCommunities?.forEach((s) => {
    INITIAL_MESSAGES[s.id] = [seedTrade(s.id, c.analysis)];
  });
});

const initialState: MessageState = {
  messages: INITIAL_MESSAGES,
};

const formatNow = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hr}:${m.toString().padStart(2, '0')} ${period}`;
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    sendMessage: (state, action: PayloadAction<{
      communityId: number;
      content: string;
      messageType?: string;
      group?: string;
      notifyUsers?: boolean;
    }>) => {
      const { communityId, content, messageType, group, notifyUsers } = action.payload;
      const isTrade = messageType === 'Trade';

      const newMsg: ChatMessage = {
        id: `msg-${communityId}-${Date.now()}`,
        communityId,
        content,
        type: 'sent',
        messageType,
        group,
        notifyUsers,
        timestamp: formatNow(),
        status: 'sent',
        sender: 'You',
        tradeTag: isTrade ? 'Trade' : undefined,
        tradeRefId: isTrade ? String(Date.now()).slice(-4) : undefined,
      };

      if (!state.messages[communityId]) {
        state.messages[communityId] = [];
      }
      state.messages[communityId].push(newMsg);
    },
    sendFileMessage: (state, action: PayloadAction<{
      communityId: number;
      attachment: FileAttachment;
      caption?: string;
    }>) => {
      const { communityId, attachment, caption } = action.payload;

      const newMsg: ChatMessage = {
        id: `msg-${communityId}-${Date.now()}`,
        communityId,
        content: caption || '',
        type: 'sent',
        timestamp: formatNow(),
        status: 'sent',
        sender: 'You',
        attachment,
      };

      if (!state.messages[communityId]) {
        state.messages[communityId] = [];
      }
      state.messages[communityId].push(newMsg);
    },
    updateMessageStatus: (state, action: PayloadAction<{ messageId: string; communityId: number; status: 'sent' | 'delivered' | 'read' }>) => {
      const { messageId, communityId, status } = action.payload;
      const msgs = state.messages[communityId];
      if (msgs) {
        const msg = msgs.find((m) => m.id === messageId);
        if (msg) {
          msg.status = status;
        }
      }
    },
  },
});

export const { sendMessage, sendFileMessage, updateMessageStatus } = messageSlice.actions;
export default messageSlice.reducer;
