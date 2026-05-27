import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { COMMUNITIES, Community } from '@/constants/mockData';

interface CommunityState {
  communities: Community[];
  selectedCommunityId: number;
  selectedSubCommunityId: number | null;
}

// Chats only exist for sub-communities, so open the first community's
// first sub-community by default (never a main community chat).
const firstCommunity = COMMUNITIES[0];
const initialState: CommunityState = {
  communities: COMMUNITIES,
  selectedCommunityId: firstCommunity?.id ?? 0,
  selectedSubCommunityId: firstCommunity?.subCommunities?.[0]?.id ?? null,
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    selectCommunity: (state, action: PayloadAction<number>) => {
      state.selectedCommunityId = action.payload;
      state.selectedSubCommunityId = null;
    },
    selectSubCommunity: (state, action: PayloadAction<number>) => {
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

export const { selectCommunity, selectSubCommunity } = communitySlice.actions;
export default communitySlice.reducer;
