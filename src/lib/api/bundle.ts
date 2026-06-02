import axiosInstance from '@/lib/axios';

// Bundles are RA-owned groupings of sub-communities within ONE assigned
// community. Sending to a bundle broadcasts to every sub-community in it.
const BASE = '/api/v1/ra/bundle';

// A bundle as returned by get-bundles: keyed by the UUID `bundle_id`, with its
// member sub-communities listed under `sub_communities` (sub_community_id[]).
export interface Bundle {
  _id: string;
  bundle_id?: string;
  name: string;
  status: string;
  community_id: string;
  subCommunities_Ids: string[];
  sub_communities?: string[];
}

// create-bundle request body. The backend still names the ids field
// `subCommunities_Ids` on the way in (responses use `sub_communities`).
export interface CreateBundlePayload {
  name: string;
  status: string;
  subCommunities_Ids: string[];
  community_id: string;
}

interface CreateBundleResponse {
  success: boolean;
  message: string;
  bundle: Bundle;
}

interface GetBundlesResponse {
  success: boolean;
  message: string;
  bundles: Bundle[];
}

export async function createBundle(payload: CreateBundlePayload): Promise<Bundle> {
  const { data } = await axiosInstance.post<CreateBundleResponse>(
    `${BASE}/create-bundle`,
    payload
  );
  if (!data.success) {
    throw new Error(data.message || 'Failed to create bundle');
  }
  return data.bundle;
}

export async function getBundles(): Promise<Bundle[]> {
  const { data } = await axiosInstance.get<GetBundlesResponse>(`${BASE}/get-bundles`);
  if (!data.success) {
    throw new Error(data.message || 'Failed to load bundles');
  }
  return data.bundles ?? [];
}
