'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { listBanners, type ListBannersParams } from '@/components/banner/services/banners.service';

// Paginated/searchable banner list. keepPreviousData avoids a flash of empty
// table while a new page/search loads.
export function useBanners(params: ListBannersParams) {
  return useQuery({
    queryKey: ['banners', params],
    queryFn: () => listBanners(params),
    placeholderData: keepPreviousData,
    // No sockets: refetch on every navigation to the Webinar/Banner tab so the
    // list reflects the latest banners (previous page stays visible meanwhile).
    refetchOnMount: 'always',
  });
}
