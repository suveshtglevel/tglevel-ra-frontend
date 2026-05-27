import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { COMMUNITIES, Community } from '@/constants/mockData';

interface CommunityState {
  communities: Community[];
  selectedCommunityId: number;
}

const initialState: CommunityState = {
  communities: COMMUNITIES,
  selectedCommunityId: COMMUNITIES[0]?.id ?? 0,
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    selectCommunity: (state, action: PayloadAction<number>) => {
      state.selectedCommunityId = action.payload;
    },
  },
});

export const { selectCommunity } = communitySlice.actions;
export default communitySlice.reducer;
