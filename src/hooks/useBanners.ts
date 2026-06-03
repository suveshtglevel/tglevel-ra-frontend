'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { listBanners, type ListBannersParams } from '@/lib/api/banners';

// Paginated/searchable banner list. keepPreviousData avoids a flash of empty
// table while a new page/search loads.
export function useBanners(params: ListBannersParams) {
  return useQuery({
    queryKey: ['banners', params],
    queryFn: () => listBanners(params),
    placeholderData: keepPreviousData,
  });
}
