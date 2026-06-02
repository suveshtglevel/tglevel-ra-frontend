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
// Keyed by `sub_community_id` — used when sending.
export interface SubCommunity {
  sub_community_id: string;
  name: string;
  status: string;
  users: number;
  author?: CommunityAuthor;
}

// A community as returned by the RA backend.
// `community_id` is the UUID-style id (e.g. "com_51fc75e5-...") used in
// send-message / get-messages payloads.
export interface Community {
  community_id: string;
  name: string;
  description: string;
  icon_url: string;
  status: string;
  total_users: number;
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

// Adapt a backend community to the dashboard view-model.
export function toCommunityVM(c: Community, assigned: string[]): CommunityVM {
  return {
    id: c.community_id,
    _id: c.community_id,
    name: c.name,
    members: formatCount(c.total_users),
    time: '',
    views: String(c.total_users ?? ''),
    pinned: '',
    sendable: assigned.includes(c.community_id),
    subCommunities: c.sub_communities?.map((s) => ({
      id: s.sub_community_id,
      name: s.name,
      members: formatCount(s.users),
      type: s.status,
    })),
  };
}
