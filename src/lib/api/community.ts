import axiosInstance from '@/lib/axios';
import type { CommunityVM } from '@/types/dashboard';

// Communities are created and owned by the admin module; the RA only reads them.
const BASE = '/api/v1/admin/community';

// A sub-community as returned nested inside its parent community.
export interface SubCommunity {
  _id: string;
  community_id: string;
  name: string;
  status: string;
}

// A community as returned by the admin backend (Mongo _id + string ids). The
// RA gates sending against `_id` (must be in the RA's assigned_communities),
// and sends to `sub_communities[]._id` as the sub_community_id.
export interface Community {
  _id: string;
  id: string;
  name: string;
  description: string;
  icon_url: string;
  status: string;
  total_users: number;
  sub_communities: SubCommunity[];
}

// get-communities uses its own envelope (`status`/`communities`) rather than the
// shared ApiResponse shape, so it is typed locally here.
interface GetCommunitiesResponse {
  status: boolean;
  message: string;
  communities: Community[];
}

export async function getCommunities(): Promise<Community[]> {
  const { data } = await axiosInstance.get<GetCommunitiesResponse>(
    `${BASE}/get-communities`
  );
  if (!data.status) {
    throw new Error(data.message || 'Failed to load communities');
  }
  return data.communities;
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
      members: '',
      type: s.status,
    })),
  };
}
