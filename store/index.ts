import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import communityReducer from './slices/communitySlice';
import messageReducer from './slices/messageSlice';
import tradeJournalReducer from './slices/tradeJournalSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    community: communityReducer,
    messages: messageReducer,
    tradeJournal: tradeJournalReducer,
  },
  // All slices hold only serializable data (strings / numbers / plain objects),
  // so the default middleware — including the serializability dev check — is
  // kept rather than disabled, restoring the guard against accidentally storing
  // non-serializable values.
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
