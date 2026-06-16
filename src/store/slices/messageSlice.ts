import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FileAttachment {
  name: string;
  size: string;
  fileType: 'image' | 'video' | 'pdf' | 'doc' | 'excel' | 'file';
  url: string; // base64 data URL or blob URL
}

// A poll attached to a message. Currently a UI-only feature — polls are shown
// in the feed but not persisted to the backend.
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollData {
  question: string;
  options: PollOption[];
}

export interface ChatMessage {
  id: string;
  // The chat this message belongs to: a sub-community id, or a community id for
  // communities without sub-communities. Backend Mongo string id.
  communityId: string;
  content: string;
  type: 'sent' | 'received';
  messageType?: string;
  // Numeric backend message type (1=Trade, 2=Promotion, 3=Followup,
  // 4=Feedback, 5=Flaunt). Used for the type label shown on the bubble.
  messageTypeId?: number;
  group?: string;
  notifyUsers?: boolean;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  sender: string;
  pinned?: boolean;
  attachment?: FileAttachment;
  sequenceKey?: number;
  // Set on a follow-up reply: the id of the message it follows up on. Drives the
  // WhatsApp-style quoted-reply UI in the feed.
  parentMessageId?: string;
  // Trade-card metadata (only present when messageType === 'Trade')
  tradeTag?: string;
  tradeRefId?: string;
  // Poll payload (only present on poll messages — UI-only, not sent to the DB).
  poll?: PollData;
}

interface MessageState {
  // Keyed by chat id (sub-community id, or community id when it has no subs).
  messages: Record<string, ChatMessage[]>;
}

const initialState: MessageState = {
  messages: {},
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
    // Replace a chat's messages with the list fetched from the backend.
    setMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: ChatMessage[] }>
    ) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    sendMessage: (state, action: PayloadAction<{
      communityId: string;
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
      communityId: string;
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
    togglePin: (state, action: PayloadAction<{ communityId: string; messageId: string }>) => {
      const { communityId, messageId } = action.payload;
      const msg = state.messages[communityId]?.find((m) => m.id === messageId);
      if (msg) {
        msg.pinned = !msg.pinned;
      }
    },
    // Set a message's pinned flag explicitly (used to reconcile with the
    // server's reported pin/unpin status).
    setPinned: (state, action: PayloadAction<{ communityId: string; messageId: string; pinned: boolean }>) => {
      const { communityId, messageId, pinned } = action.payload;
      const msg = state.messages[communityId]?.find((m) => m.id === messageId);
      if (msg) {
        msg.pinned = pinned;
      }
    },
    updateMessageStatus: (state, action: PayloadAction<{ messageId: string; communityId: string; status: 'sent' | 'delivered' | 'read' }>) => {
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

export const { setMessages, sendMessage, sendFileMessage, togglePin, setPinned, updateMessageStatus } = messageSlice.actions;
export default messageSlice.reducer;
