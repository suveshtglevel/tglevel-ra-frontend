import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  // Backend community ids this RA may post to. The RA can view every community
  // but may only send messages where the community id is in this list.
  assignedCommunities?: string[];
}

// 'pending' until the app has tried to restore a session (silent refresh) on
// load; guards wait for this before deciding to redirect.
export type AuthStatus = 'pending' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: 'pending',
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.status = 'authenticated';
    },
    // Patch fields on the current user (e.g. after a profile-image upload).
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // Session bootstrap finished with no valid session (or the user logged out).
    setUnauthenticated: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'unauthenticated';
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'unauthenticated';
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, updateUser, setUnauthenticated, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
