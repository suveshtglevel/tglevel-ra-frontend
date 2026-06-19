// View-model shapes the dashboard UI renders. These are adapted from the
// admin-owned backend community payload (see src/lib/api/community.ts). IDs are
// backend Mongo string ids: a community's `id` is its `_id` (used as
// community_id when sending), and a sub-community's `id` is its `_id` (used as
// sub_community_id). `sendable` is true only when the RA is assigned to it.

export interface SubCommunityVM {
  id: string;
  name: string;
  members: string;
  // No Free/Paid concept on the backend; we surface the sub's status here.
  type: string;
  // Sub-communities have no icon of their own — they reuse the parent
  // community's `icon_url`.
  iconUrl?: string;
}

export interface CommunityVM {
  id: string;       // community_id (UUID) — used in send-message / get-messages
  _id: string;      // Mongo ObjectId — matches assigned_communities from login
  name: string;
  members: string;
  time: string;
  views: string;
  pinned: string;
  // Community icon from the backend (`icon_url`); may be absent.
  iconUrl?: string;
  // The RA can view every community but may only send to assigned ones.
  sendable: boolean;
  subCommunities?: SubCommunityVM[];
}

// A saved bundle as the composer consumes it: a named set of sub-community ids
// (`subIds`) within one parent community (`communityId` = backend community _id).
export interface BundleVM {
  id: string;
  name: string;
  communityId: string;
  subIds: string[];
}
