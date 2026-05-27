import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

interface MessageState {
  messages: Record<number, ChatMessage[]>;
}

// Dummy messages per community
const now = new Date();
const fmt = (h: number, m: number) => {
  const period = h >= 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : h;
  return `${hr}:${m.toString().padStart(2, '0')} ${period}`;
};

const INITIAL_MESSAGES: Record<number, ChatMessage[]> = {
  1: [
    {
      id: 'msg-1-1',
      communityId: 1,
      content: '',
      type: 'received',
      timestamp: fmt(10, 45),
      status: 'read',
      sender: 'RA Admin',
    },
  ],
  2: [
    {
      id: 'msg-2-1',
      communityId: 2,
      content: '<p><b>RELIANCE 2900 CE</b> - Strong breakout above resistance. Entry at 42, SL 36, Target 50/58.</p>',
      type: 'received',
      timestamp: fmt(10, 38),
      status: 'read',
      sender: 'RA Admin',
    },
  ],
  3: [
    {
      id: 'msg-3-1',
      communityId: 3,
      content: '<p><b>GOLD MINI FUT</b> - Bullish momentum continues. Entry 71500, SL 71200, Target 71900/72300.</p>',
      type: 'received',
      timestamp: fmt(10, 30),
      status: 'read',
      sender: 'RA Admin',
    },
  ],
  4: [
    {
      id: 'msg-4-1',
      communityId: 4,
      content: '<p><b>TATAMOTORS Positional</b> - Buy at 980, SL 940, Target 1040/1100. Strong support at 960 zone.</p>',
      type: 'received',
      timestamp: fmt(9, 45),
      status: 'read',
      sender: 'RA Admin',
    },
  ],
  5: [
    {
      id: 'msg-5-1',
      communityId: 5,
      content: '<p>Weekly market outlook: Nifty expected to trade in range 24000-24700. Key support at 24100, resistance at 24500.</p>',
      type: 'received',
      timestamp: fmt(8, 15),
      status: 'read',
      sender: 'RA Admin',
    },
  ],
  6: [
    {
      id: 'msg-6-1',
      communityId: 6,
      content: '<p><b>Premium Call:</b> HDFCBANK 1700 CE - Entry 28, SL 22, Target 36/44. High confidence setup.</p>',
      type: 'received',
      timestamp: fmt(10, 20),
      status: 'read',
      sender: 'RA Admin',
    },
  ],
};

const initialState: MessageState = {
  messages: INITIAL_MESSAGES,
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
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const period = h >= 12 ? 'PM' : 'AM';
      const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const timestamp = `${hr}:${m.toString().padStart(2, '0')} ${period}`;

      const newMsg: ChatMessage = {
        id: `msg-${communityId}-${Date.now()}`,
        communityId,
        content,
        type: 'sent',
        messageType,
        group,
        notifyUsers,
        timestamp,
        status: 'sent',
        sender: 'You',
      };

      if (!state.messages[communityId]) {
        state.messages[communityId] = [];
      }
      state.messages[communityId].push(newMsg);

      // Simulate delivery after adding
      setTimeout(() => {}, 0);
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

export const { sendMessage, updateMessageStatus } = messageSlice.actions;
export default messageSlice.reducer;
