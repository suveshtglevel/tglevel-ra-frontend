import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CommunityVM } from '@/types/dashboard';

interface CommunityState {
  communities: CommunityVM[];
  // Backend Mongo ids of the open chat. Null until communities load.
  selectedCommunityId: string | null;
  selectedSubCommunityId: string | null;
}

const initialState: CommunityState = {
  communities: [],
  selectedCommunityId: null,
  selectedSubCommunityId: null,
};

// Pick the first community's first sub-community (or the community itself when
// it has no subs) as the default open chat.
function defaultSelection(communities: CommunityVM[]) {
  const first = communities[0];
  return {
    communityId: first?.id ?? null,
    subCommunityId: first?.subCommunities?.[0]?.id ?? null,
  };
}

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    // Load the fetched (already adapted + gated) community list. Keeps the
    // current selection if it still exists; otherwise falls back to the default.
    setCommunities: (state, action: PayloadAction<CommunityVM[]>) => {
      state.communities = action.payload;
      const stillValid = action.payload.some((c) => c.id === state.selectedCommunityId);
      if (!stillValid) {
        const next = defaultSelection(action.payload);
        state.selectedCommunityId = next.communityId;
        state.selectedSubCommunityId = next.subCommunityId;
      }
    },
    selectCommunity: (state, action: PayloadAction<string>) => {
      state.selectedCommunityId = action.payload;
      state.selectedSubCommunityId = null;
    },
    selectSubCommunity: (state, action: PayloadAction<string>) => {
      state.selectedSubCommunityId = action.payload;
      const parent = state.communities.find((c) =>
        c.subCommunities?.some((s) => s.id === action.payload)
      );
      if (parent) {
        state.selectedCommunityId = parent.id;
      }
    },
  },
});

export const { setCommunities, selectCommunity, selectSubCommunity } = communitySlice.actions;
export default communitySlice.reducer;
