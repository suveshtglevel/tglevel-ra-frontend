import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import communityReducer from '../slices/communitySlice';
import messageReducer from '../slices/messageSlice';
import tradeJournalReducer from '../slices/tradeJournalSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    community: communityReducer,
    messages: messageReducer,
    tradeJournal: tradeJournalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
