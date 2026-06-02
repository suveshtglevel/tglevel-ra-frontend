import axiosInstance from '@/lib/axios';

// Bundles are RA-owned groupings of sub-communities within ONE assigned
// community. Sending to a bundle broadcasts to every sub-community in it.
const BASE = '/api/v1/ra/bundle';

export interface Bundle {
  _id: string;
  bundle_id: string;
  name: string;
  status: string;
  community_id: string;
  subCommunities_Ids: string[];
  author_id: string;
  createdAt: string;
  updatedAt: string;
}

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
