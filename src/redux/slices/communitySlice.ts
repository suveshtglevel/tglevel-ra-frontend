import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { COMMUNITIES, Community } from '@/constants/mockData';

interface CommunityState {
  communities: Community[];
  selectedCommunityId: number;
  selectedSubCommunityId: number | null;
}

const initialState: CommunityState = {
  communities: COMMUNITIES,
  selectedCommunityId: COMMUNITIES[0]?.id ?? 0,
  selectedSubCommunityId: null,
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
