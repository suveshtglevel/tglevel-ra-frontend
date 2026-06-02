import axiosInstance from '@/lib/axios';
import type { CommunityVM } from '@/types/dashboard';

// RA-readable community list. Requires the bearer access token (attached by the
// axios interceptor from the verify-otp response).
const BASE = '/api/v1/ra/community';

export interface CommunityAuthor {
  _id: string;
  display_name: string;
}

// A sub-community as returned nested inside its parent community.
export interface SubCommunity {
  _id: string;
  name: string;
  status: string;
  users: number;
  author?: CommunityAuthor;
}

// A community as returned by the RA backend. The RA gates sending against `_id`
// (must be in the RA's assigned_communities) and sends to `sub_communities[]._id`
// as the sub_community_id.
export interface Community {
  _id: string;
  name: string;
  description: string;
  icon_url: string;
  status: string;
  total_users: number;
  community_id: string;
  sub_communities: SubCommunity[];
  author?: CommunityAuthor;
}

interface GetCommunitiesResponse {
  success: boolean;
  message: string;
  data: Community[];
}

export async function getCommunities(): Promise<Community[]> {
  const { data } = await axiosInstance.get<GetCommunitiesResponse>(
    `${BASE}/get-communities`
  );
  if (!data.success) {
    throw new Error(data.message || 'Failed to load communities');
  }
  return data.data ?? [];
}

// Compact member-count label (1234 -> "1.2k").
function formatCount(n: number): string {
  if (!n || n < 1000) return String(n ?? 0);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
}

// Adapt a backend community to the dashboard view-model. `assigned` is the RA's
// assigned_communities list; a community is sendable only when its `_id` is in it.
export function toCommunityVM(c: Community, assigned: string[]): CommunityVM {
  return {
    id: c._id,
    name: c.name,
    members: formatCount(c.total_users),
    time: '',
    views: String(c.total_users ?? ''),
    pinned: '',
    sendable: assigned.includes(c._id),
    subCommunities: c.sub_communities?.map((s) => ({
      id: s._id,
      name: s.name,
      members: formatCount(s.users),
      type: s.status,
    })),
  };
}
