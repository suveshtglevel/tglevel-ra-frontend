'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBanner } from '@/lib/api/banners';

// Creates a banner via the multipart create-banner endpoint, then refreshes the
// banner list. Toasts are left to the caller so it can show a status-aware
// message (published / scheduled / draft).
export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBanner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
  });
}
